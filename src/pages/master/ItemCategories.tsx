import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Tag } from "lucide-react";
import { masterApi } from "../../lib/api-services";

type ItemCategory = {
  id: string;
  code: string;
  name: string;
  description: string;
};

export default function ItemCategories() {
  const [data, setData] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const resData = await masterApi.getCategories();
      setData(resData);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengambil data kategori item");
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
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic">Daftar Kategori</h1>
            <p className="text-xs text-zinc-500 font-medium">Data Master Kategori Item</p>
        </div>
        <Button 
            onClick={() => navigate("/master/item-categories/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-bold gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12 text-zinc-500 uppercase font-black text-[10px] tracking-widest">
              <TableHead className="pl-6">Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Deskripsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={3} className="text-center py-20">
                     <div className="flex flex-col items-center gap-2 opacity-20">
                         <Tag className="h-12 w-12" />
                         <p className="text-sm font-bold uppercase tracking-widest">Belum ada data Kategori</p>
                     </div>
                 </TableCell>
               </TableRow>
            ) : (
              data.map((ic) => (
                <TableRow 
                    key={ic.id} 
                    className="group hover:bg-zinc-50 transition-colors h-14 cursor-pointer"
                    onClick={() => navigate(`/master/item-categories/${ic.id}`)}
                >
                  <TableCell className="font-bold text-[#1e3a5f] pl-6 group-hover:underline">{ic.code}</TableCell>
                  <TableCell className="text-sm font-semibold text-zinc-700">{ic.name}</TableCell>
                  <TableCell className="text-xs text-zinc-500">{ic.description}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
