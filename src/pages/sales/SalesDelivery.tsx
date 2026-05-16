import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Truck, Plus, Calendar, ArrowRightSquare, Warehouse, FileText, Printer } from "lucide-react";
import { salesApi } from "../../lib/api-services";
import { PrintInvoice } from "../../components/PrintInvoice";
import { PrintPreviewDialog } from "../../components/PrintPreviewDialog";
import { formatDate, cn } from "../../lib/utils";
import { TableSkeleton } from "../../components/ui/table-skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { ErrorMessage } from "../../components/ui/error-message";
import { StatusBadge } from "../../components/ui/status-badge";

export default function SalesDelivery() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printData, setPrintData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const handlePrint = (d: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setPrintData({
      ...d,
      type: "SALES",
      invNumber: d.transNumber,
      contact: d.salesOrder?.contact || { name: "N/A" }
    });
    setShowPreview(true);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await salesApi.getDeliveries();
      setData(resData);
    } catch (e: any) {
      setError(e.message || "Gagal mengambil data pengiriman");
      toast.error(e.message || "Gagal mengambil data pengiriman");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <PrintPreviewDialog 
        open={showPreview}
        onOpenChange={setShowPreview}
        title="Bukti Pengiriman Barang"
        data={printData}
        Component={(props) => <PrintInvoice {...props} title="BUKTI PENGIRIMAN BARANG" />}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tighter text-[#1e3a5f] uppercase italic italic">
            Pengiriman Barang
          </h1>
          <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase italic opacity-70 leading-none">
            Manajemen pengeluaran barang pesanan (Delivery Order)
          </p>
        </div>
        <Button 
            onClick={() => navigate("/sales/delivery/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 px-8 h-12 rounded-full"
        >
            <Truck className="w-5 h-5" /> Kirim Barang
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
            title="Belum ada pengiriman"
            description="Manajemen pengeluaran barang pesanan (Delivery Order) Anda di sini."
            actionLabel="Buat Pengiriman"
            onAction={() => navigate("/sales/delivery/new")}
            icon={<Truck className="w-12 h-12 text-zinc-300" />}
            className="py-24"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow className="h-14 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic border-b border-zinc-100">
                  <TableHead className="pl-10 w-32">Status</TableHead>
                  <TableHead>No. Dokumen</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Ref Sales Order</TableHead>
                  <TableHead>Gudang Asal</TableHead>
                  <TableHead className="text-center w-32 pr-10">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((d) => (
                  <TableRow 
                      key={d.id} 
                      className="h-20 group hover:bg-zinc-50 transition-all cursor-pointer border-b border-zinc-50 last:border-0"
                      onClick={() => navigate(`/sales/delivery/${d.id}`)}
                  >
                    <TableCell className="pl-10">
                      <StatusBadge status="DELIVERED" variant="success" />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-[#1e3a5f] uppercase tracking-tighter text-base group-hover:underline decoration-2 underline-offset-4">
                          {d.transNumber}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">#{d.id.slice(-6)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-zinc-500 italic">
                        {formatDate(d.date)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-300" />
                        <span className="font-bold text-zinc-700 uppercase italic text-sm">{d.reference || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                           <Warehouse className="w-4 h-4 text-zinc-300 group-hover:text-amber-500 transition-colors" />
                           <span className="font-black text-[#1e3a5f] uppercase italic text-sm">{d.warehouseFrom?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center pr-10">
                      <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-10 w-10 p-0 text-zinc-300 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-full transition-all"
                            onClick={(e) => handlePrint(d, e)}
                        >
                            <Printer className="h-5 w-5" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-10 w-10 p-0 text-zinc-300 hover:text-[#1e3a5f] hover:bg-white hover:shadow-md rounded-full transition-all active:scale-90"
                        >
                            <ArrowRightSquare className="h-6 w-6" />
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
