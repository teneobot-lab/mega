import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Printer, Plus, Wallet, Calendar, Users, ArrowRightSquare } from "lucide-react";
import { PrintVoucher } from "../../components/PrintVoucher";
import { PrintPreviewDialog } from "../../components/PrintPreviewDialog";
import { salesApi } from "../../lib/api-services";
import { formatCurrency, formatDate, cn } from "../../lib/utils";
import { TableSkeleton } from "../../components/ui/table-skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { ErrorMessage } from "../../components/ui/error-message";

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
  const [error, setError] = useState<string | null>(null);
  const [printData, setPrintData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await salesApi.getPayments();
      setData(resData);
    } catch (e: any) {
      setError(e.message || "Gagal mengambil data Penerimaan");
      toast.error(e.message || "Gagal mengambil data Penerimaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = (pay: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const fundEntry = pay.Journals?.[0]?.Entries?.find((e: any) => (e.debit || 0) > 0);
    const voucherData = {
        ...pay,
        type: "RECEIVE",
        account: fundEntry?.account,
        invoice: pay.Lines?.[0]?.invoice
    };
    setPrintData(voucherData);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <PrintPreviewDialog 
        open={showPreview}
        onOpenChange={setShowPreview}
        title="Voucher Penerimaan"
        data={printData}
        Component={PrintVoucher}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tighter text-[#1e3a5f] uppercase italic italic">
            Penerimaan Piutang
          </h1>
          <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase italic opacity-70 leading-none">
            Pencatatan pembayaran masuk dari tagihan pelanggan
          </p>
        </div>
        <Button 
            onClick={() => navigate("/sales/payment/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 px-8 h-12 rounded-full"
        >
            <Plus className="w-5 h-5" /> Catat Pembayaran
        </Button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden text-sm">
        {error ? (
          <ErrorMessage message={error} onRetry={fetchData} className="py-20" />
        ) : loading ? (
          <div className="p-8">
            <TableSkeleton rowCount={8} columnCount={5} />
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            title="Belum ada penerimaan piutang"
            description="Pencatatan pembayaran masuk dari tagihan pelanggan Anda di sini."
            actionLabel="Buat Penerimaan"
            onAction={() => navigate("/sales/payment/new")}
            icon={<Wallet className="w-12 h-12 text-zinc-300" />}
            className="py-24"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow className="h-14 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic border-b border-zinc-100">
                  <TableHead className="pl-10">Identitas</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead className="text-right">Jumlah Diterima</TableHead>
                  <TableHead className="text-center w-32 pr-10">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((pay) => (
                  <TableRow 
                      key={pay.id} 
                      className="h-20 group hover:bg-zinc-50 transition-all cursor-pointer border-b border-zinc-50 last:border-0"
                      onClick={() => navigate(`/sales/payment/${pay.id}`)}
                  >
                    <TableCell className="pl-10">
                      <div className="flex flex-col">
                        <span className="font-black text-[#1e3a5f] uppercase tracking-tighter text-base group-hover:underline decoration-2 underline-offset-4">
                          {pay.payNumber}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">#{pay.id.slice(-6)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-zinc-500 italic">
                        {formatDate(pay.date)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-300" />
                        <span className="font-bold text-zinc-700 uppercase italic text-sm">{pay.contact?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-black text-emerald-600 tabular-nums text-xl italic italic leading-none">
                      {formatCurrency(pay.amount)}
                    </TableCell>
                    <TableCell className="text-center pr-10">
                      <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-10 w-10 p-0 text-zinc-300 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-full transition-all"
                            onClick={(e) => handlePrint(pay, e)}
                        >
                            <Printer className="h-5 w-5" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-10 w-10 p-0 text-zinc-300 hover:text-[#1e3a5f] hover:bg-white hover:shadow-md rounded-full transition-all active:scale-90"
                            onClick={() => navigate(`/sales/payment/${pay.id}`)}
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
