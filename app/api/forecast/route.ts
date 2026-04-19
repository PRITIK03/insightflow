import { NextRequest, NextResponse } from 'next/server';
import { runForecast, compareModels, getBestModel } from '@/lib/algorithms/forecast';
import { DataPoint, ForecastConfig, ModelType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, config, action = 'forecast' } = body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data. Expected non-empty array of data points.' },
        { status: 400 }
      );
    }

    const validData = data.every(
      (d: DataPoint) => d.date && typeof d.value === 'number' && !isNaN(d.value)
    );

    if (!validData) {
      return NextResponse.json(
        { error: 'Invalid data format. Each point must have date (string) and value (number).' },
        { status: 400 }
      );
    }

    const forecastConfig: ForecastConfig = {
      model: (config?.model as ModelType) || 'ensemble',
      periods: config?.periods || 30,
      confidence: config?.confidence || 0.95
    };

    let result;

    switch (action) {
      case 'compare':
        result = compareModels(data, forecastConfig);
        break;
      case 'best':
        const models = compareModels(data, forecastConfig);
        result = getBestModel(models);
        break;
      case 'forecast':
      default:
        result = runForecast(data, forecastConfig);
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        action,
        dataPoints: data.length,
        config: forecastConfig,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Forecast computation failed', details: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'InsightFlow Forecast API',
    version: '1.0.0',
    endpoints: {
      POST: {
        path: '/api/forecast',
        description: 'Run forecasting on provided data',
        body: {
          data: 'Array of { date: string, value: number }',
          config: {
            model: 'exponential-smoothing | linear-regression | moving-average | ensemble',
            periods: 'number (default: 30)',
            confidence: 'number (default: 0.95)'
          },
          action: 'forecast | compare | best'
        }
      }
    }
  });
}