import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FormToolbar } from './FormToolbar';
import { FormStatusBar } from './FormStatusBar';
import { cn } from '../../lib/utils';

interface FullscreenFormLayoutProps {
  children: React.ReactNode;
  title: string;
  module: string;
  status: 'DRAFT' | 'POSTED' | 'CANCELLED' | 'PARTIAL';
  onSave?: () => void;
  onSaveAndNew?: () => void;
  onPrint?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  isAutoSaving?: boolean;
  isEdit?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  watermark?: string;
}

export const FullscreenFormLayout: React.FC<FullscreenFormLayoutProps> = ({
  children,
  title,
  module,
  status,
  onSave,
  onSaveAndNew,
  onPrint,
  onCopy,
  onDelete,
  onCancel,
  isSaving,
  isEdit,
  createdBy,
  createdAt,
  updatedBy,
  updatedAt,
  isAutoSaving,
  watermark
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, duration: 0.3 }}
        className="fixed inset-0 z-[1000] bg-[#f8fafc] flex flex-col h-screen w-screen overflow-hidden text-zinc-900"
      >
        <FormToolbar 
          title={title}
          module={module}
          onSave={onSave}
          onSaveAndNew={onSaveAndNew}
          onPrint={onPrint}
          onCopy={onCopy}
          onDelete={onDelete}
          onCancel={onCancel}
          isSaving={isSaving}
          isEdit={isEdit}
          canDelete={status === 'DRAFT'}
        />
        
        <FormStatusBar 
          status={status}
          createdBy={createdBy}
          createdAt={createdAt}
          updatedBy={updatedBy}
          updatedAt={updatedAt}
          isAutoSaving={isAutoSaving}
        />

        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          {status === 'CANCELLED' && (
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.03] select-none">
              <span className="text-[20vw] font-black uppercase -rotate-45 whitespace-nowrap">
                CANCELLED
              </span>
            </div>
          )}
          {watermark && (
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.03] select-none">
              <span className="text-[15vw] font-black uppercase -rotate-45 whitespace-nowrap">
                {watermark}
              </span>
            </div>
          )}
          <div className="relative z-10 p-6 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
