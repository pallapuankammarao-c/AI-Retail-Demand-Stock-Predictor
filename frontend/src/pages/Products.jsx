import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, ArrowUpRight, RefreshCw, Eye } from 'lucide-react';
import { api } from '../services/api';

export default function Products({ onSelectProductDetails, onSelectProductForForecast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts({ search, category });
      setProducts(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  const categories = ['all', 'Electronics', 'Accessories', 'Home Appliances', 'Furniture', 'Lifestyle'];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Product Catalog Master
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Master SKU catalog with pricing margins, lead-times, and demand telemetry.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by title or SKU ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-7 w-7 animate-spin text-sky-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p.product_id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-300">
                    {p.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{p.product_id}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-tight">
                  {p.product_name}
                </h3>
                <div className="mt-1 text-xs text-slate-400">Brand: {p.brand}</div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Selling Price</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      ₹{p.selling_price.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Stock</span>
                    <span className={`font-extrabold ${p.current_stock < 50 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                      {p.current_stock} units
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Margin: <strong className="text-emerald-500">{p.margin_pct}%</strong></span>
                  <span>Lead Time: <strong>{p.lead_time_days}d</strong></span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onSelectProductDetails(p.product_id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 rounded-lg transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Inspect</span>
                </button>
                <button
                  onClick={() => onSelectProductForForecast(p.product_id)}
                  className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  title="Demand Forecast"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
