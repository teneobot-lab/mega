import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { PackageOpen, Plus, Calendar, FileText, ArrowRightSquare, Box, Warehouse, Printer } from "lucide-react";
import { purchasingApi } from "../../lib/api-services";
import { PrintInvoice } from "../../components/PrintInvoice";
import { PrintPreviewDialog } from "../../components/PrintPreviewDialog";

export default function PurchaseReceipt() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [printData, setPrintData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const handlePrint = (d: any) => {
    setPrintData({
      ...d,
      type: "PURCHASE",
      invNumber: d.transNumber,
      contact: d.purchaseOrder?.contact || { name: "N/A" }
    });
    setShowPreview(true);
  };

  const fetchData = async () => {
    try {
      const resData = await purchasingApi.getReceipts();
      setData(resData);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengambil data penerimaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        <PrintInvoice data={printData} title="BUKTI PENERIMAAN BARANG" />
      </div>

      <PrintPreviewDialog 
        open={showPreview}
        onOpenChange={setShowPreview}
        title="Bukti Penerimaan Barang"
        data={printData}
        Component={(props) => <PrintInvoice {...props} title="BUKTI PENERIMAAN BARANG" />}
      />

      <div className="flex items-center justify-between print:hidden">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic uppercase italic">Penerimaan Barang</h1>
            <p className="text-xs text-zinc-500 font-medium tracking-tight uppercase italic opacity-70 tracking-widest leading-none">Pencatatan barang fisik masuk gudang dari pesanan pembelian</p>
        </div>
        <Button 
            onClick={() => navigate("/purchasing/receipt/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
            <PackageOpen className="w-4 h-4" /> Terima Barang
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden text-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic tracking-widest italic">
              <TableHead className="pl-6">Status</TableHead>
              <TableHead>No. Dokumen</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Referensi PO</TableHead>
              <TableHead>Gudang Tujuan</TableHead>
              <TableHead className="text-right">Total Baris</TableHead>
              <TableHead className="text-center w-24 pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-20 text-zinc-400 font-bold uppercase tracking-widest italic">Memuat penerimaan...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-24 text-zinc-300 font-black uppercase tracking-[0.2em] italic opacity-40">Belum ada barang masuk</TableCell></TableRow>
            ) : (
              data.map((d) => (
                <TableRow 
                    key={d.id} 
                    className="h-16 group hover:bg-zinc-50 transition-all active:bg-zinc-100 cursor-pointer"
                    onClick={() => navigate(`/purchasing/receipt/${d.id}`)}
                >
                  <TableCell className="pl-6">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                      RECEIVED
                    </span>
                  </TableCell>
                  <TableCell className="font-black text-[#1e3a5f]">
                    <div className="flex flex-col">
                        <span>{d.transNumber}</span>
                        <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase tracking-tighter">#{d.id.slice(-6)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-zinc-500 italic">
                      <div className="flex items-center gap-1.5 uppercase">
                        <Calendar className="w-3 h-3 text-zinc-300" />
                        {new Date(d.date).toLocaleDateString()}
                      </div>
                  </TableCell>
                  <TableCell className="font-bold text-blue-600 uppercase italic">
                    <div className="flex items-center gap-1.5 leading-none">
                        <FileText className="w-3 h-3 opacity-40" />
                        {d.reference}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-zinc-700 uppercase italic">
                      <div className="flex items-center gap-1.5">
                        <Warehouse className="w-3 h-3 text-zinc-400" />
                        {d.warehouseTo?.name}
                      </div>
                  </TableCell>
                  <TableCell className="text-right font-black text-zinc-400 tabular-nums uppercase pr-6">
                    {d.Lines.length} Items
                  </TableCell>
                  <TableCell className="text-center pr-6">
                    <div className="flex items-center justify-end gap-1">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-zinc-300 hover:text-[#1e3a5f] rounded-full"
                            onClick={(e) => { e.stopPropagation(); handlePrint(d); }}
                        >
                            <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-zinc-300 group-hover:text-[#1e3a5f] rounded-full"
                        >
                            <ArrowRightSquare className="h-5 w-5" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
