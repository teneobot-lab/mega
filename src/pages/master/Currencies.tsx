import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Landmark } from "lucide-react";
import { masterApi } from "../../lib/api-services";

type Currency = {
  id: string;
  code: string;
  name: string;
  rate: number;
  isBase: boolean;
};

export default function Currencies() {
  const [data, setData] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const resData = await masterApi.getCurrencies();
      setData(resData);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengambil data mata uang");
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
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic">Daftar Mata Uang</h1>
            <p className="text-xs text-zinc-500 font-medium">Data Master Mata Uang</p>
        </div>
        <Button 
            onClick={() => navigate("/master/currencies/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-bold gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Tambah Mata Uang
        </Button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12 text-zinc-500 uppercase font-black text-[10px] tracking-widest">
              <TableHead className="pl-6">Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="text-center">Kurs ke IDR</TableHead>
              <TableHead className="text-center">Base</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={4} className="text-center py-20">
                     <div className="flex flex-col items-center gap-2 opacity-20">
                         <Landmark className="h-12 w-12" />
                         <p className="text-sm font-bold uppercase tracking-widest">Belum ada data Mata Uang</p>
                     </div>
                 </TableCell>
               </TableRow>
            ) : (
              data.map((c) => (
                <TableRow 
                    key={c.id} 
                    className="group hover:bg-zinc-50 transition-colors h-14 cursor-pointer"
                    onClick={() => navigate(`/master/currencies/${c.id}`)}
                >
                  <TableCell className="font-bold text-[#1e3a5f] pl-6 group-hover:underline">{c.code}</TableCell>
                  <TableCell className="text-sm font-semibold text-zinc-700">{c.name}</TableCell>
                  <TableCell className="text-center tabular-nums">{c.rate.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{c.isBase ? '✅' : '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
