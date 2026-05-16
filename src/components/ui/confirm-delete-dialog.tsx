import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  isLoading?: boolean;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Konfirmasi Hapus",
  description = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  itemName,
  isLoading = false,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader className="bg-red-600">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <p className="text-sm text-zinc-600 leading-relaxed font-medium">
            {description}
          </p>
          {itemName && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-[4px]">
              <p className="text-[10px] uppercase font-black tracking-widest text-red-400 mb-1">Data yang akan dihapus:</p>
              <p className="text-sm font-bold text-red-700 truncate">{itemName}</p>
            </div>
          )}
        </div>
        <DialogFooter className="bg-zinc-50 border-t border-zinc-100 gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-xs font-bold uppercase tracking-wider h-8"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider h-8 px-6 shadow-md"
          >
            {isLoading ? "Menghapus..." : "Hapus Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
