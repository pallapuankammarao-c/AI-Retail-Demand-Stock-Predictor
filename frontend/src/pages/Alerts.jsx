import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Boxes,
  TrendingDown,
  CheckCircle,
  XCircle,
  Eye,
  CheckCheck,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';

export default function Alerts({ onSelectProductForForecast }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [activeCount, setActiveCount] = useState(0);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.getAlerts({
        status: filterStatus,
        severity: filterSeverity
      });
      setAlerts(res.alerts);
      setActiveCount(res.total_active);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterStatus, filterSeverity]);

  const handleUpdateStatus = async (alertId, newStatus) => {
    try {
      await api.updateAlertStatus(alertId, newStatus);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveAll = async () => {
    try {
      await api.resolveAllAlerts();
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const getAlertIcon = (type, severity) => {
    if (severity === 'critical') return <AlertOctagon className="h-5 w-5 text-rose-500 animate-pulse" />;
    if (type === 'overstock') return <Boxes className="h-5 w-5 text-blue-500" />;
    if (type === 'demand_spike') return <TrendingDown className="h-5 w-5 text-amber-500" />;
    return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <Bell className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Automated Alert Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Proactive alerts for stockouts, unexpected demand spikes, overstock capital lockup, and margin risks.
          </p>
        </div>

        <button
          onClick={handleResolveAll}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
        >
          <CheckCheck className="h-4 w-4" />
          <span>Resolve All Active</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="all">All Alert Statuses</option>
          <option value="active">Active Only</option>
          <option value="read">Marked as Read</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical Severity Only</option>
          <option value="warning">Warning / Low Stock Only</option>
          <option value="info">Info / Overstock Only</option>
        </select>

        <div className="ml-auto text-xs text-slate-400 font-medium">
          Active Alerts: <strong className="text-slate-900 dark:text-white">{activeCount}</strong>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-7 w-7 animate-spin text-rose-500" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Clear! No alerts match your filter.</h3>
          <p className="text-xs text-slate-400 mt-1">Retail stock levels and velocity are within normal thresholds.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all ${
                alert.status === 'resolved' || alert.status === 'dismissed'
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-60'
                  : (alert.severity === 'critical'
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-500/5 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm')
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                    {getAlertIcon(alert.alert_type, alert.severity)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        alert.severity === 'critical'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                          : (alert.severity === 'warning'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400')
                      }`}>
                        {alert.severity}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {alert.title}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {alert.created_at.slice(0, 10)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                      {alert.message}
                    </p>

                    {alert.impact && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <strong>Impact:</strong> {alert.impact}
                      </p>
                    )}

                    {alert.recommended_action && (
                      <p className="text-xs text-sky-600 dark:text-sky-400 mt-1 font-medium">
                        <strong>Recommended Action:</strong> {alert.recommended_action}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {alert.product_id && (
                    <button
                      onClick={() => onSelectProductForForecast(alert.product_id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-sky-600 hover:text-sky-500 bg-sky-50 dark:bg-sky-950/60 rounded-lg flex items-center gap-1"
                    >
                      <span>Forecast</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  )}
                  {alert.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(alert.id, 'read')}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        title="Mark as Read"
                      >
                        Read
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(alert.id, 'resolved')}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
                        title="Mark as Resolved"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(alert.id, 'dismissed')}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                        title="Dismiss"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {alert.status !== 'active' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {alert.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
