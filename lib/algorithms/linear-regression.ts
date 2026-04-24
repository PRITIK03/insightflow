import { ForecastResult } from '@/types';
import { Matrix } from 'ml-matrix';

interface RegressionResult {
  coefficients: number[];
  intercept: number;
}

export function linearRegression(
  data: number[],
  periods: number,
  confidence: number = 0.95
): ForecastResult {
  const n = data.length;
  if (n < 2) {
    return createEmptyForecast('linear-regression', periods);
  }

  const features = generateFeatures(data);
  const regression = fitRegression(features, data);
  
  const fitted: number[] = [];
  for (const row of features) {
    let prediction = regression.intercept;
    for (let i = 0; i < regression.coefficients.length; i++) {
      prediction += row[i + 1] * regression.coefficients[i];
    }
    fitted.push(prediction);
  }
  
  const forecast: number[] = [];
  const lower_bound: number[] = [];
  const upper_bound: number[] = [];
  
  const lastFeatures = generateForecastFeatures(n, periods);
  const variance = calculateVariance(data, fitted);
  const se = Math.sqrt(variance);
  const z = confidenceInterval(confidence);
  
  for (let h = 1; h <= periods; h++) {
    const feat = lastFeatures[h - 1];
    let prediction = regression.intercept;
    for (let i = 0; i < regression.coefficients.length; i++) {
      prediction += feat[i + 1] * regression.coefficients[i];
    }
    
    const forecastError = se * Math.sqrt(1 + 1/n + Math.pow((h - n), 2) / varianceX(features));
    forecast.push(prediction);
    lower_bound.push(prediction - z * forecastError);
    upper_bound.push(prediction + z * forecastError);
  }
  
  const metrics = calculateMetrics(data, fitted);
  
  return {
    model: 'linear-regression',
    predictions: forecast,
    lower_bound,
    upper_bound,
    metrics,
    importance: calculateFeatureImportance(regression.coefficients)
  };
}

function generateFeatures(data: number[]): number[][] {
  const n = data.length;
  const features: number[][] = [];
  
  for (let t = 0; t < n; t++) {
    const row: number[] = [1];
    row.push(t);
    row.push(t * t);
    
    const dayOfYear = (t % 365) / 365;
    row.push(Math.sin(2 * Math.PI * dayOfYear));
    row.push(Math.cos(2 * Math.PI * dayOfYear));
    
    const month = ((t % 30) / 30);
    row.push(Math.sin(2 * Math.PI * month));
    row.push(Math.cos(2 * Math.PI * month));
    
    if (t >= 7) {
      const lag7 = data[t - 7];
      row.push(lag7);
      let sum7 = 0;
      for (let i = 1; i <= 7; i++) sum7 += data[t - i];
      row.push(sum7 / 7);
      let sum30 = 0;
      for (let i = 1; i <= 30 && t - i >= 0; i++) sum30 += data[t - i];
      row.push(sum30 / Math.min(30, t));
    } else {
      row.push(0, 0, 0);
    }
    
    features.push(row);
  }
  
  return features;
}

function generateForecastFeatures(startIdx: number, periods: number): number[][] {
  const features: number[][] = [];
  
  for (let h = 1; h <= periods; h++) {
    const t = startIdx + h;
    const row: number[] = [1];
    row.push(t);
    row.push(t * t);
    
    const dayOfYear = (t % 365) / 365;
    row.push(Math.sin(2 * Math.PI * dayOfYear));
    row.push(Math.cos(2 * Math.PI * dayOfYear));
    
    const month = ((t % 30) / 30);
    row.push(Math.sin(2 * Math.PI * month));
    row.push(Math.cos(2 * Math.PI * month));
    
    row.push(0, 0, 0);
    features.push(row);
  }
  
  return features;
}

function fitRegression(features: number[][], data: number[]): RegressionResult {
  const X = new Matrix(features);
  const y = Matrix.columnVector(data);

  const Xt = X.transpose();
  const XtX = Xt.mmul(X);
  const XtXInv = XtX.inverse();
  const XtXInvXt = XtXInv.mmul(Xt);
  const beta = XtXInvXt.mmul(y);

  return {
    coefficients: beta.subMatrix(1, beta.rows - 1, 0, 0).to1DArray(),
    intercept: beta.get(0, 0)
  };
}

function varianceX(features: number[][]): number {
  const n = features.length;
  const k = features[0].length - 1;
  let sum = 0;

  for (const row of features) {
    sum += Math.pow(row[1] - (n - 1) / 2, 2);
  }

  return sum / n;
}

function calculateVariance(actual: number[], fitted: number[]): number {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < actual.length; i++) {
    sum += Math.pow(actual[i] - fitted[i], 2);
    count++;
  }
  return count > 0 ? sum / count : 1;
}

function confidenceInterval(confidence: number): number {
  if (confidence >= 0.99) return 2.576;
  if (confidence >= 0.95) return 1.96;
  if (confidence >= 0.90) return 1.645;
  if (confidence >= 0.80) return 1.28;
  return 1.0;
}

function calculateMetrics(actual: number[], fitted: number[]): { rmse: number; mae: number; mape: number } {
  let rmseSum = 0;
  let maeSum = 0;
  let mapeSum = 0;
  let count = 0;

  for (let i = 0; i < actual.length && i < fitted.length; i++) {
    rmseSum += Math.pow(actual[i] - fitted[i], 2);
    maeSum += Math.abs(actual[i] - fitted[i]);
    if (actual[i] !== 0) {
      mapeSum += Math.abs((actual[i] - fitted[i]) / actual[i]);
    }
    count++;
  }

  return {
    rmse: count > 0 ? Math.sqrt(rmseSum / count) : 0,
    mae: count > 0 ? maeSum / count : 0,
    mape: count > 0 ? (mapeSum / count) * 100 : 0
  };
}

function calculateFeatureImportance(coefficients: number[]): { feature: string; importance: number }[] {
  const names = ['t', 't²', 'sin(day)', 'cos(day)', 'sin(month)', 'cos(month)', 'lag7', 'ma7', 'ma30'];
  const total = coefficients.reduce((sum, c) => sum + Math.abs(c), 0);

  return coefficients.slice(0, names.length).map((c, i) => ({
    feature: names[i] || `x${i}`,
    importance: total > 0 ? Math.abs(c) / total : 0
  }));
}

function createEmptyForecast(model: ForecastResult['model'], periods: number): ForecastResult {
  return {
    model,
    predictions: new Array(periods).fill(0),
    lower_bound: new Array(periods).fill(0),
    upper_bound: new Array(periods).fill(0),
    metrics: { rmse: 0, mae: 0, mape: 0 }
  };
}

