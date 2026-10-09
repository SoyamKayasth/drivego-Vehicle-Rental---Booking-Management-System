import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading data...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500 gap-3 min-h-[160px]">
      <Loader2 className={`${sizeClasses[size] || 'w-6 h-6'} animate-spin text-emerald-600`} />
      {text && <p className="text-sm font-medium">{text}</p>}
    </div>
  );
};
