import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ArrowRightLeft, Calendar, Landmark, ArrowRightSquare } from "lucide-react";
import { financeApi } from "../../lib/api-services";

export default function TransferBank() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const resData = await financeApi.getTransfers();
      setData(resData);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengambil data transfer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic italic uppercase italic">Transfer Dana Bank</h1>
            <p className="text-xs text-zinc-500 font-medium tracking-tight uppercase italic opacity-70 tracking-widest leading-none tracking-widest">Riwayat pemindahan saldo antar rekening kas & bank</p>
        </div>
        <Button 
            onClick={() => navigate("/cash-bank/transfer/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 px-6"
        >
            <ArrowRightLeft className="w-4 h-4" /> Buat Transfer Baru
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden text-sm">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow>
              <TableHead className="w-32">Status</TableHead>
              <TableHead>No. Dokumen</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Dari Akun</TableHead>
              <TableHead className="text-center w-12"><ArrowRightLeft className="w-3 h-3 mx-auto" /></TableHead>
              <TableHead>Ke Akun</TableHead>
              <TableHead className="text-right">Jumlah Pindah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-20 text-zinc-400 font-medium uppercase tracking-widest italic">Memproses riwayat transfer...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-32 space-y-4">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                        <ArrowRightLeft className="w-12 h-12 text-zinc-300" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Belum ada riwayat transfer bank</span>
                    </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((d) => (
                <TableRow 
                    key={d.id} 
                    className="cursor-pointer"
                    onClick={() => navigate(`/cash-bank/transfer/${d.id}`)}
                >
                  <TableCell>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                      COMPLETED
                    </span>
                  </TableCell>
                  <TableCell className="font-black text-[#1e3a5f]">
                    <div className="flex flex-col">
                        <span>TRF-{d.id.slice(-6).toUpperCase()}</span>
                        <span className="text-[9px] font-bold text-zinc-400 tracking-widest opacity-60">ID: {d.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-zinc-500 italic">
                      <div className="flex items-center gap-1.5 uppercase leading-none italic uppercase">
                        <Calendar className="w-3 h-3 text-zinc-300" />
                        {new Date(d.date).toLocaleDateString('id-ID')}
                      </div>
                  </TableCell>
                  <TableCell className="font-bold text-red-500 uppercase italic">
                    <div className="flex items-center gap-2">
                        < Landmark className="w-3 h-3 opacity-30" />
                        {d.sourceAccount?.name || 'Rekening Sumber'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center opacity-20"><ArrowRightLeft className="w-4 h-4 mx-auto" /></TableCell>
                  <TableCell className="font-bold text-emerald-600 uppercase italic">
                    <div className="flex items-center gap-2">
                         <Landmark className="w-3 h-3 opacity-30" />
                         {d.targetAccount?.name || 'Rekening Tujuan'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-black text-[#1e3a5f] tabular-nums text-lg italic">
                    <div className="flex items-center justify-end gap-3">
                         <span>Rp {d.amount?.toLocaleString()}</span>
                         <ArrowRightSquare className="w-4 h-4 text-zinc-200 group-hover:text-[#1e3a5f] transition-colors" />
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
