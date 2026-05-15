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
      <div className="ac-toolbar overflow-hidden flex-shrink-0">
        <div className="flex items-center gap-2 max-w-[40%] overflow-hidden">
          <button 
            onClick={onCancel}
            className="ac-toolbar-btn ac-btn-cancel !border-none !p-1"
          >
            <ArrowLeft className="w-[14px] h-[14px]" />
          </button>
          <div className="flex items-center whitespace-nowrap overflow-hidden text-[11px]">
            <span className="text-[#BDC3C7]">{module}</span>
            <span className="text-[#BDC3C7] mx-1">›</span>
            <span className="text-white font-bold truncate">{title}</span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="ac-toolbar-btn ac-btn-save"
                onClick={onSave}
                disabled={isSaving}
              >
                <Save className="w-[14px] h-[14px]" />
                <span>Simpan</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Ctrl+S</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="ac-toolbar-btn ac-btn-save-new"
                onClick={onSaveAndNew}
                disabled={isSaving}
              >
                <PlusCircle className="w-[14px] h-[14px]" />
                <span>Simpan & Baru</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Ctrl+N</TooltipContent>
          </Tooltip>

          <div className="ac-toolbar-separator" />

          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="ac-toolbar-btn ac-btn-print"
                onClick={onPrint}
              >
                <Printer className="w-[14px] h-[14px]" />
                <span>Cetak</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Cetak (Ctrl+P)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="ac-toolbar-btn ac-btn-cancel"
                onClick={onCopy}
              >
                <Copy className="w-[14px] h-[14px]" />
                <span>Salin</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Duplikat</TooltipContent>
          </Tooltip>

          {isEdit && canDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="ac-toolbar-btn ac-btn-delete"
                  onClick={onDelete}
                  disabled={isSaving}
                >
                  <Trash2 className="w-[14px] h-[14px]" />
                  <span>Hapus</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Hapus (Del)</TooltipContent>
            </Tooltip>
          )}

          <div className="ac-toolbar-separator" />

          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="ac-toolbar-btn ac-btn-cancel"
                onClick={onCancel}
              >
                <X className="w-[14px] h-[14px]" />
                <span>Tutup</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Batal (Esc)</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
;
