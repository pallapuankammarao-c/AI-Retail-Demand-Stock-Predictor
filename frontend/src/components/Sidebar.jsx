import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  Boxes,
  Package,
  Store,
  Sparkles,
  Bell,
  FileSpreadsheet,
  Settings as SettingsIcon,
  Cpu
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales Analytics', icon: TrendingUp },
  { id: 'forecast', label: 'Demand Forecast', icon: LineChart, badge: 'ML' },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'stores', label: 'Stores', icon: Store },
  { id: 'insights', label: 'AI Insights', icon: Sparkles, badge: 'AI' },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({ activeTab, setActiveTab, alertCount = 0 }) {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1420] flex flex-col justify-between py-4 select-none">
      
      {/* Navigation List */}
      <nav className="px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Intelligence Suite
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold border border-sky-500/20 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-sky-500' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.id === 'alerts' && alertCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {alertCount}
                  </span>
                )}
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    item.badge === 'AI'
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Cloud & ML Engine Status Footer */}
      <div className="px-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="h-3.5 w-3.5 text-sky-500 animate-pulse" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">ML Engine Active</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Random Forest &amp; Gradient Boosting models running inference on 66k+ telemetry points.
          </p>
          <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-slate-400">
            <span>Latency: 18ms</span>
            <span className="text-emerald-500 font-semibold">&bull; Healthy</span>
          </div>
        </div>
      </div>

    </aside>
  );
}
