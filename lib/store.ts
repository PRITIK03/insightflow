import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DataPoint, ForecastResult, ForecastConfig, ModelType } from '@/types';
import { runForecast, compareModels, getBestModel } from '@/lib/algorithms/forecast';
import { generateSampleData, calculateMetrics } from '@/lib/data/generator';

interface InsightStore {
  data: DataPoint[];
  forecast: ForecastResult | null;
  models: ForecastResult[];
  config: ForecastConfig;
  isLoading: boolean;
  selectedModel: ModelType;
  
  setData: (data: DataPoint[]) => void;
  generateData: () => void;
  runForecast: (config?: Partial<ForecastConfig>) => void;
  compareAllModels: () => void;
  setSelectedModel: (model: ModelType) => void;
  setConfig: (config: Partial<ForecastConfig>) => void;
  clearForecast: () => void;
}

export const useInsightStore = create<InsightStore>()(
  persist(
    (set, get) => ({
      data: [],
      forecast: null,
      models: [],
      config: {
        model: 'exponential-smoothing',
        periods: 30,
        confidence: 0.95
      },
      isLoading: false,
      selectedModel: 'exponential-smoothing',
      
      setData: (data) => set({ data }),
      
      generateData: () => {
        set({ isLoading: true });
        const data = generateSampleData('sales');
        set({ data, isLoading: false });
      },
      
      runForecast: (configOverride) => {
        const { data, config } = get();
        if (data.length === 0) return;
        
        set({ isLoading: true });
        
        const newConfig = { ...config, ...configOverride };
        const result = runForecast(data, newConfig);
        
        set({ 
          forecast: result, 
          config: newConfig,
          isLoading: false 
        });
      },
      
      compareAllModels: () => {
        const { data, config } = get();
        if (data.length === 0) return;
        
        set({ isLoading: true });
        
        const models = compareModels(data, config);
        const best = getBestModel(models);
        
        set({ 
          models, 
          forecast: best,
          isLoading: false 
        });
      },
      
      setSelectedModel: (model) => {
        set({ selectedModel: model });
        get().runForecast({ model });
      },
      
      setConfig: (configUpdate) => {
        const { config } = get();
        set({ config: { ...config, ...configUpdate } });
      },
      
      clearForecast: () => set({ forecast: null, models: [] })
    }),
    {
      name: 'insightflow-storage',
      partialize: (state) => ({ data: state.data, config: state.config })
    }
  )
);

export function useDataMetrics() {
  return useInsightStore((state) => {
    if (state.data.length === 0) {
      return {
        total: 0,
        average: 0,
        min: 0,
        max: 0,
        trend: 0,
        growth: 0
      };
    }
    return calculateMetrics(state.data);
  });
}