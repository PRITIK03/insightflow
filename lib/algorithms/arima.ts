import { ForecastResult, DataPoint } from '@/types';

interface ARIMAModel {
  ar: number[];
  ma: number[];
  drift: number;
  sigma2: number;
}

export function arima(
  data: number[],
  periods: number = 30,
  confidence: number = 0.95
): ForecastResult {
  const p = 2;
  const d = 1;
  const q = 2;
  
  const differenced = difference(data, d);
  const model = fitARIMA(differenced, p, q);
  const forecasts = forecastARIMA(data, model, periods, confidence);
  
  return {
    model: 'arima',
    predictions: forecasts.predictions,
    lower_bound: forecasts.lower_bound,
    upper_bound: forecasts.upper_bound,
    metrics: calculateMetrics(data, forecasts.predictions),
    parameters: { p, d, q },
    trainingSize: data.length
  };
}

function difference(values: number[], d: number): number[] {
  let result = [...values];
  
  for (let i = 0; i < d; i++) {
    const newResult: number[] = [];
    for (let j = 1; j < result.length; j++) {
      const curr = result[j];
      const prev = result[j - 1];
      if (curr !== undefined && prev !== undefined) {
        newResult.push(curr - prev);
      }
    }
    result = newResult;
  }
  
  return result;
}

function differenceInverse(values: number[], original: number[], d: number): number[] {
  let result = [...values];
  
  for (let i = 0; i < d; i++) {
    const newResult: number[] = [];
    const originalSlice = [...original];
    
    for (let j = 0; j < result.length; j++) {
      const currVal = result[j];
      if (currVal === undefined) continue;
      
      const prevIdx = Math.max(0, originalSlice.length - result.length + j);
      const prevOrig = originalSlice[prevIdx];
      const prevValue = j === 0 
        ? (prevOrig ?? 0) 
        : (newResult[j - 1] ?? 0);
      
      if (prevValue !== undefined) {
        newResult.push(currVal + prevValue);
      }
    }
    result = newResult;
  }
  
  return result;
}

function fitARIMA(data: number[], p: number, q: number): ARIMAModel {
  const n = data.length;
  
  if (n < p + q + 5) {
    return {
      ar: new Array(p).fill(0.1),
      ma: new Array(q).fill(0.1),
      drift: 0,
      sigma2: calculateVariance(data)
    };
  }

  const ar = estimateARCoefs(data, p);
  const residuals = calculateResiduals(data, ar, new Array(q).fill(0.1));
  const ma = estimateMACoefs(residuals, q);
  
  const firstData = data[0];
  const drift = data.slice(1).reduce((sum, v, i) => {
    const prevData = data[i];
    return sum + (prevData !== undefined ? v - prevData : 0);
  }, 0) / (n - 1);
  
  const sigma2 = residuals.reduce((sum, r) => sum + r * r, 0) / n;
  
  return { ar, ma, drift, sigma2 };
}

function estimateARCoefs(data: number[], p: number): number[] {
  const n = data.length;
  const mean = data.reduce((a, b) => a + b, 0) / n;
  
  const acf: number[] = [];
  for (let lag = 0; lag <= p; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) {
      sum += (data[i] - mean) * (data[i + lag] - mean);
    }
    acf.push(sum / n);
  }
  
  const gamma = acf.slice(0, p + 1);
  const gammaMatrix: number[][] = [];
  
  for (let i = 0; i < p; i++) {
    const row: number[] = [];
    for (let j = 0; j < p; j++) {
      row.push(gamma[Math.abs(i - j)]);
    }
    gammaMatrix.push(row);
  }
  
  const phi = solveLinearSystem(gammaMatrix, gamma.slice(1));
  
  return phi.length === p ? phi : new Array(p).fill(0.1);
}

function estimateMACoefs(residuals: number[], q: number): number[] {
  const n = residuals.length;
  
  if (n < q + 5) {
    return new Array(q).fill(0.1);
  }
  
  const autocorr: number[] = [];
  const mean = residuals.reduce((a, b) => a + b, 0) / n;
  
  for (let lag = 1; lag <= q; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) {
      sum += (residuals[i] - mean) * (residuals[i + lag] - mean);
    }
    autocorr.push(sum / n);
  }
  
  const variance = residuals.reduce((sum, r) => sum + (r - mean) ** 2, 0) / n;
  
  if (variance === 0) {
    return new Array(q).fill(0.1);
  }
  
  return autocorr.map(a => a / variance).slice(0, q);
}

