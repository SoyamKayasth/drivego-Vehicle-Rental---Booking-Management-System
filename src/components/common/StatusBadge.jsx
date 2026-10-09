import React from 'react';

export const StatusBadge = ({ status, type = 'booking' }) => {
  if (!status) return null;

  const s = String(status).toLowerCase();

  const getStyle = () => {
    switch (s) {
      case 'confirmed':
      case 'approved':
      case 'available':
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'active':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'cancelled':
      case 'rejected':
      case 'failed':
      case 'unavailable':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'maintenance':
      case 'refunded':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getLabel = () => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide border ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {getLabel()}
    </span>
  );
};
