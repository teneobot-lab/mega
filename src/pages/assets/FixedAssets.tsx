import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { AlertCircle, Trash2, Box, Calendar, Calculator, TrendingDown } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";

export default function FixedAssets() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [disposeOpen, setDisposeOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const navigate = useNavigate();

  const [disposeDate, setDisposeDate] = useState(new Date().toISOString().split('T')[0]);
  const [disposeAmount, setDisposeAmount] = useState(0);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/assets", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data aset tetap");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDispose = async () => {
    if(!selectedAsset) return;
    try {
      const res = await fetch(`/api/assets/${selectedAsset.id}/dispose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ 
          date: disposeDate, 
          amount: disposeAmount, 
          notes: "Disposal Aset via UI" 
        })
      });
      if(!res.ok) throw new Error((await res.json()).message);
      toast.success("Aset berhasil di-dispose");
      setDisposeOpen(false);
      fetchData();
    } catch(e: any) {
      toast.error(e.message || "Gagal disposal aset");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic uppercase italic">Manajemen Aset Tetap</h1>
            <p className="text-xs text-zinc-500 font-medium">Monitoring perolehan, penyusutan, dan disposal aset perusahaan</p>
        </div>
        <Button 
            onClick={() => navigate("/assets/fixed/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-bold gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
            Tambah Aset Baru
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Box className="w-6 h-6" /></div>
              <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Unit Aset</span>
                  <span className="text-xl font-black text-[#1e3a5f]">{data.filter(d => d.status === 'ACTIVE').length} Aset Aktif</span>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-600"><Calculator className="w-6 h-6" /></div>
              <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nilai Perolehan</span>
                  <span className="text-xl font-black text-[#1e3a5f]">Rp {data.reduce((s,d) => s+(d.status === 'ACTIVE' ? d.purchasePrice : 0), 0).toLocaleString()}</span>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-xl text-red-600"><TrendingDown className="w-6 h-6" /></div>
              <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Akumulasi Penyusutan</span>
                  <span className="text-xl font-black text-red-600">Rp 0</span>
              </div>
          </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12 text-zinc-500 uppercase font-black text-[10px] tracking-widest">
              <TableHead className="pl-6">Identitas Aset</TableHead>
              <TableHead>Tgl Beli</TableHead>
              <TableHead className="text-right">Harga Beli</TableHead>
              <TableHead className="text-right">Metode & Umur</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-center pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={6} className="text-center py-20">Loading aset...</TableCell></TableRow>
            ) : data.length === 0 ? (
               <TableRow>
                   <TableCell colSpan={6} className="text-center py-24">
                        <div className="flex flex-col items-center gap-3 opacity-20">
                            <Box className="h-16 w-16" />
                            <p className="text-sm font-black uppercase tracking-widest">Belum ada aset tetap</p>
                        </div>
                   </TableCell>
               </TableRow>
            ) : (
                data.map(d => (
                    <TableRow 
                        key={d.id} 
                        className={`group h-16 hover:bg-zinc-50 transition-colors ${d.status === 'DISPOSED' ? 'bg-zinc-50 opacity-60 italic' : ''}`}
                    >
                        <TableCell className="pl-6" onClick={() => navigate(`/assets/fixed/${d.id}`)}>
                            <div className="flex flex-col">
                                <span className="font-black text-[#1e3a5f] group-hover:underline cursor-pointer">{d.name}</span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{d.code}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-zinc-500">
                             <div className="flex items-center gap-1.5 uppercase">
                                <Calendar className="w-3 h-3" />
                                {new Date(d.purchaseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                             </div>
                        </TableCell>
                        <TableCell className="text-right font-black text-[#1e3a5f] tabular-nums">Rp {d.purchasePrice.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                             <div className="flex flex-col text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-zinc-400">Straight Line</span>
                                <span className="text-blue-500">{d.usefulLife} Bulan</span>
                             </div>
                        </TableCell>
                        <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                d.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-600'
                            }`}>
                                {d.status}
                            </span>
                        </TableCell>
                        <TableCell className="text-center pr-6">
                            {d.status === 'ACTIVE' && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                                    onClick={() => {
                                        setSelectedAsset(d);
                                        setDisposeOpen(true);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={disposeOpen} onOpenChange={setDisposeOpen}>
        <DialogContent className="max-w-md rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-700 font-black italic uppercase tracking-tighter text-2xl">
              <AlertCircle className="w-6 h-6 mr-3" /> Disposal Aset
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-xs text-red-800 leading-relaxed font-bold">
              PERHATIAN: Anda akan menghentikan penggunaan aset <span className="underline">{selectedAsset?.name}</span>. 
              Penyusutan otomatis akan dihentikan dan jurnal pembalik akan dibuat secara otomatis.
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tanggal Disposal</Label>
              <Input type="date" className="h-10 border-zinc-300 font-bold" value={disposeDate} onChange={e => setDisposeDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Nilai disposal / Harga Jual Akhir</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold opacity-30">Rp</span>
                <Input type="number" className="h-12 pl-10 border-zinc-300 text-xl font-black italic italic" value={disposeAmount} onChange={e => setDisposeAmount(Number(e.target.value))} placeholder="0" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3 sm:justify-start">
            <Button variant="destructive" className="flex-1 h-12 font-black uppercase italic tracking-widest rounded-xl" onClick={handleDispose}>Konfirmasi Disposal</Button>
            <Button variant="outline" className="flex-1 h-12 font-bold uppercase tracking-widest rounded-xl" onClick={() => setDisposeOpen(false)}>Batal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
