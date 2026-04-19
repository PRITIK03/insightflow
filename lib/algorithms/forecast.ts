import { ForecastResult, ForecastConfig, DataPoint } from '@/types';
import { exponentialSmoothing } from './exponential-smoothing';
import { linearRegression } from './linear-regression';
import { movingAverage } from './moving-average';
import { arima, crossValidate } from './arima';

export function runForecast(
  data: DataPoint[],
  config: ForecastConfig
): ForecastResult {
  const values = data.map(d => d.value);
  
  switch (config.model) {
    case 'exponential-smoothing':
      return exponentialSmoothing(values, config.periods, config.confidence);
    case 'linear-regression':
      return linearRegression(values, config.periods, config.confidence);
    case 'moving-average':
      return movingAverage(values, config.periods, config.confidence);
    case 'arima':
      return arima(values, config.periods, config.confidence);
    case 'ensemble':
      return ensembleForecast(values, config);
    default:
      return exponentialSmoothing(values, config.periods, config.confidence);
  }
}

export function runCrossValidation(
  data: DataPoint[],
  config: ForecastConfig
): number[] {
  const values = data.map(d => d.value);
  
  switch (config.model) {
    case 'arima':
      return crossValidate(values, { periods: config.periods, confidence: config.confidence });
    case 'exponential-smoothing':
      return crossValidate(values, { periods: config.periods, confidence: config.confidence });
    default:
      return crossValidate(values, { periods: config.periods, confidence: config.confidence });
  }
}

function ensembleForecast(
  data: number[],
  config: ForecastConfig
): ForecastResult {
  const periods = config.periods;
  const es = exponentialSmoothing(data, periods, config.confidence);
  const lr = linearRegression(data, periods, config.confidence);
  const ma = movingAverage(data, periods, config.confidence);
  
  const predictions: number[] = [];
  const lower_bound: number[] = [];
  const upper_bound: number[] = [];
  
  const weights = calculateOptimalWeights(es, lr, ma);
  
  for (let i = 0; i < periods; i++) {
    const pred = 
      es.predictions[i] * weights[0] +
      lr.predictions[i] * weights[1] +
      ma.predictions[i] * weights[2];
    predictions.push(pred);
    
    const lower = 
      es.lower_bound[i] * weights[0] +
      lr.lower_bound[i] * weights[1] +
      ma.lower_bound[i] * weights[2];
    const upper = 
      es.upper_bound[i] * weights[0] +
      lr.upper_bound[i] * weights[1] +
      ma.upper_bound[i] * weights[2];
    lower_bound.push(lower);
    upper_bound.push(upper);
  }
  
  const metrics = calculateEnsembleMetrics(es, lr, ma, weights);
  
  return {
    model: 'ensemble',
    predictions,
    lower_bound,
    upper_bound,
    metrics
  };
}

function calculateOptimalWeights(
  es: ForecastResult,
  lr: ForecastResult,
  ma: ForecastResult
): number[] {
  const errors = [es.metrics.rmse + es.metrics.mae, lr.metrics.rmse + lr.metrics.mae, ma.metrics.rmse + ma.metrics.mae];
  const totalError = errors.reduce((a, b) => a + b, 0);
  
  if (totalError === 0) {
    return [0.33, 0.33, 0.34];
  }
  
  const weights = errors.map(e => 1 / (e + 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  
  return weights.map(w => w / totalWeight);
}

function calculateEnsembleMetrics(
  es: ForecastResult,
  lr: ForecastResult,
  ma: ForecastResult,
  weights: number[]
): { rmse: number; mae: number; mape: number } {
  const avgRMSE = es.metrics.rmse * weights[0] + lr.metrics.rmse * weights[1] + ma.metrics.rmse * weights[2];
  const avgMAE = es.metrics.mae * weights[0] + lr.metrics.mae * weights[1] + ma.metrics.mae * weights[2];
  const avgMAPE = es.metrics.mape * weights[0] + lr.metrics.mape * weights[1] + ma.metrics.mape * weights[2];
  
  return {
    rmse: avgRMSE,
    mae: avgMAE,
    mape: avgMAPE
  };
}

export function compareModels(
  data: DataPoint[],
  config: ForecastConfig
): ForecastResult[] {
  const models: ForecastResult[] = [];
  
  const testConfig = { ...config, model: 'exponential-smoothing' as const };
  models.push(runForecast(data, testConfig));
  
  const testConfig2 = { ...config, model: 'linear-regression' as const };
  models.push(runForecast(data, testConfig2));
  
  const testConfig3 = { ...config, model: 'moving-average' as const };
  models.push(runForecast(data, testConfig3));
  
  const testConfig4 = { ...config, model: 'arima' as const };
  models.push(runForecast(data, testConfig4));
  
  const testConfig5 = { ...config, model: 'ensemble' as const };
  models.push(runForecast(data, testConfig5));
  
  return models;
}

export function getBestModel(results: ForecastResult[]): ForecastResult {
  let best = results[0];
  
  for (const result of results) {
    if (result.metrics.rmse < best.metrics.rmse) {
      best = result;
    }
  }
  
  return best;
}