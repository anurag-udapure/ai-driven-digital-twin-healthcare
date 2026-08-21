import React from 'react';

interface StatusBadgeProps {
  status: 'normal' | 'monitoring' | 'warning' | 'critical' | 'stable' | 'attention' | 'information' | 'pending' | 'active' | 'paused';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md', id }) => {
  const normalized = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-300';
  let dotColor = 'bg-slate-500';

  if (normalized === 'normal' || normalized === 'stable' || normalized === 'active') {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    dotColor = 'bg-emerald-600';
  } else if (normalized === 'monitoring' || normalized === 'information') {
    styles = 'bg-sky-50 text-sky-800 border-sky-300';
    dotColor = 'bg-sky-600';
  } else if (normalized === 'warning' || normalized === 'attention') {
    styles = 'bg-amber-50 text-amber-900 border-amber-300';
    dotColor = 'bg-amber-600';
  } else if (normalized === 'critical') {
    styles = 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse';
    dotColor = 'bg-rose-600';
  } else if (normalized === 'pending') {
    styles = 'bg-slate-100 text-slate-700 border-dashed border-slate-400';
    dotColor = 'bg-amber-500';
  } else if (normalized === 'paused') {
    styles = 'bg-amber-50 text-amber-800 border-amber-300';
    dotColor = 'bg-amber-500';
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3 py-1 font-medium' : 'text-xs px-2.5 py-1 font-medium';

  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 rounded-md border ${styles} ${sizeClasses} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{displayLabel}</span>
    </span>
  );
};
