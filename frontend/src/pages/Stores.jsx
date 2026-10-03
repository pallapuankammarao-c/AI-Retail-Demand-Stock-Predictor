import React, { useState, useEffect } from 'react';
import { Store as StoreIcon, MapPin, DollarSign, TrendingUp, ShoppingBag, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true);
        const res = await api.getStores();
        setStores(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStores();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Retail Store Network
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Branch-level sales volume, regional geographic benchmarks, and outlet profitability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stores.map((s, idx) => (
          <div
            key={s.store_id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <StoreIcon className="h-5 w-5" />
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Rank #{idx + 1}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {s.store_name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5 font-medium">
              <MapPin className="h-3.5 w-3.5 text-rose-500" />
              <span>{s.region} Region &bull; {s.store_id}</span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Revenue:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  ₹{(s.revenue / 1e6).toFixed(2)}M
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Net Profit:</span>
                <span className="font-extrabold text-emerald-500">
                  ₹{(s.profit / 1e6).toFixed(2)}M ({s.margin_pct}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Orders:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {s.orders.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Units Sold:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {s.units.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