function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }
    
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    [b[i], b[maxRow]] = [b[maxRow], b[i]];
    
    if (Math.abs(A[i][i]) < 1e-10) {
      continue;
    }
    
    for (let k = i + 1; k < n; k++) {
      const factor = A[k][i] / A[i][i];
      for (let j = i; j < n; j++) {
        A[k][j] -= factor * A[i][j];
      }
      b[k] -= factor * b[i];
    }
  }
  
  const x: number[] = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    if (Math.abs(A[i][i]) < 1e-10) {
      x[i] = 0;
    } else {
      x[i] = b[i];
      for (let j = i + 1; j < n; j++) {
        x[i] -= A[i][j] * x[j];
      }
      x[i] /= A[i][i];
    }
  }
  
  return x;
}

function calculateResiduals(data: number[], ar: number[], ma: number[]): number[] {
  const n = data.length;
  const residuals: number[] = [0];
  
  for (let t = 1; t < n; t++) {
    let arSum = 0;
    for (let i = 0; i < ar.length; i++) {
      if (t - 1 - i >= 0) {
        arSum += ar[i] * data[t - 1 - i];
      }
    }
    
    let maSum = 0;
    for (let i = 0; i < ma.length; i++) {
      if (t - 1 - i >= 0 && residuals[t - 1 - i] !== undefined) {
        maSum += ma[i] * residuals[t - 1 - i];
      }
    }
    
    const expected = arSum + maSum;
    residuals.push(data[t] - expected);
  }
  
  return residuals;
}

function forecastARIMA(
  original: number[],
  model: ARIMAModel,
  periods: number,
  confidence: number
): { predictions: number[]; lower_bound: number[]; upper_bound: number[] } {
  const n = original.length;
  const predictions: number[] = [];
  
  const mean = original.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(model.sigma2);
  const zScore = confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.576 : 1.645;
  
  const lastValues = original.slice(-Math.max(model.ar.length, 1));
  const lastResiduals: number[] = [];
  
  for (let h = 1; h <= periods; h++) {
    let forecast = mean + model.drift * h;
    
    for (let i = 0; i < model.ar.length; i++) {
      const idx = lastValues.length - 1 - i;
      if (idx >= 0) {
        forecast += model.ar[i] * lastValues[idx];
      }
    }
    
    for (let i = 0; i < model.ma.length; i++) {
      const idx = lastResiduals.length - 1 - i;
      if (idx >= 0) {
        forecast += model.ma[i] * lastResiduals[idx];
      }
    }
    
    predictions.push(forecast);
    lastResiduals.push(forecast - mean);
  }
  
  const lower_bound = predictions.map(
    (p, i) => p - zScore * std * Math.sqrt(1 + i * 0.1)
  );
  const upper_bound = predictions.map(
    (p, i) => p + zScore * std * Math.sqrt(1 + i * 0.1)
  );
  
  return { predictions, lower_bound, upper_bound };
}

function calculateMetrics(
  actual: number[],
  predictions: number[]
): { rmse: number; mae: number; mape: number; r2?: number } {
  const n = actual.length;
  if (n === 0) {
    return { rmse: 0, mae: 0, mape: 0 };
  }
  
  const testSize = Math.min(predictions.length, n);
  const actualSlice = actual.slice(-testSize);
  const predSlice = predictions.slice(-testSize);
  
  let sumSquaredError = 0;
  let sumAbsoluteError = 0;
  let sumAbsolutePercentError = 0;
  
  for (let i = 0; i < testSize; i++) {
    const error = actualSlice[i] - predSlice[i];
    sumSquaredError += error * error;
    sumAbsoluteError += Math.abs(error);
    
    if (actualSlice[i] !== 0) {
      sumAbsolutePercentError += Math.abs(error / actualSlice[i]);
    }
  }
  
  const mean = actualSlice.reduce((a, b) => a + b, 0) / testSize;
  let sumSquaredMean = 0;
  for (let i = 0; i < testSize; i++) {
    sumSquaredMean += (actualSlice[i] - mean) ** 2;
  }
  
  const r2 = sumSquaredMean !== 0 ? 1 - sumSquaredError / sumSquaredMean : undefined;
  
  return {
    rmse: Math.sqrt(sumSquaredError / testSize),
    mae: sumAbsoluteError / testSize,
    mape: (sumAbsolutePercentError / testSize) * 100,
    r2
  };
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
}

export function crossValidate(
  data: number[],
  config: { periods: number; confidence: number }
): number[] {
  const validationSize = Math.min(30, Math.floor(data.length * 0.2));
  const scores: number[] = [];
  
  for (let i = 0; i < 3; i++) {
    const trainEnd = data.length - validationSize * (i + 1);
    if (trainEnd < validationSize) break;
    
    const trainData = data.slice(0, trainEnd);
    const testData = data.slice(trainEnd, trainEnd + validationSize);
    
    const result = arima(trainData, validationSize, config.confidence);
    
    let sumSquaredError = 0;
    for (let j = 0; j < testData.length; j++) {
      const error = testData[j] - result.predictions[j];
      sumSquaredError += error * error;
    }
    
    scores.push(Math.sqrt(sumSquaredError / testData.length));
  }
  
  return scores;
}