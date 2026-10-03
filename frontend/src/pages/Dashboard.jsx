import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  AlertTriangle,
  AlertOctagon,
  Boxes,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import KPICard from '../components/KPICard';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Dashboard({ onNavigate, onSelectProductForForecast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load live dashboard data. Check backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin text-sky-500" />
          <p className="text-sm font-medium">Crunching 66,000+ retail sales records &amp; inventory telemetry...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-2xl">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-rose-700 dark:text-rose-300">Connection Error</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-500"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { kpis, charts, critical_items } = data;

  const formatCurrency = (val) => {
    if (val >= 1e7) return `₹${(val / 1e7).toFixed(2)} Cr`;
    if (val >= 1e6) return `₹${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `₹${(val / 1e3).toFixed(1)}k`;
    return `₹${val.toFixed(2)}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Retail Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry across 8 stores, 20 catalog products &amp; active ML demand forecasts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('forecast')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-300 border border-sky-300 dark:border-sky-800 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors"
          >
            <span>Run ML Forecast</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={fetchDashboard}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 shadow-sm"
            title="Refresh Telemetry"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        <KPICard
          title="Revenue"
          value={formatCurrency(kpis.revenue)}
          subtitle="Annual Volume"
          icon={DollarSign}
          trend="up"
          trendValue="+18.4%"
          colorScheme="blue"
        />
        <KPICard
          title="Profit"
          value={formatCurrency(kpis.profit)}
          subtitle={`${kpis.profit_margin_pct}% Margin`}
          icon={TrendingUp}
          trend="up"
          trendValue="+12.1%"
          colorScheme="emerald"
        />
        <KPICard
          title="Orders"
          value={kpis.orders.toLocaleString()}
          subtitle="Transactions"
          icon={ShoppingCart}
          trend="up"
          trendValue="+9.5%"
          colorScheme="purple"
        />
        <KPICard
          title="Units Sold"
          value={kpis.units_sold.toLocaleString()}
          subtitle="Total Qty"
          icon={Package}
          colorScheme="blue"
        />
        <KPICard
          title="Stockout Risk"
          value={kpis.stockout_risk_count}
          subtitle="Immediate Action"
          icon={AlertOctagon}
          colorScheme="rose"
          alert={kpis.stockout_risk_count > 0}
        />
        <KPICard
          title="Low Stock"
          value={kpis.low_stock_count}
          subtitle="Reorder Soon"
          icon={AlertTriangle}
          colorScheme="amber"
        />
        <KPICard
          title="Overstock"
          value={kpis.overstock_count}
          subtitle="Capital Locked"
          icon={Boxes}
          colorScheme="blue"
        />
      </div>

      {/* Charts Section: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Revenue &amp; Profit Trend (Past 30 Days)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily gross revenue vs. bottom-line retail margin</p>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Sales Details</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenue_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${(v/1e3).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Health Donut Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Inventory Health Distribution</h2>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline"
              >
                Manage
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Stock health classification across active SKUs</p>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.stock_health_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.stock_health_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {charts.stock_health_distribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Charts Section: Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Sales by Category */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Sales by Category</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Total revenue generated per department</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.category_sales} layout="vertical" margin={{ top: 5, right: 15, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `₹${(v/1e6).toFixed(1)}M`} />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={11} width={85} />
                <Tooltip
                  formatter={(v) => [`₹${(v/1e6).toFixed(2)}M`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#38bdf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Performance */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Regional Performance</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Store cluster revenue by geography</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.regional_performance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="region" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `₹${(v/1e6).toFixed(1)}M`} />
                <Tooltip
                  formatter={(v) => [`₹${(v/1e6).toFixed(2)}M`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Revenue Drivers */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Top Products by Revenue</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Highest grossing product lines</p>
          <div className="space-y-3">
            {charts.top_products.map((p, idx) => (
              <div
                key={p.product_id}
                onClick={() => onSelectProductForForecast(p.product_id)}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 font-bold text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                      {p.product_name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {p.units.toLocaleString()} units sold
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    ₹{(p.revenue / 1e6).toFixed(2)}M
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    +{((p.profit / p.revenue) * 100).toFixed(0)}% profit
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Critical Stockout Priority Items */}
      {critical_items && critical_items.length > 0 && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Priority Stockout Warnings (Forecasted Depletion &lt; 7 Days)
              </h2>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline"
            >
              View All Low Stock Items &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {critical_items.map((item) => (
              <div
                key={item.product_id}
                className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      🔴 {item.risk}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Stock: {item.current_stock}
                    </span>
                  </div>
                  <div className="mt-1 font-semibold text-xs text-slate-900 dark:text-white">
                    {item.product_name}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Demand: {item.daily_demand}/day &bull; Depletes in <strong>{item.days_remaining} days</strong>
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Order +{item.recommended_order} units
                  </span>
                  <button
                    onClick={() => onSelectProductForForecast(item.product_id)}
                    className="text-[10px] font-semibold text-sky-600 hover:text-sky-500 flex items-center gap-0.5"
                  >
                    <span>Forecast</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
