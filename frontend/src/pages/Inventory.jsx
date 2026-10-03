import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  TrendingDown,
  Download,
  PlusCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

export default function Inventory({ onSelectProductForForecast, onSelectProductDetails }) {
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [reorderingId, setReorderingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.getInventory({
        search,
        category: selectedCategory,
        risk: selectedRisk,
        supplier: selectedSupplier
      });
      setInventoryData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search, selectedCategory, selectedRisk, selectedSupplier]);

  const handleQuickReorder = async (productId, quantity, productName) => {
    try {
      setReorderingId(productId);
      const res = await api.reorderStock(productId, quantity);
      setToastMessage(`Ordered ${quantity} units of ${productName}. Stock updated to ${res.current_stock}!`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert('Failed to place reorder');
    } finally {
      setReorderingId(null);
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            🔴 Critical
          </span>
        );
      case 'LOW STOCK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            🟡 Low Stock
          </span>
        );
      case 'OVERSTOCK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            🔵 Overstock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            🟢 Healthy
          </span>
        );
    }
  };

  const { items, kpis, filter_options } = inventoryData || { items: [], kpis: {}, filter_options: {} };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-600/30 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-5 w-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Intelligent Inventory Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time replenishment parameters, safety stock buffers, and lead-time calculations.
          </p>
        </div>

        {/* CSV Export Button */}
        <div className="flex items-center gap-2">
          <a
            href="/api/reports/export/csv/inventory"
            download
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Inventory CSV</span>
          </a>
        </div>
      </div>

      {/* KPI Stats */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Inventory Value</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              ₹{(kpis.total_inventory_value / 1e6).toFixed(2)}M
            </div>
            <div className="text-[11px] text-slate-500 mt-1">{kpis.total_inventory_units?.toLocaleString()} units in warehouses</div>
          </div>
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-500/5">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">Critical Stockout Risk</span>
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              {kpis.critical_stockout_risk} SKUs
            </div>
            <div className="text-[11px] text-rose-500 font-medium mt-1">Depletion within &lt; 7 days</div>
          </div>
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-500/5">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">Low Stock SKUs</span>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {kpis.low_stock_count} SKUs
            </div>
            <div className="text-[11px] text-amber-500 font-medium mt-1">Approaching reorder point</div>
          </div>
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-500/5">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Overstocked SKUs</span>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              {kpis.overstock_count} SKUs
            </div>
            <div className="text-[11px] text-blue-500 font-medium mt-1">Turnover ratio: {kpis.inventory_turnover}x</div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="all">All Categories</option>
          {filter_options.categories && filter_options.categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Risk filter */}
        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value)}
          className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="all">All Health Statuses</option>
          <option value="CRITICAL">🔴 Critical Only</option>
          <option value="LOW STOCK">🟡 Low Stock Only</option>
          <option value="HEALTHY">🟢 Healthy Only</option>
          <option value="OVERSTOCK">🔵 Overstock Only</option>
        </select>

        {/* Supplier filter */}
        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="all">All Suppliers</option>
          {filter_options.suppliers && filter_options.suppliers.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Product Name &amp; SKU</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3 text-right">Current Stock</th>
                <th className="py-3.5 px-3 text-right">Daily Demand</th>
                <th className="py-3.5 px-3 text-right">Days Left</th>
                <th className="py-3.5 px-3 text-right">Reorder Level</th>
                <th className="py-3.5 px-3 text-center">Status / Risk</th>
                <th className="py-3.5 px-3 text-right">Rec. Reorder</th>
                <th className="py-3.5 px-3">Supplier (Lead Time)</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {items.map((item) => (
                <tr key={item.product_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => onSelectProductDetails(item.product_id)}
                      className="text-left group font-bold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1.5"
                    >
                      <span>{item.product_name}</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <span className="text-[10px] text-slate-400 font-normal">{item.product_id} &bull; {item.warehouse}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">{item.category}</td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                    {item.current_stock.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-600 dark:text-slate-400">
                    {item.daily_demand}/day
                  </td>
                  <td className={`py-3.5 px-3 text-right font-extrabold ${
                    item.days_remaining <= 5 ? 'text-rose-600 dark:text-rose-400' : (item.days_remaining <= 14 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300')
                  }`}>
                    {item.days_remaining} d
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-500">
                    {item.reorder_level} units
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {getRiskBadge(item.risk)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {item.recommended_order > 0 ? `+${item.recommended_order}` : '—'}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="text-slate-800 dark:text-slate-200">{item.supplier}</div>
                    <span className="text-[10px] text-slate-400">{item.lead_time_days} days lead</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {item.recommended_order > 0 ? (
                        <button
                          onClick={() => handleQuickReorder(item.product_id, item.recommended_order, item.product_name)}
                          disabled={reorderingId === item.product_id}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                          title="Place Immediate Reorder"
                        >
                          {reorderingId === item.product_id ? 'Ordering...' : 'Reorder'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuickReorder(item.product_id, 50, item.product_name)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                          +50
                        </button>
                      )}
                      <button
                        onClick={() => onSelectProductForForecast(item.product_id)}
                        className="p-1 text-sky-600 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950 rounded-lg"
                        title="View Demand Forecast"
                      >
                        Forecast
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
