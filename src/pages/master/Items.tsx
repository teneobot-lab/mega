import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Package } from "lucide-react";

type Item = {
  id: string;
  code: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  minStock: number;
  baseUom: { name: string, code: string };
};

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/master/items", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if(res.ok) setItems(data);
    } catch (e) {
      toast.error("Gagal mengambil data barang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic">Daftar Barang & Jasa</h1>
            <p className="text-xs text-zinc-500 font-medium">Data Master Produk, Jasa, dan Inventori</p>
        </div>
        <Button 
            onClick={() => navigate("/items/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-bold gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Tambah Barang
        </Button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12 text-zinc-500 uppercase font-black text-[10px] tracking-widest">
              <TableHead className="pl-6">Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead className="text-right">Harga Beli</TableHead>
              <TableHead className="text-right pr-6">Harga Jual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-20">
                     <div className="flex flex-col items-center gap-2 opacity-20">
                         <Package className="h-12 w-12" />
                         <p className="text-sm font-bold uppercase tracking-widest">Belum ada data Barang</p>
                     </div>
                 </TableCell>
               </TableRow>
            ) : (
              items.map((item) => (
                <TableRow 
                    key={item.id} 
                    className="group hover:bg-zinc-50 transition-colors h-14 cursor-pointer"
                    onClick={() => navigate(`/items/${item.id}`)}
                >
                  <TableCell className="font-bold text-[#1e3a5f] pl-6 group-hover:underline">{item.code}</TableCell>
                  <TableCell className="text-sm font-semibold text-zinc-700">{item.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-600 shadow-sm border border-zinc-200">
                      {item.baseUom?.code || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold text-zinc-500 tabular-nums italic">Rp {item.buyPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-black text-[#1e3a5f] pr-6 tabular-nums">Rp {item.sellPrice.toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
