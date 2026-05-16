import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Printer, ShoppingCart, CheckCircle, ChevronDown } from "lucide-react";
import { PrintInvoice } from "../../components/PrintInvoice";
import { PrintPreviewDialog } from "../../components/PrintPreviewDialog";
import { salesApi } from "../../lib/api-services";
import { formatCurrency, formatDate, cn } from "../../lib/utils";
import { TableSkeleton } from "../../components/ui/table-skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { ErrorMessage } from "../../components/ui/error-message";
import { StatusBadge } from "../../components/ui/status-badge";

type SO = {
  id: string;
  number: string;
  date: string;
  customer: { name: string, address?: string };
  status: string;
  total: number;
  Notes?: string;
  Lines?: any[];
};

export default function SalesOrder() {
  const [data, setData] = useState<SO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printData, setPrintData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await salesApi.getOrders();
      setData(resData);
    } catch (e: any) {
      setError(e.message || "Gagal mengambil data SO");
      toast.error(e.message || "Gagal mengambil data SO");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await salesApi.approveOrder(id);
      toast.success("SO berhasil disetujui");
      fetchData();
    } catch(e: any) {
      toast.error(e.message || "Gagal menyetujui SO");
    }
  };

  const handlePrint = (so: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const printObj = {
        ...so,
        invNumber: so.number,
        contact: so.customer,
        type: "SALES",
    };
    setPrintData(printObj);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        <PrintInvoice data={printData} title="PESANAN PENJUALAN" />
      </div>

      <PrintPreviewDialog 
        open={showPreview}
        onOpenChange={setShowPreview}
        title="Pesanan Penjualan"
        data={printData}
        Component={(props) => <PrintInvoice {...props} title="PESANAN PENJUALAN" />}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tighter text-[#1e3a5f] uppercase italic italic">
            Pesanan Penjualan
          </h1>
          <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase italic opacity-70 leading-none">
            Rekam dan lacak pesanan dari pelanggan anda
          </p>
        </div>
        <Button
          onClick={() => navigate("/sales/so/new")}
          className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 px-8 h-12 rounded-full"
        >
          <Plus className="w-5 h-5" /> Buat SO Baru
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
            title="Belum ada pesanan penjualan"
            description="Rekam dan lacak pesanan dari pelanggan Anda di sini."
            actionLabel="Buat SO Pertama"
            onAction={() => navigate("/sales/so/new")}
            icon={<ShoppingCart className="h-10 w-10 text-zinc-300" />}
            className="py-24"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow className="h-14 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic italic border-b border-zinc-100">
                  <TableHead className="pl-10 w-32">Status</TableHead>
                  <TableHead>Nomor SO</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead className="text-right">Nilai Total</TableHead>
                  <TableHead className="text-center w-32 pr-10">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((so) => (
                  <TableRow
                    key={so.id}
                    className="h-20 group hover:bg-zinc-50 transition-all cursor-pointer border-b border-zinc-50 last:border-0"
                    onClick={() => navigate(`/sales/so/${so.id}`)}
                  >
                    <TableCell className="pl-10">
                      <StatusBadge status={so.status} />
                    </TableCell>
                    <TableCell>
                      <span className="font-black text-[#1e3a5f] uppercase tracking-tighter text-base group-hover:underline decoration-2 underline-offset-4">
                        {so.number}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-zinc-500 italic">
                        {formatDate(so.date)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-black text-zinc-700 uppercase italic italic group-hover:text-[#1e3a5f] transition-colors text-sm">
                        {so.customer?.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-black text-[#1e3a5f] tabular-nums text-xl italic italic leading-none">
                      {formatCurrency(so.total)}
                    </TableCell>
                    <TableCell className="text-center pr-10">
                      <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 text-zinc-300 hover:text-red-600 hover:bg-white hover:shadow-md rounded-full transition-all"
                          onClick={(e) => handlePrint(so, e)}
                        >
                          <Printer className="h-5 w-5" />
                        </Button>
                        {so.status === "DRAFT" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 text-green-600 hover:bg-white hover:shadow-md rounded-full transition-all"
                            onClick={(e) => handleApprove(so.id, e)}
                          >
                            <CheckCircle className="h-5 w-5" />
                          </Button>
                        )}
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

