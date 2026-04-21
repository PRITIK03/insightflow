'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInsightStore, useDataMetrics } from '@/lib/store';
import { ModelType, ForecastResult } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RefreshCw, Sparkles, BarChart3, TrendingUp, Activity } from 'lucide-react';

interface ModelOption {
  value: ModelType;
  label: string;
  description: string;
  icon: React.ElementType;
}

const modelOptions: ModelOption[] = [
  { 
    value: 'exponential-smoothing', 
    label: 'Holt-Winters', 
    description: 'Best for seasonal data with trend',
    icon: TrendingUp 
  },
  { 
    value: 'linear-regression', 
    label: 'Linear Regression', 
    description: 'Feature-rich polynomial model',
    icon: Activity 
  },
  { 
    value: 'moving-average', 
    label: 'Moving Average', 
    description: 'Simple weighted average',
    icon: BarChart3 
  },
  { 
    value: 'ensemble', 
    label: 'Ensemble', 
    description: 'Combination of all models',
    icon: Sparkles 
  }
];

export function ForecastPanel() {
  const { 
    data, 
    forecast, 
    models, 
    config, 
    isLoading,
    selectedModel,
    generateData, 
    runForecast, 
    compareAllModels,
    setSelectedModel 
  } = useInsightStore();
  
  const metrics = useDataMetrics();
  
  const handleGenerate = () => {
    generateData();
  };
  
  const handleRunForecast = () => {
    runForecast({ model: selectedModel });
  };
  
  const handleCompare = () => {
    compareAllModels();
  };
  
  return (
    <Card className="space-y-4 relative overflow-hidden">
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center space-y-4">
              <motion.div
                className="w-16 h-16 mx-auto relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500 rounded-full"></div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm text-zinc-300 font-medium">Analyzing data...</p>
                <p className="text-xs text-zinc-500">Running {selectedModel.replace('-', ' ')} algorithm</p>
              </motion.div>
              <motion.div
                className="flex justify-center space-x-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-indigo-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CardTitle className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
              </motion.div>
              Forecast Engine
            </CardTitle>
          </motion.div>
        </CardHeader>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            disabled={isLoading}
          >
            <motion.div
              animate={isLoading ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
            </motion.div>
            Generate
          </Button>
        </motion.div>
      </div>
      
      <div className="space-y-3">
        <motion.p
          className="text-xs text-zinc-500 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Select Model
        </motion.p>
        <div className="grid grid-cols-2 gap-2">
          {modelOptions.map((model, index) => {
            const Icon = model.icon;
            const isSelected = selectedModel === model.value;
            const modelResult = models.find(m => m.model === model.value);
            const error = modelResult?.metrics.rmse;

            return (
              <motion.button
                key={model.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.3
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: isSelected
                    ? '0 0 20px rgba(99, 102, 241, 0.3)'
                    : '0 0 15px rgba(63, 63, 70, 0.2)'
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedModel(model.value)}
                className={`p-3 rounded-lg text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 border shadow-lg shadow-indigo-500/20'
                    : 'bg-zinc-800/30 border border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700'
                }`}
              >
                {/* Selection indicator animation */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-lg"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                <div className="flex items-center gap-2 mb-1 relative z-10">
                  <motion.div
                    animate={isSelected ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  </motion.div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-indigo-300' : 'text-zinc-300'}`}>
                    {model.label}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 truncate relative z-10">{model.description}</p>
                {error !== undefined && (
                  <motion.p
                    className="text-xs text-zinc-600 mt-1 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    RMSE: {error.toFixed(2)}
                  </motion.p>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
      
      <motion.div
        className="flex gap-2 pt-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={handleRunForecast}
          disabled={data.length === 0 || isLoading}
          loading={isLoading}
          className="flex-1"
        >
          <motion.div
            animate={isLoading ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: "linear" }}
          >
            <Play className="w-4 h-4 mr-2" />
          </motion.div>
          {isLoading ? 'Running...' : 'Run'}
        </Button>
        <Button
          variant="secondary"
          onClick={handleCompare}
          disabled={data.length === 0 || isLoading}
          loading={isLoading}
          className="flex-1"
        >
          Compare All
        </Button>
      </motion.div>
      
      <AnimatePresence>
        {forecast && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-3 border-t border-zinc-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">Model</p>
                <p className="text-sm text-zinc-200 capitalize">{forecast.model.replace('-', ' ')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Next {config.periods} days</p>
                <p className="text-sm text-emerald-400 font-medium">
                  ${forecast.predictions[0]?.toFixed(0)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-zinc-800/30 rounded p-2">
                <p className="text-xs text-zinc-500">RMSE</p>
                <p className="text-sm text-zinc-200">{forecast.metrics.rmse.toFixed(2)}</p>
              </div>
              <div className="bg-zinc-800/30 rounded p-2">
                <p className="text-xs text-zinc-500">MAE</p>
                <p className="text-sm text-zinc-200">{forecast.metrics.mae.toFixed(2)}</p>
              </div>
              <div className="bg-zinc-800/30 rounded p-2">
                <p className="text-xs text-zinc-500">MAPE</p>
                <p className="text-sm text-zinc-200">{forecast.metrics.mape.toFixed(1)}%</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}