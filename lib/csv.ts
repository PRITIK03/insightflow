import { DataPoint, ValidationResult } from '@/types';

export function parseCSV(content: string): DataPoint[] {
  const lines = content.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header and one data row');
  }

  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const dateIndex = header.findIndex(h => h === 'date' || h === 'date' || h === 'timestamp');
  const valueIndex = header.findIndex(h => h === 'value' || h === 'revenue' || h === 'sales' || h === 'amount');

  if (dateIndex === -1 || valueIndex === -1) {
    throw new Error('CSV must contain "date" and "value" columns');
  }

  const data: DataPoint[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const dateStr = values[dateIndex];
    const valueStr = values[valueIndex];

    if (!dateStr || !valueStr) {
      errors.push(`Row ${i + 1}: Missing date or value`);
      continue;
    }

    const value = parseFloat(valueStr);
    if (isNaN(value)) {
      errors.push(`Row ${i + 1}: Invalid value "${valueStr}"`);
      continue;
    }

    const parsedDate = parseDate(dateStr);
    if (!parsedDate) {
      errors.push(`Row ${i + 1}: Invalid date format "${dateStr}"`);
      continue;
    }

    data.push({
      date: formatDateISO(parsedDate),
      value: Math.round(value * 100) / 100
    });
  }

  if (data.length === 0) {
    throw new Error('No valid data rows found in CSV');
  }

  return data;
}

function parseDate(dateStr: string): Date | null {
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/,
    /^(\d{4})\/(\d{2})\/(\d{2})$/,
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    /^(\d{4})-W(\d{2})$/,
    /^(\d{4})-(\d{2})$/
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0] || format === formats[2]) {
        return new Date(dateStr);
      }
      if (format === formats[1]) {
        const [_, y, m, d] = match;
        return new Date(`${y}-${m}-${d}`);
      }
      if (format === formats[3]) {
        const [_, m, d, y] = match;
        return new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
      }
      if (format === formats[4]) {
        return new Date(dateStr);
      }
      if (format === formats[5]) {
        return new Date(`${dateStr}-01`);
      }
    }
  }

  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function exportToCSV(data: DataPoint[], filename: string = 'forecast-data.csv'): string {
  const header = 'date,value';
  const rows = data.map(d => `${d.date},${d.value}`);
  
  return [header, ...rows].join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function validateData(data: DataPoint[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (data.length === 0) {
    errors.push('No data points provided');
    return { valid: false, errors, warnings };
  }

  if (data.length < 7) {
    warnings.push('Dataset is very small. At least 7 data points recommended for forecasting.');
  }

  const values = data.map(d => d.value);
  const hasNegative = values.some(v => v < 0);
  if (hasNegative) {
    warnings.push('Negative values detected. Some forecasting methods may not handle negative data well.');
  }

  const hasNulls = values.some(v => v === null || v === undefined || isNaN(v));
  if (hasNulls) {
    errors.push('Data contains null or invalid values');
  }

  const uniqueDates = new Set(data.map(d => d.date));
  if (uniqueDates.size !== data.length) {
    warnings.push('Duplicate dates detected. Data will be aggregated.');
  }

  const zeroCount = values.filter(v => v === 0).length;
  if (zeroCount > data.length * 0.2) {
    warnings.push('More than 20% of values are zero. This may affect forecast accuracy.');
  }

  const variance = calculateVariance(values);
  if (variance === 0) {
    errors.push('All values are identical. No forecasting possible.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      count: data.length,
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      variance
    }
  };
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}