import React from 'react';

export default function StatusBadge({
  status = 'active',
  label,
  size = 'md',
  showDot = true
}) {
  const styles = {
    online: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    connected: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    offline: 'bg-rose-50 text-rose-700 border-rose-200',
    disconnected: 'bg-amber-50 text-amber-700 border-amber-200',
    connecting: 'bg-blue-50 text-blue-700 border-blue-200',
    idle: 'bg-slate-100 text-slate-700 border-slate-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const dotStyles = {
    online: 'bg-emerald-500 ring-emerald-200',
    connected: 'bg-emerald-500 ring-emerald-200',
    offline: 'bg-rose-500 ring-rose-200',
    disconnected: 'bg-amber-500 ring-amber-200',
    connecting: 'bg-blue-500 ring-blue-200 animate-pulse',
    idle: 'bg-slate-400 ring-slate-200',
    neutral: 'bg-slate-400 ring-slate-200'
  };

  const currentStyle = styles[status] || styles.neutral;
  const currentDotStyle = dotStyles[status] || dotStyles.neutral;

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${currentStyle} ${sizeClass}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ring-2 ${currentDotStyle}`}
        />
      )}
      <span>{label || status}</span>
    </span>
  );
}
