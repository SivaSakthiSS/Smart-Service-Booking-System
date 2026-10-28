import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Database,
  Clock,
  Cpu
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';

export default function BackendHealthCard({
  healthData,
  loading,
  error,
  latency,
  onRefresh
}) {
  const [showJson, setShowJson] = useState(false);

  const isHealthy = !error && healthData?.success;
  const dbStatus = healthData?.data?.database?.status || 'unknown';
  const isDbConnected = healthData?.data?.database?.isConnected || false;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Backend Health & Runtime Diagnostics
            </h3>
            <p className="text-xs text-slate-500">
              Live telemetry queried from Express endpoint{' '}
              <code className="text-indigo-600 font-mono bg-indigo-50/50 px-1 py-0.5 rounded">
                GET /api/health
              </code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`}
            />
            <span>{loading ? 'Probing...' : 'Ping Server'}</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                Backend Connection Pending
              </h4>
              <p className="text-xs text-amber-800 mt-1">
                {error.message || 'Unable to reach backend at http://localhost:5000/api/health.'}
              </p>
              <div className="mt-3 text-xs bg-white/70 p-2.5 rounded border border-amber-200 font-mono text-slate-700">
                Start server command: <code className="font-bold text-slate-900">npm run dev:server</code>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">API Status</span>
              <Server className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge
                status={isHealthy ? 'online' : 'offline'}
                label={isHealthy ? 'Operational' : 'Unavailable'}
                size="sm"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Latency</span>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-lg font-bold font-mono text-slate-900">
              {latency ? `${latency} ms` : '—'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Database Ready</span>
              <Database className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge
                status={isDbConnected ? 'connected' : 'disconnected'}
                label={dbStatus.toUpperCase()}
                size="sm"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">System Uptime</span>
              <Cpu className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-sm font-semibold font-mono text-slate-900">
              {healthData?.data?.uptime?.formatted || '—'}
            </p>
          </div>
        </div>
      )}

      {/* Detail Metrics Bar */}
      {healthData?.data && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>
              Node: <strong className="text-slate-800 font-mono">{healthData.data.system?.nodeVersion}</strong>
            </span>
            <span>
              Environment: <strong className="text-slate-800 uppercase font-mono">{healthData.data.environment}</strong>
            </span>
            <span>
              Heap Used: <strong className="text-slate-800 font-mono">{healthData.data.system?.memoryUsageMB?.heapUsed} MB</strong>
            </span>
          </div>

          <button
            onClick={() => setShowJson(!showJson)}
            className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer underline text-xs"
          >
            {showJson ? 'Hide Raw JSON' : 'Inspect Raw JSON'}
          </button>
        </div>
      )}

      {showJson && healthData && (
        <pre className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-60">
          {JSON.stringify(healthData, null, 2)}
        </pre>
      )}
    </div>
  );
}
