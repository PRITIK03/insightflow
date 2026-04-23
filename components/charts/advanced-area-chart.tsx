'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface AdvancedAreaChartProps {
  data: Array<{
    [key: string]: string | number;
  }>;
  xKey: string;
  yKey: string;
  title?: string;
  height?: number;
  color?: string;
  gradient?: boolean;
  showGrid?: boolean;
  animation?: boolean;
}

export function AdvancedAreaChart({
  data,
  xKey,
  yKey,
  title,
  height = 300,
  color = '#6366f1',
  gradient = true,
  showGrid = true,
  animation = true
}: AdvancedAreaChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      {title && (
        <motion.h3
          className="text-lg font-semibold text-white mb-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {gradient && (
              <linearGradient id={`areaGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            )}

            {/* Animated gradient for effect */}
            <motion.linearGradient
              id={`animatedGradient-${color.replace('#', '')}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
              animate={{
                x1: ["0%", "100%"],
                x2: ["100%", "200%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <stop offset="0%" stopColor={color} />
              <stop offset="50%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} />
            </motion.linearGradient>
          </defs>

          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              strokeOpacity={0.3}
            />
          )}

          <XAxis
            dataKey={xKey}
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
            labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
            formatter={(value: string | number) => [value?.toLocaleString(), yKey]}
          />

          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={3}
            fill={gradient ? `url(#areaGradient-${color.replace('#', '')})` : 'transparent'}
            dot={{ fill: color, strokeWidth: 2, r: 4, stroke: '#ffffff' }}
            activeDot={{
              r: 6,
              stroke: color,
              strokeWidth: 2,
              fill: '#ffffff'
            }}
            animationDuration={animation ? 1500 : 0}
            animationEasing="ease-out"
          />

          {/* Secondary area for layered effect */}
          <Area
            type="monotone"
            dataKey={yKey}
            stroke="transparent"
            fill={`url(#animatedGradient-${color.replace('#', '')})`}
            fillOpacity={0.1}
            animationDuration={animation ? 2000 : 0}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}