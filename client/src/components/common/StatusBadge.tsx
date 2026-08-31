import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const getBadgeStyle = (st: string) => {
    switch (st?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-600/10';
      case 'UPCOMING':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/20';
      case 'ONGOING':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/10';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/10';
    }
  };

  const getDotStyle = (st: string) => {
    switch (st?.toUpperCase()) {
      case 'APPROVED':
      case 'ONGOING':
        return 'bg-emerald-500';
      case 'PENDING':
        return 'bg-amber-500 animate-pulse';
      case 'REJECTED':
        return 'bg-rose-500';
      case 'UPCOMING':
        return 'bg-indigo-500';
      default:
        return 'bg-slate-400';
    }
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ring-inset ${getBadgeStyle(
        status
      )} ${sizeClass} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${getDotStyle(status)}`} />
      {status}
    </span>
  );
};
