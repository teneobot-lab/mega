import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { RotateCcw, Plus, Calendar, Box, Warehouse, ArrowRightSquare } from "lucide-react";

export default function PurchaseReturn() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await fetch("/api/purchasing/returns", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data retur pembelian");
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
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic uppercase italic">Retur Pembelian</h1>
            <p className="text-xs text-zinc-500 font-medium tracking-tight uppercase italic opacity-70 tracking-widest leading-none">Pengembalian barang dan pemotongan kewajiban vendor</p>
        </div>
        <Button 
            onClick={() => navigate("/purchasing/return/new")}
            className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
            <RotateCcw className="w-4 h-4" /> Buat Retur
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic tracking-widest italic">
              <TableHead className="pl-6">Status</TableHead>
              <TableHead>Nomor Retur</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nama Supplier</TableHead>
              <TableHead className="text-right">Total Nilai Retur</TableHead>
              <TableHead className="text-center w-24 pr-6">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-20 text-zinc-400 font-bold uppercase tracking-widest italic">Memuat data retur...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-24 text-zinc-300 font-black uppercase tracking-[0.2em] italic opacity-40">Belum ada retur terdata</TableCell></TableRow>
            ) : (
              data.map((d) => (
                <TableRow 
                    key={d.id} 
                    className="h-16 group hover:bg-red-50/30 transition-all active:bg-red-50 cursor-pointer"
                    onClick={() => navigate(`/purchasing/return/${d.id}`)}
                >
                  <TableCell className="pl-6">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                      RETURNED
                    </span>
                  </TableCell>
                  <TableCell className="font-black text-[#1e3a5f]">
                    <div className="flex flex-col">
                        <span>{d.invNumber}</span>
                        <span className="text-[9px] font-bold text-zinc-400 tracking-widest">#{d.id.slice(-6)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-zinc-500 italic">
                      <div className="flex items-center gap-1.5 uppercase">
                        <Calendar className="w-3 h-3 text-zinc-300" />
                        {new Date(d.date).toLocaleDateString()}
                      </div>
                  </TableCell>
                  <TableCell className="font-bold text-zinc-700 uppercase italic">{d.contact?.name}</TableCell>
                  <TableCell className="text-right font-black text-red-600 tabular-nums text-lg italic">
                    Rp {d.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center pr-6">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-zinc-300 group-hover:text-red-500 rounded-full"
                    >
                        <ArrowRightSquare className="h-5 w-5" />
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
