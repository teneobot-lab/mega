import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Printer, FileText, Calendar, Wallet } from "lucide-react";
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

export default function PurchaseInvoice() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [printData, setPrintData] = useState<Invoice | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await fetch("/api/purchasing/invoices", {
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
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
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
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic italic">Faktur Pembelian</h1>
            <p className="text-xs text-zinc-500 font-medium tracking-tight">Manajemen kewajiban vendor dan stok masuk secara akurat</p>
        </div>
        <Button 
            onClick={() => navigate("/purchasing/invoice/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-bold gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
            <Plus className="w-4 h-4" /> Faktur Baru
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-xl text-red-600"><Wallet className="w-6 h-6" /></div>
              <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Total Hutang</span>
                  <span className="text-xl font-black text-[#1e3a5f] tabular-nums">Rp {data.reduce((s,i) => s + (i.status === 'UNPAID' ? i.balance : 0), 0).toLocaleString()}</span>
              </div>
          </div>
          {/* Add more stats if needed */}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic tracking-widest italic">
              <TableHead className="pl-6">Status</TableHead>
              <TableHead>Nomor Faktur</TableHead>
              <TableHead>Tanggal & Tempo</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Total Tagihan</TableHead>
              <TableHead className="text-right">Sisa Tagihan</TableHead>
              <TableHead className="text-center w-24 pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-20 text-zinc-400 font-bold uppercase tracking-widest italic">Loading data...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-24 text-zinc-300 font-black uppercase tracking-[0.2em]">Belum ada data Faktur</TableCell></TableRow>
            ) : (
              data.map((inv) => (
                <TableRow key={inv.id} className="h-16 group hover:bg-zinc-50 transition-all active:bg-zinc-100 cursor-pointer">
                  <TableCell className="pl-6" onClick={() => navigate(`/purchasing/invoice/${inv.id}`)}>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${inv.status === 'UNPAID' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                      {inv.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-black text-[#1e3a5f]" onClick={() => navigate(`/purchasing/invoice/${inv.id}`)}>
                    <div className="flex flex-col">
                        <span>{inv.invNumber}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">#{inv.id.slice(-6)}</span>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => navigate(`/purchasing/invoice/${inv.id}`)}>
                      <div className="flex flex-col text-xs font-bold text-zinc-600">
                        <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-zinc-400" /> {new Date(inv.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-1.5 text-red-500"><Calendar className="w-3 h-3 text-red-300" /> {new Date(inv.dueDate).toLocaleDateString()}</div>
                      </div>
                  </TableCell>
                  <TableCell className="font-bold text-zinc-700 uppercase italic tracking-tight" onClick={() => navigate(`/purchasing/invoice/${inv.id}`)}>{inv.contact?.name}</TableCell>
                  <TableCell className="text-right font-black text-zinc-400 tabular-nums" onClick={() => navigate(`/purchasing/invoice/${inv.id}`)}>Rp {inv.total.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-black text-[#1e3a5f] tabular-nums" onClick={() => navigate(`/purchasing/invoice/${inv.id}`)}>Rp {inv.balance.toLocaleString()}</TableCell>
                  <TableCell className="text-center pr-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-[#1e3a5f] hover:bg-zinc-100 rounded-full"
                      onClick={(e) => { e.stopPropagation(); handlePrint(inv); }}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
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
