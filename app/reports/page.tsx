'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useInsightStore, useDataMetrics } from '@/lib/store';
import { generateReportPDF } from '@/lib/pdf';
import { Download, FileText, Calendar, Filter, Search, ChevronDown, ChevronUp, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface ReportData {
  date: string;
  revenue: number;
  growth: number;
  trend: 'up' | 'down' | 'stable';
}

export default function ReportsPage() {
  const { data, forecast, generateData, isLoading } = useInsightStore();
  const metrics = useDataMetrics();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'date' | 'revenue' | 'growth'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (data.length === 0) {
      generateData();
    }
  }, [data.length, generateData]);

  // Prepare report data
  const reportData: ReportData[] = data.slice(-30).map((point, index) => {
    const prevValue = index > 0 ? data[data.length - 31 + index - 1]?.value : point.value;
    const growth = prevValue ? ((point.value - prevValue) / prevValue) * 100 : 0;

    return {
      date: point.date,
      revenue: point.value,
      growth,
      trend: growth > 1 ? 'up' : growth < -1 ? 'down' : 'stable'
    };
  });

  // Filter and sort data
  const filteredData = reportData.filter(item =>
    item.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.revenue.toString().includes(searchTerm)
  );

  const sortedData = [...filteredData].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'date') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const handleSort = (field: 'date' | 'revenue' | 'growth') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Revenue', 'Growth %', 'Trend'].join(','),
      ...sortedData.map(row => [
        row.date,
        row.revenue.toFixed(2),
        row.growth.toFixed(2),
        row.trend
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    await generateReportPDF(data, forecast, 'InsightFlow Report');
  };

  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === sortedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedData.map((_, index) => index)));
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Enhanced background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-indigo-500/8 to-purple-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

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
                Reports & Analytics
              </h1>
              <p className="text-zinc-500 text-lg mt-1">Detailed financial reports and data analysis</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="border-zinc-700 hover:bg-zinc-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={exportToPDF}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              {
                title: "Total Records",
                value: sortedData.length.toString(),
                subtitle: "Data points analyzed",
                icon: BarChart3,
                color: "from-blue-500 to-indigo-500"
              },
              {
                title: "Average Revenue",
                value: `$${metrics.average.toFixed(0)}`,
                subtitle: `${metrics.growth >= 0 ? '+' : ''}${metrics.growth.toFixed(1)}% growth`,
                icon: TrendingUp,
                color: "from-green-500 to-emerald-500"
              },
              {
                title: "Best Performance",
                value: `$${metrics.max.toFixed(0)}`,
                subtitle: `Peak value recorded`,
                icon: TrendingUp,
                color: "from-purple-500 to-pink-500"
              }
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 backdrop-blur-xl border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} p-3`}>
                        <card.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
                      <p className="text-sm text-zinc-500">{card.title}</p>
                      <p className="text-xs text-zinc-400 mt-1">{card.subtitle}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-700 rounded-lg text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-zinc-900/60 border border-zinc-700 rounded-lg text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </motion.div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 backdrop-blur-xl border-zinc-700/50 overflow-hidden">
              <div className="p-6 border-b border-zinc-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Revenue Report</h3>
                  <div className="text-sm text-zinc-500">
                    Showing {filteredData.length} of {reportData.length} records
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                          onChange={toggleAllRows}
                          className="rounded border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      {[
                        { key: 'date', label: 'Date' },
                        { key: 'revenue', label: 'Revenue ($)' },
                        { key: 'growth', label: 'Growth (%)' }
                      ].map((column) => (
                        <th
                          key={column.key}
                          className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-200 transition-colors"
                          onClick={() => handleSort(column.key)}
                        >
                          <div className="flex items-center gap-1">
                            {column.label}
                            {sortField === column.key && (
                              sortDirection === 'asc' ?
                                <ChevronUp className="w-4 h-4" /> :
                                <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-700/50">
                    {sortedData.map((row, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.02 }}
                        className={`hover:bg-zinc-800/30 transition-colors ${
                          selectedRows.has(index) ? 'bg-indigo-600/10' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(index)}
                            onChange={() => toggleRowSelection(index)}
                            className="rounded border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                          {format(new Date(row.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                          ${row.revenue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            row.growth >= 0
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {row.growth >= 0 ? '+' : ''}{row.growth.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {row.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400 mr-1" />}
                            {row.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400 mr-1" />}
                            <span className={`text-sm capitalize ${
                              row.trend === 'up' ? 'text-green-400' :
                              row.trend === 'down' ? 'text-red-400' :
                              'text-zinc-400'
                            }`}>
                              {row.trend}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sortedData.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-400 mb-2">No data found</h3>
                  <p className="text-zinc-500">Try adjusting your search or filters</p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Bulk Actions */}
          {selectedRows.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-6 right-6 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-lg p-4 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-300">
                  {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-zinc-600">
                    Export Selected
                  </Button>
                  <Button size="sm" variant="outline" className="border-zinc-600">
                    Analyze
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}