import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Printer, Plus, Wallet, Calendar, Users, ArrowRightSquare } from "lucide-react";
import { PrintVoucher } from "../../components/PrintVoucher";

type Payment = {
  id: string;
  payNumber: string;
  date: string;
  contact: { name: string };
  amount: number;
  type: string;
  invoice?: { invNumber: string };
  account?: { name: string };
  notes?: string;
  Journals?: any[];
};

export default function SalesPayment() {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [printData, setPrintData] = useState<any>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await fetch("/api/sales/payments", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data Penerimaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = (pay: any) => {
    const fundEntry = pay.Journals?.[0]?.Entries?.find((e: any) => e.debit > 0);
    const voucherData = {
        ...pay,
        type: "RECEIVE",
        account: fundEntry?.account,
        invoice: pay.Lines?.[0]?.invoice
    };
    setPrintData(voucherData);
    setTimeout(() => {
        window.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        <PrintVoucher data={printData} />
      </div>

      <div className="flex items-center justify-between print:hidden">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic uppercase italic">Penerimaan Pelunasan</h1>
            <p className="text-xs text-zinc-500 font-medium tracking-tight uppercase italic opacity-70 tracking-widest leading-none tracking-widest">Pencatatan pembayaran masuk dari tagihan pelanggan</p>
        </div>
        <Button 
            onClick={() => navigate("/sales/payment/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
            <Plus className="w-4 h-4" /> Catat Pembayaran Piutang
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden text-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic tracking-widest italic">
              <TableHead className="pl-6">Identitas</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nama Pelanggan</TableHead>
              <TableHead className="text-right">Jumlah Diterima</TableHead>
              <TableHead className="text-center w-24 pr-6">Bukti/Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-zinc-400 font-medium uppercase tracking-widest italic">Memuat riwayat bayar...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-24 text-zinc-300 font-black uppercase tracking-[0.2em] italic opacity-40">Belum ada penerimaan piutang</TableCell></TableRow>
            ) : (
              data.map((pay) => (
                <TableRow key={pay.id} className="h-16 group hover:bg-zinc-50 transition-all active:bg-zinc-100 cursor-pointer">
                  <TableCell className="pl-6" onClick={() => navigate(`/sales/payment/${pay.id}`)}>
                    <div className="flex flex-col">
                        <span className="font-black text-[#1e3a5f] uppercase italic italic group-hover:underline">{pay.payNumber}</span>
                        <span className="text-[9px] font-bold text-zinc-400 tracking-widest">#{pay.id.slice(-6)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-zinc-500 italic" onClick={() => navigate(`/sales/payment/${pay.id}`)}>
                      <div className="flex items-center gap-1.5 uppercase leading-none">
                        <Calendar className="w-3 h-3 text-zinc-300" />
                        {new Date(pay.date).toLocaleDateString()}
                      </div>
                  </TableCell>
                  <TableCell className="font-bold text-zinc-700 uppercase italic" onClick={() => navigate(`/sales/payment/${pay.id}`)}>
                    <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-zinc-300" />
                        {pay.contact?.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-black text-emerald-600 tabular-nums text-lg italic" onClick={() => navigate(`/sales/payment/${pay.id}`)}>
                    Rp {pay.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center pr-6">
                    <div className="flex items-center justify-center gap-1">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-zinc-300 hover:text-[#1e3a5f] rounded-full"
                            onClick={(e) => { e.stopPropagation(); handlePrint(pay); }}
                        >
                            <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-zinc-300 hover:text-[#1e3a5f] rounded-full"
                            onClick={() => navigate(`/sales/payment/${pay.id}`)}
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
