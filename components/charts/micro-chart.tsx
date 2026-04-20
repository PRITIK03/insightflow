'use client';

import { DataPoint } from '@/types';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'recharts';
import { Tooltip } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MicroChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
}

export function MicroChart({ data, color = '#6366f1', height = 40 }: MicroChartProps) {
  // Take the last 30 data points for the micro chart
  const chartData = data.slice(-30).map(point => ({
    value: point.value
  }));

  if (chartData.length < 2) return null;

  // Calculate trend
  const firstValue = chartData[0].value;
  const lastValue = chartData[chartData.length - 1].value;
  const change = ((lastValue - firstValue) / firstValue) * 100;
  const isPositive = change > 0;
  const isNegative = change < 0;

  const tooltipContent = (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {isPositive && <TrendingUp className="w-3 h-3 text-emerald-400" />}
        {isNegative && <TrendingDown className="w-3 h-3 text-red-400" />}
        {!isPositive && !isNegative && <Minus className="w-3 h-3 text-zinc-400" />}
        <span className="font-medium">
          {isPositive ? '+' : ''}{change.toFixed(1)}% trend
        </span>
      </div>
      <div className="text-xs text-zinc-400">
        Last 30 data points
      </div>
    </div>
  );

  return (
    <Tooltip content={<div>{tooltipContent}</div>}>
      <div className="w-full h-10 cursor-pointer transition-opacity hover:opacity-80">
        <Sparklines data={chartData} height={height}>
          <SparklinesLine
            color={color}
            style={{ strokeWidth: 2, fill: 'none' }}
          />
          <SparklinesSpots size={2} style={{ fill: color }} />
        </Sparklines>
      </div>
    </Tooltip>
  );
}