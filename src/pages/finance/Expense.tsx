import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { CreditCard, Plus, Calendar, Landmark, Printer } from "lucide-react";
import { financeApi } from "../../lib/api-services";
import { PrintVoucher } from "../../components/PrintVoucher";
import { PrintPreviewDialog } from "../../components/PrintPreviewDialog";

export default function Expense() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [printData, setPrintData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const handlePrint = (d: any) => {
    setPrintData({
        ...d,
        type: "PAY",
        payNumber: `EXP-${d.id.slice(-6).toUpperCase()}`,
        account: d.bankAccount,
    });
    setShowPreview(true);
  };

  const fetchData = async () => {
    try {
      const resData = await financeApi.getExpenses();
      setData(resData);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengambil data pengeluaran");
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
        <PrintVoucher data={printData} />
      </div>

      <PrintPreviewDialog 
        open={showPreview}
        onOpenChange={setShowPreview}
        title="Voucher Pengeluaran"
        data={printData}
        Component={PrintVoucher}
      />

      <div className="flex items-center justify-between print:hidden">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic italic uppercase italic">Pengeluaran Kas & Bank</h1>
            <p className="text-xs text-zinc-500 font-medium tracking-tight uppercase italic opacity-70 tracking-widest leading-none tracking-widest">Daftar biaya operasional dan pengeluaran dana lainnya</p>
        </div>
        <Button 
            onClick={() => navigate("/cash-bank/expense/new")}
            className="bg-[#b91c1c] hover:bg-[#991b1b] text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 px-6"
        >
            <Plus className="w-4 h-4" /> Catat Pengeluaran Baru
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden text-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic tracking-widest italic">
              <TableHead className="pl-6 w-32">Status</TableHead>
              <TableHead>No. Dokumen</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Akun Sumber</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead className="text-center w-24 pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-20 text-zinc-400 font-medium uppercase tracking-widest italic italic">Memproses data pengeluaran...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-32 space-y-4">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                        <CreditCard className="w-12 h-12 text-zinc-300" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Belum ada data pengeluaran</span>
                    </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((d) => (
                <TableRow 
                    key={d.id} 
                    className="h-16 group hover:bg-zinc-50 transition-all active:bg-zinc-100 cursor-pointer"
                    onClick={() => navigate(`/cash-bank/expense/${d.id}`)}
                >
                  <TableCell className="pl-6">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                      POSTED
                    </span>
                  </TableCell>
                  <TableCell className="font-black text-[#1e3a5f]">
                    <div className="flex flex-col">
                        <span>EXP-{d.id.slice(-6).toUpperCase()}</span>
                        <span className="text-[9px] font-bold text-zinc-400 tracking-widest opacity-60">ID: {d.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-zinc-500 italic">
                      <div className="flex items-center gap-1.5 uppercase leading-none italic uppercase">
                        <Calendar className="w-3 h-3 text-zinc-300" />
                        {new Date(d.date).toLocaleDateString()}
                      </div>
                  </TableCell>
                  <TableCell className="font-bold text-zinc-700 uppercase italic">
                    <div className="flex items-center gap-2">
                        <Landmark className="w-3 h-3 opacity-30" />
                        {d.bankAccount?.name || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-xs italic line-clamp-1 mt-6">
                    {d.notes || '-'}
                  </TableCell>
                  <TableCell className="text-right font-black text-[#b91c1c] tabular-nums text-lg italic pr-6">
                    Rp {d.amount?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center pr-6">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-[#1e3a5f] hover:bg-zinc-100 rounded-full"
                        onClick={(e) => { e.stopPropagation(); handlePrint(d); }}
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

