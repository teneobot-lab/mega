import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface UseFullscreenFormOptions {
  onSave?: () => Promise<void>;
  onAutoSave?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel?: () => void;
  autoSaveInterval?: number;
}

export function useFullscreenForm({
  onSave,
  onAutoSave,
  onDelete,
  onCancel,
  autoSaveInterval = 30000
}: UseFullscreenFormOptions = {}) {
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate();

  // Auto Save logic
  useEffect(() => {
    let interval: any;
    if (isDirty && onAutoSave && !isSaving && !isAutoSaving) {
      interval = setInterval(async () => {
        setIsAutoSaving(true);
        try {
          await onAutoSave();
        } catch (e) {
          console.error("Auto-save failed", e);
        } finally {
          setIsAutoSaving(false);
        }
      }, autoSaveInterval);
    }
    return () => clearInterval(interval);
  }, [isDirty, onAutoSave, isSaving, isAutoSaving, autoSaveInterval]);

  // Guard unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }
      if (e.key === 'Escape') {
        handleCancel();
      }
      if (e.key === 'Delete' && !isSaving) {
        // Typically triggered if focus is not in input
        onDelete?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, isSaving]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      if (confirm("Ada perubahan belum disimpan. Simpan sekarang?")) {
        onSave?.();
      } else {
        if (onCancel) onCancel();
        else navigate(-1);
      }
    } else {
      if (onCancel) onCancel();
      else navigate(-1);
    }
  }, [isDirty, onSave, onCancel, navigate]);

  return {
    isDirty,
    setIsDirty,
    isSaving,
    setIsSaving,
    isAutoSaving,
    data,
    setData,
    handleCancel
  };
}
