import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Printer, ShoppingCart, CheckCircle } from "lucide-react";
import { PrintInvoice } from "../../components/PrintInvoice";

type PO = {
  id: string;
  poNumber: string;
  date: string;
  supplier: { name: string, address?: string };
  status: string;
  total: number;
  Notes?: string;
  Lines?: any[];
};

export default function PurchaseOrder() {
  const [data, setData] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [printData, setPrintData] = useState<any>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await fetch("/api/purchasing/orders", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data PO");
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
      const res = await fetch(`/api/purchasing/orders/${id}/approve`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) throw new Error("Gagal menyetujui PO");
      toast.success("PO berhasil disetujui");
      fetchData();
    } catch(e: any) {
      toast.error(e.message);
    }
  };

  const handlePrint = (po: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const printObj = {
        ...po,
        invNumber: po.poNumber,
        contact: po.supplier,
        type: "PURCHASE",
    };
    setPrintData(printObj);
    setTimeout(() => {
        window.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Print Area */}
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        <PrintInvoice data={printData} title="PESANAN PEMBELIAN" />
      </div>

      <div className="flex items-center justify-between print:hidden">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic">Daftar Pesanan Pembelian</h1>
            <p className="text-xs text-zinc-500 font-medium">Lacak pesanan kepada pemasok / vendor anda</p>
        </div>
        <Button 
            onClick={() => navigate("/purchasing/po/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-bold gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Buat PO Baru
        </Button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12 text-zinc-500 uppercase font-black text-[10px] tracking-widest text-center">
              <TableHead className="pl-6 text-left">Status</TableHead>
              <TableHead className="text-left">Nomor PO</TableHead>
              <TableHead className="text-left">Tanggal</TableHead>
              <TableHead className="text-left">Supplier</TableHead>
              <TableHead className="text-right">Nilai Total</TableHead>
              <TableHead className="pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                        <ShoppingCart className="h-12 w-12" />
                        <p className="text-sm font-bold uppercase tracking-widest">Belum ada data PO</p>
                    </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((po) => (
                <TableRow 
                    key={po.id} 
                    className="group hover:bg-zinc-50 transition-colors h-14 cursor-pointer"
                    onClick={() => navigate(`/purchasing/po/${po.id}`)}
                >
                  <TableCell className="pl-6">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${po.status === 'DRAFT' ? 'bg-zinc-100' : po.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'} shadow-sm`}>
                      {po.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-[#1e3a5f] group-hover:underline ">{po.poNumber}</TableCell>
                  <TableCell className="text-xs font-medium text-zinc-500">{new Date(po.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell className="text-sm font-bold text-zinc-700">{po.supplier?.name}</TableCell>
                  <TableCell className="text-right font-black text-[#1e3a5f] tabular-nums">Rp {po.total.toLocaleString()}</TableCell>
                  <TableCell className="text-center pr-6">
                    <div className="flex items-center justify-center gap-1">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={(e) => handlePrint(po, e)}
                        >
                            <Printer className="h-4 w-4" />
                        </Button>
                        {po.status === "DRAFT" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => handleApprove(po.id, e)} 
                            className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
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
