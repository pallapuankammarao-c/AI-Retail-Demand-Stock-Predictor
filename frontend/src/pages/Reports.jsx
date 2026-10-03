import React from 'react';
import { FileSpreadsheet, Download, FileText, Printer, CheckCircle, ExternalLink } from 'lucide-react';

export default function Reports() {
  const exportItems = [
    {
      id: 'sales',
      title: 'Historical Sales Dataset CSV',
      desc: 'Export up to 5,000 clean sales transactions including discounts, profits, store ID, and categories.',
      url: '/api/reports/export/csv/sales',
      format: 'CSV (.csv)'
    },
    {
      id: 'inventory',
      title: 'Inventory & Stockout Intelligence CSV',
      desc: 'Complete matrix of all SKUs with daily demand, days remaining, reorder level, and health risk status.',
      url: '/api/reports/export/csv/inventory',
      format: 'CSV (.csv)'
    },
    {
      id: 'alerts',
      title: 'System Alerts & Exceptions Log CSV',
      desc: 'Log of all active and resolved stockout alerts, demand spikes, and overstock flags.',
      url: '/api/reports/export/csv/alerts',
      format: 'CSV (.csv)'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Data Export &amp; Intelligence Reports
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Generate production-ready analytical spreadsheets and executive PDF retail summaries.
        </p>
      </div>

      {/* Printable Executive PDF Intelligence Report Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-300">
              <Printer className="h-5 w-5" />
            </span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Executive Retail Intelligence Report (Print to PDF)
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
            A comprehensive, publication-ready executive briefing summarizing annual revenues, profit margins, critical SKU stockout schedules, and AI-driven purchase order recommendations.
          </p>
        </div>

        <a
          href="/api/reports/intelligence-report"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all shrink-0"
        >
          <span>Open Printable Report</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* CSV Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {exportItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {item.format}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <a
                href={item.url}
                download
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download CSV</span>
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
