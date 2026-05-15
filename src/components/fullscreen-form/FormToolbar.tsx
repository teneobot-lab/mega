import React from 'react';
import { ArrowLeft, Save, PlusCircle, Printer, Copy, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface FormToolbarProps {
  title: string;
  module: string;
  onSave?: () => void;
  onSaveAndNew?: () => void;
  onPrint?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  isEdit?: boolean;
  canDelete?: boolean;
}

export const FormToolbar: React.FC<FormToolbarProps> = ({
  title,
  module,
  onSave,
  onSaveAndNew,
  onPrint,
  onCopy,
  onDelete,
  onCancel,
  isSaving,
  isEdit,
  canDelete = true
}) => {
  return (
    <TooltipProvider>
      <div className="h-10 bg-[#1e3a5f] text-white flex items-center justify-between px-3 sticky top-0 z-[100] shadow-md select-none">
        <div className="flex items-center gap-3">
          <button 
            onClick={onCancel}
            className="hover:bg-white/10 p-1 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold tracking-widest text-blue-300 leading-none">
              {module}
            </span>
            <span className="text-xs font-bold leading-none mt-1">
              {title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-white hover:bg-white/10 gap-1.5 px-3"
                onClick={onSave}
                disabled={isSaving}
              >
                <Save className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Simpan</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ctrl+S</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-white hover:bg-white/10 gap-1.5 px-3"
                onClick={onSaveAndNew}
                disabled={isSaving}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Simpan & Baru</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ctrl+N</TooltipContent>
          </Tooltip>

          <div className="w-[1px] h-4 bg-white/20 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-white hover:bg-white/10"
                onClick={onPrint}
              >
                <Printer className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cetak (Ctrl+P)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-white hover:bg-white/10"
                onClick={onCopy}
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplikat</TooltipContent>
          </Tooltip>

          {isEdit && canDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-red-300 hover:bg-red-500 hover:text-white"
                  onClick={onDelete}
                  disabled={isSaving}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Hapus (Del)</TooltipContent>
            </Tooltip>
          )}

          <div className="w-[1px] h-4 bg-white/20 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-white hover:bg-white/10"
                onClick={onCancel}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Batal (Esc)</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
