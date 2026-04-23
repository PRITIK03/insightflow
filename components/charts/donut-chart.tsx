'use client';

import { DataPoint } from '@/types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

const DEFAULT_COLORS = [
  '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
];

export function DonutChart({
  data,
  title,
  height = 300,
  innerRadius = 60,
  outerRadius = 100
}: DonutChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6'
            }}
            formatter={(value: number, name: string) => [
              `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
              name
            ]}
          />

          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: { color: string }) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{total.toLocaleString()}</div>
          <div className="text-sm text-zinc-400">Total</div>
        </div>
      </div>
    </motion.div>
  );
}