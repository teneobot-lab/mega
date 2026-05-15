import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, BookOpen, Clock, Tag } from "lucide-react";

export default function GeneralJournal() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await fetch("/api/accounting/journals", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data jurnal");
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
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic">Jurnal Umum</h1>
            <p className="text-xs text-zinc-500 font-medium">Catatan transaksi akuntansi manual dan otomatis</p>
        </div>
        <Button 
            onClick={() => navigate("/accounting/journals/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-bold gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Buat Jurnal Baru
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
             <div className="text-center p-20 bg-white border border-zinc-200 rounded-2xl animate-pulse">
                <div className="h-4 w-32 bg-zinc-100 mx-auto rounded"></div>
             </div>
        ) : data.length === 0 ? (
            <div className="text-center py-24 bg-white border-2 border-dashed border-zinc-200 rounded-2xl">
                <div className="flex flex-col items-center gap-3 opacity-20">
                    <BookOpen className="h-16 w-16" />
                    <p className="text-sm font-black uppercase tracking-widest">Belum ada aktivitas jurnal</p>
                </div>
            </div>
        ) : (
          data.map(journal => (
            <div 
                key={journal.id} 
                className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/accounting/journals/${journal.id}`)}
            >
                <div className="bg-zinc-50/80 p-4 border-b border-zinc-100 flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nomor Bukti</span>
                        <span className="font-black text-[#1e3a5f] group-hover:underline">{journal.journalNumber} {journal.isAuto && "(AUTO)"}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tanggal</span>
                        <div className="flex items-center gap-1.5 text-zinc-600 font-bold text-xs uppercase">
                            <Clock className="w-3 h-3" />
                            {new Date(journal.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Keterangan</span>
                    <span className="font-bold text-[#1e3a5f] text-sm">{journal.description}</span>
                    {journal.reference && (
                        <div className="flex items-center justify-end gap-1 text-[10px] text-blue-500 font-bold uppercase mt-1">
                            <Tag className="w-2.5 h-2.5" />
                            Ref: {journal.reference}
                        </div>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead className="border-b border-zinc-100">
                            <tr className="h-10 text-zinc-400 font-bold uppercase text-[9px] tracking-widest">
                                <th className="pl-6 text-left font-bold">Akun Transaksi</th>
                                <th className="text-right w-48 font-bold">Debit</th>
                                <th className="text-right w-48 pr-6 font-bold">Kredit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {journal.Entries.map((e: any) => (
                                <tr key={e.id} className="h-10 group-hover:bg-zinc-50/30 transition-colors">
                                    <td className="pl-6">
                                        <span className="font-black text-zinc-400 mr-2">{e.account.code}</span>
                                        <span className="font-bold text-zinc-700">{e.account.name}</span>
                                    </td>
                                    <td className="text-right text-sm font-bold tabular-nums text-[#1e3a5f]">
                                        {e.debit > 0 ? `Rp ${e.debit.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="text-right pr-6 text-sm font-bold tabular-nums text-zinc-400">
                                        {e.credit > 0 ? `Rp ${e.credit.toLocaleString()}` : '-'}
                                    </td>
                                </tr>
                            ))}
                            <tr className="h-12 bg-zinc-50/50 font-black text-[#1e3a5f]">
                                <td className="pl-6 text-right uppercase tracking-widest text-[10px]">Balanced Total</td>
                                <td className="text-right text-sm italic tabular-nums pr-0">
                                    Rp {journal.Entries.reduce((s:any, e:any)=>s+e.debit, 0).toLocaleString()}
                                </td>
                                <td className="text-right pr-6 text-sm italic tabular-nums">
                                    Rp {journal.Entries.reduce((s:any, e:any)=>s+e.credit, 0).toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
