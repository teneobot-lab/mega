import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface FormNavigationProps {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  current,
  total,
  onPrev,
  onNext
}) => {
  return (
    <div className="flex items-center gap-4 bg-white border border-zinc-200 rounded-lg h-9 px-3 shadow-sm select-none">
      <div className="flex gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0"
          onClick={onPrev}
          disabled={current <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={onNext}
            disabled={current >= total}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight text-zinc-400">
        <span>Dokumen</span>
        <span className="text-zinc-800 tabular-nums">{current}</span>
        <span>dari</span>
        <span className="text-zinc-800 tabular-nums">{total}</span>
      </div>
    </div>
  );
};
