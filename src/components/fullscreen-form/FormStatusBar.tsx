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
  const statusClasses = {
    DRAFT: 'ac-status-draft',
    POSTED: 'ac-status-posted',
    CANCELLED: 'ac-status-cancelled',
    PARTIAL: 'ac-status-partial'
  };

  return (
    <div className="ac-statusbar shrink-0">
      <div className="flex items-center gap-2">
        <span className={cn("ac-status-badge", statusClasses[status] || 'ac-status-draft')}>
          {status}
        </span>

        {isAutoSaving && (
            <div className="flex items-center gap-1.5 text-[#2B5BA8] animate-pulse ml-2">
                <span className="font-bold uppercase text-[9px]">Autosaving...</span>
            </div>
        )}

        <div className="flex items-center gap-1 uppercase">
          <span className="opacity-60 ml-2">Dibuat oleh:</span>
          <span className="font-bold text-[#1A1A2E]">{createdBy}</span>
          <span className="mx-1 opacity-20">|</span>
          <span>{createdAt}</span>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1 uppercase">
        {customInfo ? (
            <span className="text-[#2B5BA8] font-bold">{customInfo}</span>
        ) : (
            <>
                <span className="opacity-60">Diubah oleh:</span>
                <span className="font-bold text-[#1A1A2E]">{updatedBy}</span>
                <span className="mx-1 opacity-20">|</span>
                <span>{updatedAt}</span>
            </>
        )}
      </div>
    </div>
  );
}
;
