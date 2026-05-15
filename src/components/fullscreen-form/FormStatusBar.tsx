import React from 'react';
import { cn } from '../../lib/utils';

interface FormStatusBarProps {
  status: 'DRAFT' | 'POSTED' | 'CANCELLED' | 'PARTIAL';
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  isAutoSaving?: boolean;
  customInfo?: string;
}

export const FormStatusBar: React.FC<FormStatusBarProps> = ({
  status,
  createdBy = 'Admin',
  createdAt = '15 Mei 2026 10:00',
  updatedBy = 'Admin',
  updatedAt = '15 Mei 2026 14:30',
  isAutoSaving,
  customInfo
}) => {
  const statusColors = {
    DRAFT: 'bg-zinc-200 text-zinc-700',
    POSTED: 'bg-green-100 text-green-700 font-bold',
    CANCELLED: 'bg-red-100 text-red-700',
    PARTIAL: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="h-7 bg-[#f0f4f8] border-b border-zinc-200 flex items-center justify-between px-3 text-[10px] font-medium text-zinc-500">
      <div className="flex items-center gap-4">
        <span className={cn(
          "px-2 py-0.5 rounded leading-none text-[9px] font-black uppercase tracking-wider shadow-sm",
          statusColors[status]
        )}>
          {status}
        </span>

        {isAutoSaving && (
            <div className="flex items-center gap-1.5 text-primary animate-pulse border-l border-zinc-300 pl-4">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span className="font-black uppercase tracking-widest text-[9px]">Menyimpan Draft...</span>
            </div>
        )}

        <div className="flex items-center gap-1 border-l border-zinc-300 pl-4 uppercase tracking-tighter">
          <span>Dibuat oleh:</span>
          <span className="font-bold text-zinc-700">{createdBy}</span>
          <span className="mx-1 text-zinc-300">|</span>
          <span>{createdAt}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 border-l border-zinc-300 pl-4 uppercase tracking-tighter">
        {customInfo ? (
            <span className="text-primary font-bold">{customInfo}</span>
        ) : (
            <>
                <span>Terakhir diubah:</span>
                <span className="font-bold text-zinc-700">{updatedBy}</span>
                <span className="mx-1 text-zinc-300">|</span>
                <span>{updatedAt}</span>
            </>
        )}
      </div>
    </div>
  );
};
