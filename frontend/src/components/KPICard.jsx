import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, colorScheme = 'blue', alert = false }) {
  const colorMap = {
    blue: 'from-sky-500/10 to-blue-500/5 text-sky-600 dark:text-sky-400 border-sky-500/20',
    emerald: 'from-emerald-500/10 to-teal-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/10 to-orange-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/10 to-red-500/5 text-rose-600 dark:text-rose-400 border-rose-500/20',
    purple: 'from-purple-500/10 to-indigo-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  const currentTheme = colorMap[colorScheme] || colorMap.blue;

  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 border bg-white dark:bg-[#111827] shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
      alert ? 'border-rose-400 dark:border-rose-700/60 ring-1 ring-rose-400/20' : 'border-slate-200 dark:border-slate-800'
    }`}>
      {/* Subtle background glow */}
      <div className={`absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-gradient-to-br ${currentTheme} opacity-40 blur-xl pointer-events-none`} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 ${currentTheme}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {subtitle && (
          <span className="text-slate-500 dark:text-slate-400">
            {subtitle}
          </span>
        )}
        {trendValue && (
          <div className={`flex items-center gap-1 font-semibold ${
            trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}
