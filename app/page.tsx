'use client';

import { useInsightStore, useDataMetrics } from '@/lib/store';
import { Sidebar } from '@/components/dashboard/sidebar';
import { KPICard } from '@/components/dashboard/kpi-card';
import { ForecastPanel } from '@/components/forecast/panel';
import { TimeSeriesChart } from '@/components/charts/time-series';
import { MicroBarChart } from '@/components/charts/micro-bar-chart';
import { Card } from '@/components/ui/card';
import { KPICardSkeleton, ChartSkeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Sparkles, Database, Clock, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { data, forecast, generateData, isLoading } = useInsightStore();
  const metrics = useDataMetrics();

  useEffect(() => {
    if (data.length === 0) {
      generateData();
    }
  }, []);
  
  return (
    <div className="flex min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient orbs */}
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-indigo-500/8 to-violet-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.6, 0.2],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tl from-violet-500/6 to-pink-500/4 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 0.8, 1.2],
            opacity: [0.3, 0.7, 0.3],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/4 to-cyan-500/3 rounded-full blur-2xl"
          animate={{
            scale: [0.8, 1.4, 0.8],
            opacity: [0.1, 0.4, 0.1],
            x: [0, 50, -30, 0],
            y: [0, -30, 50, 0]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6
          }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-indigo-400/20 rounded-full blur-sm"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.2, 0.5]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8
            }}
          />
        ))}

        {/* Additional smaller orbs */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-32 h-32 bg-amber-500/3 rounded-full blur-xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
            x: [0, 20, -10, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 8
          }}
        />

        <motion.div
          className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-rose-500/4 rounded-full blur-lg"
          animate={{
            scale: [0.8, 1.3, 0.8],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, 360]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
        />
      </div>

      <Sidebar />

      <main className="flex-1 p-6 overflow-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-100">Sales Analytics</h1>
              <p className="text-zinc-500 text-sm">Real-time forecasting dashboard</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              AI-Powered
            </div>
          </div>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {data.length === 0 || isLoading ? (
              // Loading skeletons
              [...Array(4)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.3 + index * 0.1,
                    duration: 0.3
                  }}
                >
                  <KPICardSkeleton />
                </motion.div>
              ))
            ) : (
              // Actual KPI cards
              [
                {
                  title: "Total Revenue",
                  value: metrics.total,
                  prefix: "$",
                  change: metrics.growth,
                  data: data,
                  chartColor: "#6366f1"
                },
                {
                  title: "Avg. Daily",
                  value: metrics.average,
                  prefix: "$",
                  data: data,
                  chartColor: "#10b981"
                },
                {
                  title: "Peak Value",
                  value: metrics.max,
                  prefix: "$",
                  data: data,
                  chartColor: "#f59e0b"
                },
                {
                  title: "Growth Trend",
                  value: metrics.trend,
                  prefix: metrics.trend >= 0 ? '+' : '',
                  change: metrics.growth / 10,
                  data: data,
                  chartColor: "#8b5cf6"
                }
              ].map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.3 + index * 0.1,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <KPICard {...card} />
                </motion.div>
              ))
            )}
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card title="Revenue Forecast" hover>
                <div className="h-[350px]">
                  {data.length === 0 || isLoading ? (
                    <ChartSkeleton />
                  ) : (
                    <TimeSeriesChart
                      data={data}
                      forecast={forecast || undefined}
                      height={320}
                      showConfidence={true}
                    />
                  )}
                </div>
                {forecast && (
                  <div className="flex items-center justify-center gap-6 mt-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-indigo-500" />
                      Actual
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-violet-500 border-dash" style={{ borderStyle: 'dashed' }} />
                      Forecast
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-indigo-500/20" />
                      Confidence
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ForecastPanel />
            </motion.div>
          </div>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {[
              {
                icon: Database,
                iconBg: "bg-indigo-600/20",
                iconColor: "text-indigo-400",
                title: "Data Points",
                value: data.length.toString(),
                chartColor: "#6366f1"
              },
              {
                icon: Clock,
                iconBg: "bg-violet-600/20",
                iconColor: "text-violet-400",
                title: "Time Range",
                value: "365 days",
                chartColor: "#8b5cf6"
              },
              {
                icon: DollarSign,
                iconBg: "bg-emerald-600/20",
                iconColor: "text-emerald-400",
                title: "Confidence",
                value: "95%",
                chartColor: "#10b981"
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.7 + index * 0.1,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="p-4" hover>
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={`w-10 h-10 ${item.iconBg} rounded-lg flex items-center justify-center`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <IconComponent className={`w-5 h-5 ${item.iconColor}`} />
                      </motion.div>
                      <div className="flex-1">
                        <motion.p
                          className="text-xs text-zinc-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                        >
                          {item.title}
                        </motion.p>
                        <motion.p
                          className="text-lg font-medium text-zinc-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                        >
                          {item.value}
                        </motion.p>
                        <motion.div
                          className="mt-2"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.0 + index * 0.1, duration: 0.4 }}
                        >
                          <MicroBarChart data={data} color={item.chartColor} />
                        </motion.div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}