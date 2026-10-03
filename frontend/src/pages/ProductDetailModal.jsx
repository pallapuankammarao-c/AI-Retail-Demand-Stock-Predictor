import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  Package,
  Clock,
  Truck,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function ProductDetailModal({ productId, onClose, onOpenForecast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const res = await api.getProductDetails(productId);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (productId) {
      loadDetails();
    }
  }, [productId]);

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl p-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="flex h-80 items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        ) : !data ? (
          <div className="p-8 text-center text-rose-500">Failed to load product intelligence details.</div>
        ) : (
          <div className="space-y-6">
            
            {/* Header Information */}
            <div className="pr-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300">
                  {data.product.category}
                </span>
                <span className="text-xs font-semibold text-slate-400">SKU: {data.product.product_id}</span>
                <span className="text-xs font-semibold text-slate-400">&bull; Brand: {data.product.brand}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {data.product.product_name}
              </h2>
            </div>

            {/* Spec Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Selling Price</span>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                  ₹{data.product.selling_price.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400">Cost: ₹{data.product.cost_price}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Stock</span>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {data.inventory.current_stock} units
                </div>
                <span className="text-[10px] text-slate-400">{data.intelligence.days_remaining} days left</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Daily Demand</span>
                <div className="text-lg font-extrabold text-sky-500 mt-0.5">
                  {data.intelligence.daily_demand}/day
                </div>
                <span className="text-[10px] text-slate-400">Reorder pt: {data.intelligence.reorder_level}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Supplier</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                  {data.product.supplier}
                </div>
                <span className="text-[10px] text-slate-400">{data.product.lead_time_days} days lead time</span>
              </div>
            </div>

            {/* AI Inventory Advisor Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-sky-500/10 border border-purple-500/30 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 shrink-0">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  AI Inventory Advisor Insight
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">
                  {data.ai_inventory_advisor.summary}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Target Order: +{data.ai_inventory_advisor.recommended_units} units
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Depletion buffer: {data.ai_inventory_advisor.days_buffer} days
                  </span>
                </div>
              </div>
            </div>

            {/* Combined Historical Sales & 14-Day Demand Forecast Chart */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Demand Forecast &amp; Historical Trajectory
                </h4>
                <button
                  onClick={() => {
                    onClose();
                    onOpenForecast(data.product.product_id);
                  }}
                  className="text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Interactive Forecast Tool</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={[
                    ...(data.historical_sales_30d || []).slice(-14).map(h => ({ date: h.day.slice(5), historical: h.quantity, forecast: null })),
                    ...(data.forecast_14d || []).map(f => ({ date: f.date.slice(5), historical: null, forecast: f.predicted_demand }))
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="historical" name="Actual Past Sales" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="forecast" name="Predicted Demand" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
