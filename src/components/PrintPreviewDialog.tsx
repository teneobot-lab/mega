import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Printer, X } from "lucide-react";

interface PrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: any;
  Component: React.ComponentType<{ data: any }>;
}

export function PrintPreviewDialog({ open, onOpenChange, title, data, Component }: PrintPreviewDialogProps) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] w-[95vw] p-0 overflow-hidden bg-zinc-100 border-none shadow-2xl">
        <DialogHeader className="p-4 bg-white border-b flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-xl font-black italic tracking-tighter text-[#1e3a5f] uppercase">
            Print Preview: {title}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} size="sm" className="bg-red-700 hover:bg-red-800 text-white font-bold gap-2">
              <Printer className="w-4 h-4" /> Cetak Sekarang
            </Button>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9 w-9 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="max-h-[85vh] overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="bg-white shadow-lg mx-auto w-full max-w-[210mm] min-h-[297mm]">
             <Component data={data} />
          </div>
        </div>

        {/* Global Styles for Print */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-area, #printable-area * {
              visibility: visible;
            }
            #printable-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white;
            }
            .no-print {
              display: none !important;
            }
          }
        `}} />
      </DialogContent>
    </Dialog>
  );
}
