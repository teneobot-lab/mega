import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Printer, FileText } from "lucide-react";
import { PrintInvoice } from "../../components/PrintInvoice";

type Invoice = {
  id: string;
  invNumber: string;
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
  const [printData, setPrintData] = useState<Invoice | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await fetch("/api/sales/invoices", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data Faktur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = (inv: Invoice) => {
    setPrintData(inv);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Printable Area */}
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        <PrintInvoice data={printData} />
      </div>

      <div className="flex items-center justify-between print:hidden">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic">Daftar Faktur Penjualan</h1>
            <p className="text-xs text-zinc-500 font-medium">Kelola dan cetak tagihan piutang pelanggan anda</p>
        </div>
        <Button 
            onClick={() => navigate("/sales/invoice/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-bold gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Buat Faktur Baru
        </Button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12">
              <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Nomor Faktur</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Tanggal</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Pelanggan</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6">Total Faktur</TableHead>
              <TableHead className="text-center w-32 pr-6 text-[10px] font-black uppercase tracking-widest">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                        <FileText className="h-12 w-12" />
                        <p className="text-sm font-bold uppercase tracking-widest">Belum ada data Faktur</p>
                    </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((inv) => (
                <TableRow key={inv.id} className="group hover:bg-zinc-50 transition-colors h-14 cursor-pointer" onClick={() => navigate(`/sales/invoice/${inv.id}`)}>
                  <TableCell className="pl-6">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${inv.status === 'UNPAID' ? 'bg-red-100 text-red-700 shadow-sm' : 'bg-green-100 text-green-700 shadow-sm'}`}>
                      {inv.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-[#1e3a5f] group-hover:underline ">{inv.invNumber}</TableCell>
                  <TableCell className="text-xs font-medium text-zinc-500">{new Date(inv.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell className="text-sm font-bold text-zinc-700">{inv.contact?.name}</TableCell>
                  <TableCell className="text-right font-black text-[#1e3a5f] pr-6">Rp {inv.total.toLocaleString()}</TableCell>
                  <TableCell className="text-center pr-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={() => handlePrint(inv)}
                        >
                            <Printer className="h-4 w-4" />
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
