'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
}

export function KPICard({ title, value, change, prefix = '', suffix = '' }: KPICardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;
  
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-transparent rounded-bl-full" />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">{title}</p>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-semibold text-zinc-100"
        >
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </motion.div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            isPositive ? 'text-emerald-500' : 
            isNegative ? 'text-red-500' : 
            'text-zinc-500'
          }`}>
            {isPositive && <TrendingUp className="w-4 h-4" />}
            {isNegative && <TrendingDown className="w-4 h-4" />}
            {isNeutral && <Minus className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
            <span className="text-zinc-600">vs last period</span>
          </div>
        )}
      </div>
    </Card>
  );
}