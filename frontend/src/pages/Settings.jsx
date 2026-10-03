import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Upload,
  Sparkles,
  Cloud,
  ShieldCheck,
  Database,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function Settings({ onLaunchDemo, isDemoLoading }) {
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadReport, setUploadReport] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploading(true);
      setUploadError(null);
      setUploadReport(null);
      const res = await api.uploadSalesCSV(uploadFile);
      setUploadReport(res);
      setUploadFile(null);
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'CSV upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Platform Configuration &amp; Pipelines
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Data ingestion pipeline, AWS cloud architecture, demo dataset reset, and security parameters.
        </p>
      </div>

      {/* 1. One-Click Hackathon Demo Mode */}
      <div className="p-6 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/50 dark:from-[#111827] dark:to-[#0f172a] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </span>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Hackathon One-Click Demo Mode
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
              Resets and loads realistic retail sales telemetry (66,000+ transactions), 20 catalog products with verified seasonal variations, 8 retail stores, and initial AI stockout warnings.
            </p>
          </div>

          <button
            onClick={onLaunchDemo}
            disabled={isDemoLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 shrink-0"
          >
            <Sparkles className={`h-4 w-4 ${isDemoLoading ? 'animate-spin' : ''}`} />
            <span>{isDemoLoading ? 'Seeding Real Data...' : 'Launch Demo'}</span>
          </button>
        </div>
      </div>

      {/* 2. Automated Data Ingestion & Preprocessing Pipeline */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="h-5 w-5 text-sky-500" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            Automated Data Ingestion &amp; Preprocessing
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Upload any raw sales CSV. Automated pipeline validates headers, removes duplicates, handles missing values, corrects negative numbers, and caps IQR outliers.
        </p>

        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-sky-500 transition-colors">
            <input
              type="file"
              accept=".csv"
              id="sales-csv-upload"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="hidden"
            />
            <label htmlFor="sales-csv-upload" className="cursor-pointer flex flex-col items-center">
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {uploadFile ? uploadFile.name : 'Click to select Sales CSV file'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                Supports transaction_id, date, product_id, quantity, unit_price, discount, revenue
              </span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!uploadFile || uploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm disabled:opacity-50 transition-colors"
            >
              {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4" />}
              <span>{uploading ? 'Processing Pipeline...' : 'Upload & Clean Data'}</span>
            </button>
          </div>
        </form>

        {/* Upload Success Report */}
        {uploadReport && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 text-xs text-slate-700 dark:text-slate-300 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 mb-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{uploadReport.message}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-900">
              <div>Initial Rows: <strong>{uploadReport.data_cleaning_report.initial_rows}</strong></div>
              <div>Duplicates Dropped: <strong>{uploadReport.data_cleaning_report.duplicates_removed}</strong></div>
              <div>Negative Values Fixed: <strong>{uploadReport.data_cleaning_report.negative_quantities_fixed}</strong></div>
              <div>Quality Score: <strong className="text-emerald-500">{uploadReport.data_cleaning_report.quality_score}%</strong></div>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-800 text-xs text-rose-600">
            {uploadError}
          </div>
        )}
      </div>

      {/* 3. AWS Cloud Architecture & Infrastructure */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Cloud className="h-5 w-5 text-indigo-500" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            AWS Cloud Architecture Overview
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Production topology designed for high-availability enterprise retail deployments.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="text-amber-500">🪣</span> Amazon S3
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Raw telemetry lake, daily reports, and serialized scikit-learn models.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="text-orange-500">⚡</span> AWS Lambda
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Serverless Mangum ASGI event handler executing real-time demand inference.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="text-blue-500">🐘</span> RDS PostgreSQL
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Multi-AZ relational storage for inventory SKUs, sales logs, and alerts.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="text-purple-500">📡</span> API Gateway
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Secure REST API gateway with rate-limiting, CORS, and CloudWatch telemetry.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
