export interface SalesRecord {
  id: string;
  date: Date;
  product: string;
  category: string;
  region: string;
  revenue: number;
  units: number;
  customers: number;
  discount: number;
  marketing_spend: number;
}

export interface ForecastResult {
  model: ModelType;
  predictions: number[];
  lower_bound: number[];
  upper_bound: number[];
  metrics: {
    rmse: number;
    mae: number;
    mape: number;
    r2?: number;
  };
  importance?: FeatureImportance[];
  trainingSize?: number;
  crossValidationScores?: number[];
  parameters?: Record<string, number>;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface TimeSeriesData {
  data: DataPoint[];
  forecast?: ForecastResult;
}

export interface DataGeneratorConfig {
  startDate: Date;
  endDate: Date;
  frequency: 'daily' | 'weekly' | 'monthly';
  seasonality: number;
  trend: number;
  noise: number;
  outliers: number;
}

export interface Metrics {
  totalRevenue: number;
  totalUnits: number;
  totalCustomers: number;
  avgOrderValue: number;
  growthRate: number;
}

export type ModelType = 'exponential-smoothing' | 'linear-regression' | 'moving-average' | 'ensemble' | 'arima' | 'prophet';

export interface ForecastConfig {
  model: ModelType;
  periods: number;
  confidence: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats?: {
    count: number;
    mean: number;
    min: number;
    max: number;
    variance: number;
  };
}

export interface DataSeries {
  id: string;
  name: string;
  data: DataPoint[];
  color?: string;
}