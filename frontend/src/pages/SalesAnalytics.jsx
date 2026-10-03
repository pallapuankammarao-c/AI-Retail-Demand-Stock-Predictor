import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Filter,
  DollarSign,
  Percent,
  Calendar,
  Store,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Tag
} from 'lucide-react';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function SalesAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStore, setSelectedStore] = useState('all');
  const [daysSpan, setDaysSpan] = useState(30);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getSalesAnalytics({
        category: selectedCategory,
        store_id: selectedStore,
        days: daysSpan
      });
      setAnalytics(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedCategory, selectedStore, daysSpan]);

  if (loading && !analytics) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const { kpis, revenue_trend, by_category, top_10_products, bottom_10_products, store_performance, regional_performance, discount_impact } = analytics || {};

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Sales &amp; Financial Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Multidimensional sales decomposition across time, store locations, pricing discounts &amp; product categories.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Days filter */}
          <select
            value={daysSpan}
            onChange={(e) => setDaysSpan(Number(e.target.value))}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value={14}>Past 14 Days</option>
            <option value={30}>Past 30 Days</option>
            <option value={90}>Past 90 Days</option>
            <option value={180}>Past 6 Months</option>
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Accessories">Accessories</option>
            <option value="Home Appliances">Home Appliances</option>
            <option value="Furniture">Furniture</option>
            <option value="Lifestyle">Lifestyle</option>
          </select>

          {/* Store filter */}
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Stores</option>
            <option value="ST-01">Metro Flagship</option>
            <option value="ST-02">Downtown Tech</option>
            <option value="ST-03">Suburbia Mall</option>
            <option value="ST-04">Tech Park Hub</option>
            <option value="ST-05">Riverside Plaza</option>
            <option value="ST-06">Airport Galleria</option>
            <option value="ST-07">Central Grand Galleria</option>
            <option value="ST-08">Coastal Bay Mall</option>
          </select>
        </div>
      </div>

      {/* KPI Stats Bar */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
            <span className="text-xs text-slate-500 font-semibold uppercase">Gross Revenue</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              ₹{(kpis.total_revenue / 1e6).toFixed(2)}M
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">₹{kpis.average_daily_sales.toLocaleString()}/day avg</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
            <span className="text-xs text-slate-500 font-semibold uppercase">Net Profit</span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{(kpis.total_profit / 1e6).toFixed(2)}M
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">{kpis.profit_margin_pct}% net margin</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Transactions</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {kpis.total_orders.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">{kpis.units_sold.toLocaleString()} units sold</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
            <span className="text-xs text-slate-500 font-semibold uppercase">Avg Order Value (AOV)</span>
            <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">
              ₹{kpis.average_order_value.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Per transaction basket</div>
          </div>
        </div>
      )}

      {/* Revenue & Profit Trends */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Revenue vs. Profit Velocity
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Tracking day-over-day financial margins across selected filters
        </p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenue_trend} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={(d) => d.slice(5)} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${(v/1e3).toFixed(0)}k`} />
              <Tooltip
                formatter={(val) => [`₹${val.toLocaleString()}`, '']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#0284c7" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Discount Impact & Store Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Discount Impact Analysis */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-sky-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Discount Elasticity &amp; Impact</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Comparison of promotional discounts vs full-price standard transactions
          </p>
          {discount_impact && discount_impact.promotional && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Promotional / Discounted
                </span>
                <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                  ₹{(discount_impact.promotional.revenue / 1e6).toFixed(2)}M
                </div>
                <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div>Orders: <strong>{discount_impact.promotional.orders.toLocaleString()}</strong></div>
                  <div>AOV: <strong>₹{discount_impact.promotional.aov.toLocaleString()}</strong></div>
                  <div>Profit Margin: <strong className="text-amber-500">{discount_impact.promotional.margin_pct}%</strong></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Full Price / Standard
                </span>
                <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                  ₹{(discount_impact.standard.revenue / 1e6).toFixed(2)}M
                </div>
                <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div>Orders: <strong>{discount_impact.standard.orders.toLocaleString()}</strong></div>
                  <div>AOV: <strong>₹{discount_impact.standard.aov.toLocaleString()}</strong></div>
                  <div>Profit Margin: <strong className="text-emerald-500">{discount_impact.standard.margin_pct}%</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Store Performance */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5">
          <div className="flex items-center gap-2 mb-2">
            <Store className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Store Leaderboard</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Revenue contribution across retail outlets
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {store_performance && store_performance.map((s, idx) => (
              <div key={s.store_id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400">{idx + 1}.</span>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{s.store_name}</span>
                    <span className="ml-1.5 text-[10px] text-slate-400 font-medium">({s.region})</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white">₹{(s.revenue / 1e6).toFixed(2)}M</span>
                  <span className="block text-[10px] text-emerald-500 font-semibold">{s.margin_pct}% margin</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top 10 vs Bottom 10 Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 10 Products */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Top 10 High Velocity Products</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Highest grossing catalog items</p>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {top_10_products && top_10_products.map((p, idx) => (
              <div key={p.product_id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{p.product_name}</span>
                  <div className="text-[10px] text-slate-400">{p.category} &bull; {p.units.toLocaleString()} units sold</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white">₹{(p.revenue / 1e6).toFixed(2)}M</div>
                  <div className="text-[10px] text-emerald-500 font-semibold">₹{(p.profit / 1e3).toFixed(0)}k profit</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom 10 Products */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Bottom 10 Slow-Moving Products</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Items requiring markdown or rebalancing</p>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {bottom_10_products && bottom_10_products.map((p, idx) => (
              <div key={p.product_id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{p.product_name}</span>
                  <div className="text-[10px] text-slate-400">{p.category} &bull; {p.units.toLocaleString()} units sold</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white">₹{(p.revenue / 1e3).toFixed(1)}k</div>
                  <div className="text-[10px] text-amber-500 font-semibold">Slow Velocity</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
