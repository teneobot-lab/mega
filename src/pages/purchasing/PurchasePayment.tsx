import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Printer, Plus, Wallet, Calendar, FileText } from "lucide-react";
import { PrintVoucher } from "../../components/PrintVoucher";
import { PrintPreviewDialog } from "../../components/PrintPreviewDialog";
import { purchasingApi } from "../../lib/api-services";

type Payment = {
  id: string;
  payNumber: string;
  date: string;
  contact: { name: string };
  amount: number;
  notes?: string;
  Journals?: any[];
  Lines?: any[];
};

export default function PurchasePayment() {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [printData, setPrintData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const resData = await purchasingApi.getPayments();
      setData(resData);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengambil data Pembayaran");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = (pay: any) => {
    const bankEntry = pay.Journals?.[0]?.Entries?.find((e: any) => (e.credit || 0) > 0);
    const voucherData = {
        ...pay,
        type: "PAY", 
        account: bankEntry?.account,
        invoice: pay.Lines?.[0]?.invoice
    };
    setPrintData(voucherData);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        <PrintVoucher data={printData} />
      </div>

      <PrintPreviewDialog 
        open={showPreview}
        onOpenChange={setShowPreview}
        title="Voucher Pembayaran"
        data={printData}
        Component={PrintVoucher}
      />

      <div className="flex items-center justify-between print:hidden">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic uppercase italic">Pembayaran Hutang</h1>
            <p className="text-xs text-zinc-500 font-medium tracking-tight">Pelunasan faktur pembelian dan kontrol arus kas keluar</p>
        </div>
        <Button 
            onClick={() => navigate("/purchasing/payment/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-bold gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
            <Plus className="w-4 h-4" /> Bayar Hutang
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic tracking-widest italic">
              <TableHead className="pl-6">Identitas Pembayaran</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nama Pemasok</TableHead>
              <TableHead className="text-right">Jumlah Dibayar</TableHead>
              <TableHead className="text-center w-24 pr-6">Bukti</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-zinc-400 font-bold uppercase tracking-widest italic">Memuat riwayat bayar...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-24 text-zinc-300 font-black uppercase tracking-[0.2em]">Belum ada riwayat pembayaran</TableCell></TableRow>
            ) : (
              data.map((pay) => (
                <TableRow key={pay.id} className="h-16 group hover:bg-zinc-50 transition-all active:bg-zinc-100 cursor-pointer">
                  <TableCell className="pl-6" onClick={() => navigate(`/purchasing/payment/${pay.id}`)}>
                    <div className="flex flex-col">
                        <span className="font-black text-[#1e3a5f] uppercase italic italic group-hover:underline">{pay.payNumber}</span>
                        <span className="text-[9px] font-bold text-zinc-400 tracking-widest">#{pay.id.slice(-6)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-zinc-500" onClick={() => navigate(`/purchasing/payment/${pay.id}`)}>
                      <div className="flex items-center gap-1.5 uppercase italic">
                        <Calendar className="w-3 h-3 text-zinc-300" />
                        {new Date(pay.date).toLocaleDateString()}
                      </div>
                  </TableCell>
                  <TableCell className="font-bold text-zinc-700 uppercase italic" onClick={() => navigate(`/purchasing/payment/${pay.id}`)}>{pay.contact?.name}</TableCell>
                  <TableCell className="text-right font-black text-[#1e3a5f] tabular-nums text-lg" onClick={() => navigate(`/purchasing/payment/${pay.id}`)}>
                      <div className="flex items-center justify-end gap-2 pr-4">
                        <Wallet className="w-3 h-3 text-zinc-300" />
                        Rp {pay.amount.toLocaleString()}
                      </div>
                  </TableCell>
                  <TableCell className="text-center pr-6">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-[#1e3a5f] hover:bg-zinc-100 rounded-full"
                        onClick={(e) => { e.stopPropagation(); handlePrint(pay); }}
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
