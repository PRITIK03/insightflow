'use client';

import { DataPoint, ForecastResult } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { useMemo } from 'react';

interface TimeSeriesChartProps {
  data: DataPoint[];
  forecast?: ForecastResult;
  height?: number;
  showConfidence?: boolean;
}

export function TimeSeriesChart({ 
  data, 
  forecast, 
  height = 300,
  showConfidence = true 
}: TimeSeriesChartProps) {
  const chartData = useMemo(() => {
    const result = data.map((point, index) => ({
      date: point.date,
      value: point.value,
      index
    }));
    
    if (forecast && forecast.predictions.length > 0) {
      const lastDate = data[data.length - 1]?.date || '';
      const lastIndex = data.length;
      
      for (let i = 0; i < forecast.predictions.length; i++) {
        const dateOffset = i + 1;
        const futureDate = `+${dateOffset}`;
        
        result.push({
          date: futureDate,
          value: forecast.predictions[i],
          forecast: true,
          upper: showConfidence ? forecast.upper_bound[i] : undefined,
          lower: showConfidence ? forecast.lower_bound[i] : undefined
        });
      }
    }
    
    return result;
  }, [data, forecast, showConfidence]);
  
  const formatDate = (date: string) => {
    if (date.startsWith('+')) return date;
    if (date.includes('-W')) return date;
    if (date.length === 7) return date.slice(5);
    return date.slice(5);
  };
  
  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(0);
  };
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#3f3f46" 
          strokeOpacity={0.5} 
        />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          stroke="#71717a"
          fontSize={10}
          tickLine={false}
          axisLine={{ stroke: '#3f3f46' }}
        />
        <YAxis 
          tickFormatter={formatValue}
          stroke="#71717a"
          fontSize={10}
          tickLine={false}
          axisLine={{ stroke: '#3f3f46' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: '8px',
            fontSize: '12px'
          }}
          labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
          formatter={(value: number) => [formatValue(value), '']}
        />
        {showConfidence && forecast && (
          <Area
            type="monotone"
            dataKey="upper"
            stroke="transparent"
            fill="url(#confidenceGradient)"
            fillOpacity={0.3}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#6366f1' }}
          connectNulls
        />
        {forecast && (
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            connectNulls
          />
        )}
        {showConfidence && forecast && (
          <>
            <Line
              type="monotone"
              dataKey="upper"
              stroke="#8b5cf6"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="lower"
              stroke="#8b5cf6"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              connectNulls
            />
          </>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}