'use client';

import { useEffect, useState } from 'react';
import React from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KPICardSkeleton, ChartSkeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { useInsightStore, useDataMetrics } from '@/lib/store';
import { TimeSeriesChart } from '@/components/charts/time-series';
import { DonutChart } from '@/components/charts/donut-chart';
import { GaugeChart } from '@/components/charts/gauge-chart';
import { AdvancedAreaChart } from '@/components/charts/advanced-area-chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Activity, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function AnalyticsPage() {
  const { data, forecast, generateData, isLoading } = useInsightStore();
  const metrics = useDataMetrics();
  const [selectedChart, setSelectedChart] = useState<'area' | 'pie' | 'bar' | 'line'>('area');
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [realTimeData, setRealTimeData] = useState(data);

  // Real-time data simulation
  useEffect(() => {
    if (!realTimeMode) {
      setRealTimeData(data);
      return;
    }

    const interval = setInterval(() => {
      setRealTimeData(prevData => {
        const newData = [...prevData];
        const lastPoint = newData[newData.length - 1];
        if (lastPoint) {
          const newPoint = {
            date: new Date(Date.now()).toISOString().split('T')[0],
            value: lastPoint.value + (Math.random() - 0.5) * 100 // Random fluctuation
          };
          newData.push(newPoint);
          // Keep only last 50 points for performance
          return newData.slice(-50);
        }
        return newData;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [realTimeMode, data]);

  useEffect(() => {
    if (data.length === 0) {
      generateData();
    }
  }, [data.length, generateData]);

  // Use real-time data if enabled
  const displayData = realTimeMode ? realTimeData : data;

  // Prepare data for different chart types
  const pieData: ChartData[] = [
    { name: 'Revenue', value: metrics.total * 0.4, fill: COLORS[0] },
    { name: 'Growth', value: metrics.total * 0.25, fill: COLORS[1] },
    { name: 'Expenses', value: metrics.total * 0.2, fill: COLORS[2] },
    { name: 'Profit', value: metrics.total * 0.15, fill: COLORS[3] },
  ];

  const barData = displayData.slice(-12).map((point, index) => ({
    name: point.date,
    revenue: point.value,
    forecast: forecast?.predictions[index] || 0,
  }));

  const areaData = displayData.slice(-20).map(point => ({
    date: point.date,
    value: point.value,
    trend: point.value * 0.8,
  }));

  const lineData = displayData.slice(-15).map(point => ({
    date: point.date,
    actual: point.value,
    predicted: point.value * 1.05,
  }));

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">
      {/* Vibrant animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary dynamic orbs */}
        <motion.div
          className="absolute top-5 right-5 w-96 h-96 bg-gradient-to-br from-pink-500/25 via-fuchsia-500/20 to-purple-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 1, 0.4],
            rotate: [0, 120, 240, 360]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-tl from-cyan-500/30 via-blue-500/25 to-indigo-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 0.7, 1.3],
            opacity: [0.5, 0.9, 0.5],
            rotate: [360, 240, 120, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-orange-500/20 via-red-500/15 to-pink-500/10 rounded-full blur-3xl"
          animate={{
            scale: [0.6, 1.6, 0.6],
            opacity: [0.3, 0.8, 0.3],
            x: [0, 100, -80, 0],
            y: [0, -80, 100, 0]
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        />

        {/* Secondary accent orbs */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-yellow-500/20 via-amber-500/15 to-orange-500/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.6, 0.2],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 12 }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-gradient-to-tl from-emerald-500/25 via-green-500/20 to-teal-500/15 rounded-full blur-2xl"
          animate={{
            scale: [0.8, 1.4, 0.8],
            opacity: [0.3, 0.7, 0.3],
            rotate: [180, 0, 180]
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 16 }}
        />

        {/* Dynamic particles */}
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full blur-sm"
            style={{
              top: `${10 + i * 7}%`,
              left: `${5 + i * 8}%`,
              background: `linear-gradient(45deg, ${
                ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
                 '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
                 '#ee5a24', '#0abde3'][i % 12]
              }, ${
                ['#ff3838', '#26d0ce', '#3498db', '#78e08f', '#ffb142',
                 '#fd79a8', '#3742fa', '#341f97', '#01a3a4', '#ee5a24',
                 '#c44569', '#006ba6'][i % 12]
              })`
            }}
            animate={{
              y: [0, -25, 0],
              x: [0, 15, -10, 0],
              opacity: [0.4, 1, 0.4],
              scale: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 5 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6
            }}
          />
        ))}

        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-indigo-500/8 to-purple-500/8 mix-blend-overlay" />
      </div>
        <motion.div
          className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-tl from-emerald-500/8 to-cyan-500/6 rounded-full blur-3xl"
          animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
         />


      <Sidebar />

      <main className="flex-1 p-6 overflow-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-zinc-500 text-lg mt-1">Comprehensive data analysis and insights</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={generateData}
                loading={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
              >
                <Activity className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>

              <Button
                variant={realTimeMode ? "default" : "outline"}
                onClick={() => setRealTimeMode(!realTimeMode)}
                className={realTimeMode ? "bg-green-600 hover:bg-green-500" : "border-zinc-600 hover:bg-zinc-800"}
              >
                <motion.div
                  animate={realTimeMode ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1, repeat: realTimeMode ? Infinity : 0 }}
                  className="w-2 h-2 bg-current rounded-full mr-2"
                />
                {realTimeMode ? 'Real-time On' : 'Real-time Off'}
              </Button>
            </div>
          </motion.div>

          {/* Vibrant KPI Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {data.length === 0 || isLoading ? (
              // Loading skeletons
              [...Array(4)].map((_, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                  <KPICardSkeleton />
                </motion.div>
              ))
            ) : (
              // Enhanced KPI cards with vibrant colors
              [
                {
                  title: "Total Revenue",
                  value: `$${metrics.total.toLocaleString()}`,
                  change: metrics.growth,
                  icon: DollarSign,
                  gradient: "from-pink-500 via-red-500 to-rose-500",
                  bgGlow: "shadow-pink-500/30",
                  chartColor: "#ff6b6b"
                },
                {
                  title: "Average Revenue",
                  value: `$${metrics.average.toFixed(0)}`,
                  change: metrics.growth / 2,
                  icon: TrendingUp,
                  gradient: "from-cyan-500 via-blue-500 to-indigo-500",
                  bgGlow: "shadow-cyan-500/30",
                  chartColor: "#4ecdc4"
                },
                {
                  title: "Growth Rate",
                  value: `${metrics.growth.toFixed(1)}%`,
                  change: metrics.growth > 0 ? 5 : -2,
                  icon: Activity,
                  gradient: "from-purple-500 via-violet-500 to-indigo-500",
                  bgGlow: "shadow-purple-500/30",
                  chartColor: "#a855f7"
                },
                {
                  title: "Data Points",
                  value: data.length.toString(),
                  change: 2.1,
                  icon: BarChart3,
                  gradient: "from-orange-500 via-amber-500 to-yellow-500",
                  bgGlow: "shadow-orange-500/30",
                  chartColor: "#f59e0b"
                }
              ].map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.5 + index * 0.1,
                    type: "spring",
                    stiffness: 120,
                    damping: 15
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    rotateY: 2,
                    transition: { duration: 0.3 }
                  }}
                  className="group"
                >
                  <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-[1px] transition-all duration-300 hover:shadow-2xl hover:${card.bgGlow}`}>
                    <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 h-full">
                      {/* Animated background gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />

                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <motion.div
                            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} p-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                            whileHover={{
                              rotate: [0, -5, 5, 0],
                              scale: 1.1
                            }}
                            transition={{ duration: 0.4 }}
                          >
{React.createElement(card.icon, { className: "w-8 h-8 text-white" })}
                          </motion.div>
                          <motion.div
                            className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border border-white/10 ${
                              card.change >= 0
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 border-red-500/30'
                            }`}
                            animate={card.change >= 0 ? {
                              scale: [1, 1.1, 1],
                              boxShadow: [
                                '0 0 0 0 rgba(16, 185, 129, 0.4)',
                                '0 0 0 4px rgba(16, 185, 129, 0)',
                                '0 0 0 0 rgba(16, 185, 129, 0.4)'
                              ]
                            } : {}}
                            transition={{
                              duration: 2,
                              repeat: card.change >= 0 ? Infinity : 0,
                              repeatDelay: 3
                            }}
                          >
                            {card.change >= 0 ? '↗' : '↘'} {Math.abs(card.change).toFixed(1)}%
                          </motion.div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-slate-400 font-medium">{card.title}</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                              {card.value}
                            </p>


                          {/* Real micro graph */}
                          <motion.div
                            className="mt-4"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                          >
                            <MicroChart
                              data={data}
                              color={card.chartColor}
                              height={35}
                            />
                          </motion.div>
                        </div>

                        {/* Animated particles */}
                        <div className="absolute top-4 right-4 w-20 h-20 overflow-hidden pointer-events-none">
                          {Array.from({ length: 4 }, (_, i) => (
                            <motion.div
                              key={i}
                              className={`absolute w-1 h-1 rounded-full bg-gradient-to-r ${card.gradient}`}
                              style={{
                                top: `${15 + i * 20}%`,
                                right: `${10 + i * 15}%`,
                              }}
                              animate={{
                                y: [0, -15, 0],
                                opacity: [0.3, 1, 0.3],
                                scale: [0.5, 1.2, 0.5]
                              }}
                              transition={{
                                duration: 3 + i * 0.5,
                                repeat: Infinity,
                                delay: i * 0.8
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            }
           </motion.div>

           {/* Chart Type Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-2"
          >
            {[
              { type: 'area', icon: BarChart3, label: 'Area Chart' },
              { type: 'pie', icon: PieChartIcon, label: 'Pie Chart' },
              { type: 'bar', icon: BarChart3, label: 'Bar Chart' },
              { type: 'line', icon: LineChartIcon, label: 'Line Chart' },
            ].map((chart) => (
              <Button
                key={chart.type}
                variant={selectedChart === chart.type ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedChart(chart.type as any)}
                className={selectedChart === chart.type ? 'bg-indigo-600 hover:bg-indigo-500' : ''}
              >
                <chart.icon className="w-4 h-4 mr-2" />
                {chart.label}
              </Button>
            ))}
          </motion.div>

          {/* Main Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <motion.div
              className="lg:col-span-2"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-2xl shadow-indigo-500/20">
                <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                      Data Visualization
                    </h3>
                  </div>
                  <div className="h-80">
                    {data.length === 0 || isLoading ? (
                      <ChartSkeleton />
            ) :
                      <ResponsiveContainer width="100%" height="100%">
                        {selectedChart === 'area' && (
                          <AreaChart data={areaData}>
                            <defs>
                              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#18181b',
                                border: '1px solid #374151',
                                borderRadius: '8px'
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="#6366f1"
                              fillOpacity={1}
                              fill="url(#areaGradient)"
                              strokeWidth={2}
                            />
                            <Area
                              type="monotone"
                              dataKey="trend"
                              stroke="#8b5cf6"
                              fillOpacity={0}
                              strokeWidth={2}
                              strokeDasharray="5 5"
                            />
                          </AreaChart>
                        )}

                        {selectedChart === 'pie' && (
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        )}

                        {selectedChart === 'bar' && (
                          <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#18181b',
                                border: '1px solid #374151',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="forecast" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        )}

                        {selectedChart === 'line' && (
                          <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#18181b',
                                border: '1px solid #374151',
                                borderRadius: '8px'
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="actual"
                              stroke="#6366f1"
                              strokeWidth={3}
                              dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="predicted"
                              stroke="#8b5cf6"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                            />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Side Panel with Advanced Visualizations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              {/* Vibrant Gauge Chart */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-[1px] shadow-lg shadow-emerald-500/20">
                  <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6">
                    <GaugeChart
                      value={Math.abs(metrics.growth)}
                      max={50}
                      title="Growth Performance"
                      color={metrics.growth >= 0 ? '#10b981' : '#ef4444'}
                      size={200}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Colorful Donut Chart */}
              <motion.div
                whileHover={{ scale: 1.02, rotateY: 2 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-[1px] shadow-lg shadow-purple-500/20">
                  <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-sm font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                        Data Distribution
                      </h4>
                    </div>
                    <DonutChart
                      data={[
                        { name: 'High', value: displayData.filter(d => d.value > metrics.average * 1.2).length, color: '#ff6b6b' },
                        { name: 'Medium', value: displayData.filter(d => d.value >= metrics.average * 0.8 && d.value <= metrics.average * 1.2).length, color: '#4ecdc4' },
                        { name: 'Low', value: displayData.filter(d => d.value < metrics.average * 0.8).length, color: '#45b7d1' },
                      ]}
                      height={160}
                      innerRadius={30}
                      outerRadius={55}
                    />

                    {/* Distribution stats */}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-1"></div>
                        <div className="text-slate-300 font-medium">
                          {displayData.filter(d => d.value > metrics.average * 1.2).length}
                        </div>
                        <div className="text-slate-500">High</div>
                      </div>
                      <div className="text-center">
                        <div className="w-3 h-3 rounded-full bg-teal-500 mx-auto mb-1"></div>
                        <div className="text-slate-300 font-medium">
                          {displayData.filter(d => d.value >= metrics.average * 0.8 && d.value <= metrics.average * 1.2).length}
                        </div>
                        <div className="text-slate-500">Medium</div>
                      </div>
                      <div className="text-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto mb-1"></div>
                        <div className="text-slate-300 font-medium">
                          {displayData.filter(d => d.value < metrics.average * 0.8).length}
                        </div>
                        <div className="text-slate-500">Low</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Real-time Status */}
              {realTimeMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-xl border-green-700/50">
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-2 h-2 bg-green-400 rounded-full"
                        />
                        <span className="text-sm font-medium text-green-400">Live Data</span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Updating every 2 seconds
                      </p>
                      <div className="mt-2 text-xs text-zinc-500">
                        Latest: ${displayData[displayData.length - 1]?.value.toFixed(0)}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Quick Stats */}
              <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 backdrop-blur-xl border-zinc-700/50">
                <div className="p-4">
                  <h4 className="text-sm font-medium text-zinc-300 mb-3">Quick Stats</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Max Value</span>
                      <span className="text-sm font-medium text-white">${metrics.max.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Min Value</span>
                      <span className="text-sm font-medium text-white">${metrics.min.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Data Points</span>
                      <span className="text-sm font-medium text-white">{displayData.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}