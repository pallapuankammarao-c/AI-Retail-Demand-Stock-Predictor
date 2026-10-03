import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Legend
} from 'recharts';
import {
  Brain,
  Calendar,
  Layers,
  Store,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Cpu,
  BarChart2,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function DemandForecast({ preselectedProductId = 'P-101' }) {
  const [options, setOptions] = useState(null);
  const [productId, setProductId] = useState(preselectedProductId);
  const [storeId, setStoreId] = useState('all');
  const [horizon, setHorizon] = useState(7);
  const [modelType, setModelType] = useState('random_forest');

  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const opts = await api.getForecastOptions();
        setOptions(opts);
      } catch (err) {
        console.error(err);
      }
    };
    loadOptions();
  }, []);

  // Fetch forecast
  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getForecast(productId, {
        store_id: storeId,
        horizon: horizon,
        model_type: modelType
      });
      setForecastData(res);
    } catch (err) {
      console.error(err);
      setError('Failed to compute forecast inference.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchForecast();
    }
  }, [productId, storeId, horizon, modelType]);

  // Combine historical and forecast for seamless time-series chart
  const combinedChartData = React.useMemo(() => {
    if (!forecastData) return [];
    const hist = (forecastData.historical_series || []).map((h) => ({
      date: h.day,
      historical: h.quantity,
      forecast: null,
      lower: null,
      upper: null
    }));

    const fc = (forecastData.forecast_points || []).map((f) => ({
      date: f.date,
      historical: null,
      forecast: f.predicted_demand,
      lower: f.lower_bound,
      upper: f.upper_bound
    }));

    return [...hist, ...fc];
  }, [forecastData]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
              <Brain className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              AI Demand Forecasting Engine
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Recursive out-of-sample machine learning models with confidence intervals &amp; stockout risk projection.
          </p>
        </div>

        {/* Model Switcher */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setModelType('random_forest')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              modelType === 'random_forest'
                ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Random Forest
          </button>
          <button
            onClick={() => setModelType('gradient_boosting')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              modelType === 'gradient_boosting'
                ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gradient Boosting
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm flex flex-wrap items-center gap-4">
        
        {/* Product Selector */}
        <div className="flex-1 min-w-[220px]">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Product SKU
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {options && options.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id}) &bull; {p.category}
              </option>
            ))}
          </select>
        </div>

        {/* Store Selector */}
        <div className="w-48">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Store Location
          </label>
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Stores (Network)</option>
            {options && options.stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.region})
              </option>
            ))}
          </select>
        </div>

        {/* Forecast Horizon */}
        <div className="w-44">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Forecast Horizon
          </label>
          <div className="flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {[7, 14, 30].map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  horizon === h
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {h}D
              </button>
            ))}
          </div>
        </div>

      </div>

      {loading && (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-7 w-7 animate-spin text-sky-500" />
        </div>
      )}

      {error && !loading && (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-center">
          <p className="text-sm font-semibold text-rose-600">{error}</p>
        </div>
      )}

      {forecastData && !loading && (
        <>
          {/* Projection Summary Card */}
          <div className={`p-5 rounded-2xl border ${
            forecastData.risk_level === 'CRITICAL'
              ? 'border-rose-300 dark:border-rose-900/60 bg-rose-500/5'
              : (forecastData.risk_level === 'LOW STOCK'
                ? 'border-amber-300 dark:border-amber-900/60 bg-amber-500/5'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]')
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    forecastData.risk_level === 'CRITICAL'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                      : (forecastData.risk_level === 'LOW STOCK'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400')
                  }`}>
                    {forecastData.risk_level === 'CRITICAL' ? '🔴 Critical Stockout Risk' : (forecastData.risk_level === 'LOW STOCK' ? '🟡 Low Stock' : '🟢 Healthy')}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Product: <strong className="text-slate-900 dark:text-white">{forecastData.product_name}</strong>
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  {forecastData.recommended_action}
                </div>
              </div>

              {/* 4 Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 font-semibold block text-[10px]">HISTORICAL AVG</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {forecastData.historical_daily_avg} u/day
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 font-semibold block text-[10px]">PREDICTED {horizon}D</span>
                  <span className="text-base font-extrabold text-sky-500">
                    {forecastData.total_predicted_demand} units
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 font-semibold block text-[10px]">CURRENT STOCK</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {forecastData.current_stock} units
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 font-semibold block text-[10px]">
                    {forecastData.is_shortage ? 'EXPECTED SHORTAGE' : 'BUFFER SURPLUS'}
                  </span>
                  <span className={`text-base font-extrabold ${forecastData.is_shortage ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {Math.abs(forecastData.expected_shortage_or_excess)} units
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Line Chart */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Historical Velocity vs. Out-of-Sample {horizon}-Day ML Forecast
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Blue line represents actual sales; Orange line indicates recursive ML prediction with 90% confidence bands
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={combinedChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={(d) => d ? d.slice(5) : ''} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  {/* Historical Sales */}
                  <Line type="monotone" dataKey="historical" name="Historical Sales" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 2 }} connectNulls={false} />
                  {/* Predicted Demand */}
                  <Line type="monotone" dataKey="forecast" name="Predicted Demand (ML)" stroke="#f59e0b" strokeWidth={3} strokeDasharray="4 4" dot={{ r: 3 }} connectNulls={false} />
                  {/* Upper Bound */}
                  <Line type="monotone" dataKey="upper" name="Upper 90% Confidence" stroke="#fbbf24" strokeWidth={1} strokeDasharray="2 2" dot={false} connectNulls={false} />
                  {/* Lower Bound */}
                  <Line type="monotone" dataKey="lower" name="Lower 90% Confidence" stroke="#fbbf24" strokeWidth={1} strokeDasharray="2 2" dot={false} connectNulls={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Performance Comparison Metrics */}
          {forecastData.model_metrics && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 className="h-4 w-4 text-sky-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Model Performance Evaluation &amp; Accuracy Benchmarks
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Trained on multi-lag features (1, 7, 14, 30 days) and rolling statistical windows (7, 14, 30 days)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Random Forest Card */}
                <div className={`p-4 rounded-xl border ${
                  modelType === 'random_forest'
                    ? 'border-sky-500/50 bg-sky-500/5'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Cpu className="h-4 w-4 text-sky-500" />
                      Random Forest Regressor (100 Trees)
                    </span>
                    {modelType === 'random_forest' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500 text-white">Active</span>
                    )}
                  </div>
                  {forecastData.model_metrics.rf_metrics && (
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-semibold">MAE</span>
                        <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                          {forecastData.model_metrics.rf_metrics.mae}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-semibold">RMSE</span>
                        <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                          {forecastData.model_metrics.rf_metrics.rmse}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-semibold">MAPE</span>
                        <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                          {forecastData.model_metrics.rf_metrics.mape}%
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-semibold">R² SCORE</span>
                        <div className="font-bold text-emerald-500 mt-0.5">
                          {forecastData.model_metrics.rf_metrics.r2}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gradient Boosting Card */}
                <div className={`p-4 rounded-xl border ${
                  modelType === 'gradient_boosting'
                    ? 'border-sky-500/50 bg-sky-500/5'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Cpu className="h-4 w-4 text-indigo-500" />
                      Gradient Boosting Regressor
                    </span>
                    {modelType === 'gradient_boosting' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500 text-white">Active</span>
                    )}
                  </div>
                  {forecastData.model_metrics.gb_metrics && (
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-semibold">MAE</span>
                        <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                          {forecastData.model_metrics.gb_metrics.mae}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-semibold">RMSE</span>
                        <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                          {forecastData.model_metrics.gb_metrics.rmse}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-semibold">MAPE</span>
                        <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                          {forecastData.model_metrics.gb_metrics.mape}%
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-semibold">R² SCORE</span>
                        <div className="font-bold text-emerald-500 mt-0.5">
                          {forecastData.model_metrics.gb_metrics.r2}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
