import React from 'react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';

export default function AlertNotificationBanner({ criticalAlert, onViewForecast, onDismiss }) {
  if (!criticalAlert) return null;

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/5 border border-rose-500/30 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
          <AlertTriangle className="h-5 w-5 animate-bounce" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Immediate Stockout Risk
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              &bull; {criticalAlert.product_name}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            {criticalAlert.message} {criticalAlert.recommended_action}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          onClick={() => onViewForecast(criticalAlert.product_id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors"
        >
          <span>Run Forecast</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
