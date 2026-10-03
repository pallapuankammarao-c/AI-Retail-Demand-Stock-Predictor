import React from 'react';
import { ShoppingBag, Sun, Moon, Sparkles, Bell, Search, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onLaunchDemo, isDemoLoading, activeAlertCount = 0, onOpenAlerts }) {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0b0f17]/80 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-cyan-400 text-white shadow-md shadow-sky-500/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-600 via-indigo-500 to-cyan-500 dark:from-sky-400 dark:via-indigo-300 dark:to-cyan-300 bg-clip-text text-transparent">
                RetailPulse AI
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                PROD v1.0
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Predict Demand. Prevent Stockouts. Optimize Inventory.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* One-Click Launch Demo Button */}
          <button
            onClick={onLaunchDemo}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 rounded-lg shadow-sm shadow-indigo-500/25 transition-all duration-150 transform active:scale-95 disabled:opacity-50"
            title="Reset & Load Realistic 50k+ Demo Data"
          >
            <Sparkles className={`h-4 w-4 ${isDemoLoading ? 'animate-spin' : 'animate-pulse'}`} />
            <span>{isDemoLoading ? 'Seeding Data...' : 'Launch Demo'}</span>
          </button>

          {/* Alerts Bell */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="View Critical Alerts"
          >
            <Bell className="h-5 w-5" />
            {activeAlertCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {activeAlertCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </button>

          {/* User Profile */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              RM
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200">Retail Manager</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="h-3 w-3" /> ST-01 Online
              </div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
