import { DataPoint, DataGeneratorConfig } from '@/types';

export function generateSalesData(config: DataGeneratorConfig): DataPoint[] {
  const { startDate, endDate, frequency, seasonality, trend, noise, outliers } = config;
  
  const data: DataPoint[] = [];
  let currentDate = new Date(startDate);
  let dayCounter = 0;
  const baseValue = 10000;
  
  while (currentDate <= endDate) {
    const t = dayCounter;
    
    const seasonalComponent = Math.sin(2 * Math.PI * t / 365 * seasonality) * 0.3 +
                         Math.cos(2 * Math.PI * t / 30) * 0.15;
    
    const trendComponent = trend * t * 10;
    
    const dayOfWeek = new Date(currentDate).getDay();
    const dayOfWeekEffect = dayOfWeek === 0 || dayOfWeek === 6 ? -0.2 : 0;
    
    let value = baseValue + seasonalComponent * baseValue + trendComponent + dayOfWeekEffect * baseValue;
    
    const noiseValue = (Math.random() - 0.5) * 2 * noise * baseValue;
    value += noiseValue;
    
    if (Math.random() < outliers) {
      const outlierDirection = Math.random() > 0.5 ? 1 : -1;
      value += outlierDirection * Math.random() * baseValue * 0.5;
    }
    
    value = Math.max(0, value);
    value = Math.round(value * 100) / 100;
    
    const dateStr = formatDate(currentDate, frequency);
    
    data.push({ date: dateStr, value });
    
    currentDate = incrementDate(currentDate, frequency);
    dayCounter++;
  }
  
  return data;
}

function formatDate(date: Date, frequency: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  switch (frequency) {
    case 'monthly':
      return `${year}-${month}`;
    case 'weekly':
      return `${year}-W${getWeekNumber(date)}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

function getWeekNumber(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 604800000;
  const week = Math.ceil(diff / oneWeek);
  return String(week).padStart(2, '0');
}

function incrementDate(date: Date, frequency: string): Date {
  const newDate = new Date(date);
  
  switch (frequency) {
    case 'monthly':
      newDate.setMonth(newDate.getMonth() + 1);
      break;
    case 'weekly':
      newDate.setDate(newDate.getDate() + 7);
      break;
    default:
      newDate.setDate(newDate.getDate() + 1);
  }
  
  return newDate;
}

export function generateSampleData(type: 'sales' | 'ecommerce' | 'metrics' = 'sales'): DataPoint[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  
  const config: DataGeneratorConfig = {
    startDate,
    endDate,
    frequency: 'daily',
    seasonality: type === 'sales' ? 1 : type === 'ecommerce' ? 0.8 : 0.5,
    trend: type === 'sales' ? 0.02 : type === 'ecommerce' ? 0.015 : 0.01,
    noise: type === 'sales' ? 0.1 : type === 'ecommerce' ? 0.15 : 0.08,
    outliers: 0.03
  };
  
  return generateSalesData(config);
}

export function aggregateData(
  data: DataPoint[],
  frequency: 'daily' | 'weekly' | 'monthly'
): DataPoint[] {
  if (frequency === 'daily') return data;
  
  const grouped: Record<string, number[]> = {};
  
  for (const point of data) {
    const key = aggregateKey(point.date, frequency);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(point.value);
  }
  
  const result: DataPoint[] = [];
  for (const key of Object.keys(grouped).sort()) {
    const values = grouped[key];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    result.push({ date: key, value: Math.round(avg * 100) / 100 });
  }
  
  return result;
}

function aggregateKey(date: string, frequency: string): string {
  if (frequency === 'monthly') {
    return date.substring(0, 7);
  }
  
  if (frequency === 'weekly') {
    return date.substring(0, 5) + '-W' + date.substring(6);
  }
  
  return date;
}

export function detectAnomalies(data: DataPoint[], threshold: number = 2): { date: string; value: number; anomaly: number }[] {
  const values = data.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  
  let sum = 0;
  for (const v of values) {
    sum += Math.pow(v - mean, 2);
  }
  const std = Math.sqrt(sum / values.length);
  
  const anomalies: { date: string; value: number; anomaly: number }[] = [];
  
  for (const point of data) {
    const zScore = std > 0 ? Math.abs(point.value - mean) / std : 0;
    if (zScore > threshold) {
      anomalies.push({
        date: point.date,
        value: point.value,
        anomaly: zScore
      });
    }
  }
  
  return anomalies;
}

export function calculateMetrics(data: DataPoint[]): {
  total: number;
  average: number;
  min: number;
  max: number;
  trend: number;
  growth: number;
} {
  const values = data.map(d => d.value);
  
  if (values.length === 0) {
    return { total: 0, average: 0, min: 0, max: 0, trend: 0, growth: 0 };
  }
  
  const total = values.reduce((a, b) => a + b, 0);
  const average = total / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  const recentCount = Math.min(30, Math.floor(values.length / 2));
  const recentAvg = values.slice(-recentCount).reduce((a, b) => a + b, 0) / recentCount;
  const olderAvg = values.slice(0, recentCount).reduce((a, b) => a + b, 0) / recentCount;
  const growth = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  const slope = calculateTrend(values);
  
  return {
    total: Math.round(total * 100) / 100,
    average: Math.round(average * 100) / 100,
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    trend: Math.round(slope * 100) / 100,
    growth: Math.round(growth * 100) / 100
  };
}

function calculateTrend(values: number[]): number {
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let x = 0; x < n; x++) {
    sumX += x;
    sumY += values[x];
    sumXY += x * values[x];
    sumX2 += x * x;
  }
  
  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return 0;
  
  return (n * sumXY - sumX * sumY) / denominator;
}