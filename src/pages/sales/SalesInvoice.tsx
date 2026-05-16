import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Printer, FileText } from "lucide-react";
import { PrintInvoice } from "../../components/PrintInvoice";
import { PrintPreviewDialog } from "../../components/PrintPreviewDialog";
import { salesApi } from "../../lib/api-services";
import { formatCurrency, formatDate, cn } from "../../lib/utils";
import { TableSkeleton } from "../../components/ui/table-skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { ErrorMessage } from "../../components/ui/error-message";
import { StatusBadge } from "../../components/ui/status-badge";

type Invoice = {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  contact: { name: string, address?: string };
  status: string;
  balance: number;
  subTotal: number;
  total: number;
  notes?: string;
  Lines?: any[];
};

export default function SalesInvoice() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printData, setPrintData] = useState<Invoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await salesApi.getInvoices();
      setData(resData);
    } catch (e: any) {
      setError(e.message || "Gagal mengambil data Faktur");
      toast.error(e.message || "Gagal mengambil data Faktur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setPrintData({ ...inv, type: "SALES" } as any);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        <PrintInvoice data={printData} />
      </div>

      <PrintPreviewDialog 
        open={showPreview}
        onOpenChange={setShowPreview}
        title="Faktur Penjualan"
        data={printData}
        Component={PrintInvoice}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tighter text-[#1e3a5f] uppercase italic italic">
            Faktur Penjualan
          </h1>
          <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase italic opacity-70 leading-none">
            Kelola dan cetak tagihan piutang pelanggan Anda
          </p>
        </div>
        <Button
          onClick={() => navigate("/sales/invoice/new")}
          className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 px-8 h-12 rounded-full"
        >
          <Plus className="w-5 h-5" /> Buat Faktur Baru
        </Button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden text-sm">
        {error ? (
          <ErrorMessage message={error} onRetry={fetchData} className="py-20" />
        ) : loading ? (
          <div className="p-8">
            <TableSkeleton rowCount={8} columnCount={6} />
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            title="Belum ada faktur"
            description="Kelola dan cetak tagihan piutang pelanggan Anda di sini."
            actionLabel="Buat Faktur Pertama"
            onAction={() => navigate("/sales/invoice/new")}
            icon={<FileText className="h-10 w-10 text-zinc-300" />}
            className="py-24"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow className="h-14 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic italic border-b border-zinc-100">
                  <TableHead className="pl-10 w-32">Status</TableHead>
                  <TableHead>Nomor Faktur</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead className="text-right">Total Faktur</TableHead>
                  <TableHead className="text-center w-32 pr-10">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((inv) => (
                  <TableRow
                    key={inv.id}
                    className="h-20 group hover:bg-zinc-50 transition-all cursor-pointer border-b border-zinc-50 last:border-0"
                    onClick={() => navigate(`/sales/invoice/${inv.id}`)}
                  >
                    <TableCell className="pl-10">
                      <StatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell>
                      <span className="font-black text-[#1e3a5f] uppercase tracking-tighter text-base group-hover:underline decoration-2 underline-offset-4">
                        {inv.number}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-zinc-500 italic">
                        {formatDate(inv.date)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-black text-zinc-700 uppercase italic italic group-hover:text-[#1e3a5f] transition-colors text-sm">
                        {inv.contact?.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-black text-[#1e3a5f] tabular-nums text-xl italic italic leading-none">
                      {formatCurrency(inv.total)}
                    </TableCell>
                    <TableCell className="text-center pr-10">
                      <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 text-zinc-300 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-full transition-all"
                          onClick={(e) => handlePrint(inv, e)}
                        >
                          <Printer className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        )}
      </div>
    </div>
  );
}

