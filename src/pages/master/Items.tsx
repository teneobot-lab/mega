import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Package } from "lucide-react";
import { masterApi } from "../../lib/api-services";
import { formatCurrency, cn } from "../../lib/utils";
import { TableSkeleton } from "../../components/ui/table-skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { ErrorMessage } from "../../components/ui/error-message";

type Item = {
  id: string;
  code: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  minStock: number;
  baseUom: { name: string, code: string } | null;
};

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await masterApi.getItems();
      setItems(resData);
    } catch (e: any) {
      setError(e.message || "Gagal mengambil data barang");
      toast.error(e.message || "Gagal mengambil data barang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black tracking-tighter text-[#1e3a5f] uppercase italic italic">Daftar Barang</h1>
            <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase italic opacity-70 leading-none">Kelola data master produk, jasa, dan inventori</p>
        </div>
        <Button 
            onClick={() => navigate("/master/items/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 px-8 h-12 rounded-full"
        >
          <Plus className="w-5 h-5" /> Tambah Barang
        </Button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden text-sm">
        {error ? (
          <ErrorMessage message={error} onRetry={fetchItems} className="py-20" />
        ) : loading ? (
          <div className="p-8">
            <TableSkeleton rowCount={8} columnCount={5} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Belum ada data barang"
            description="Tambah data produk, jasa, dan inventori Anda di sini."
            actionLabel="Tambah Barang"
            onAction={() => navigate("/master/items/new")}
            icon={<Package className="h-10 w-10 text-zinc-300" />}
            className="py-24"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow className="h-14 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic italic border-b border-zinc-100">
                  <TableHead className="pl-10 w-32">Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="w-24">Satuan</TableHead>
                  <TableHead className="text-right">Harga Beli</TableHead>
                  <TableHead className="text-right w-40 pr-10">Harga Jual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow 
                      key={item.id} 
                      className="h-20 group hover:bg-zinc-50 transition-all cursor-pointer border-b border-zinc-50 last:border-0"
                      onClick={() => navigate(`/master/items/${item.id}`)}
                  >
                    <TableCell className="pl-10">
                      <span className="font-black text-[#1e3a5f] uppercase tracking-tighter text-base group-hover:underline decoration-2 underline-offset-4">
                        {item.code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-black text-zinc-700 uppercase italic italic group-hover:text-[#1e3a5f] transition-colors text-sm">
                        {item.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-600 shadow-inner">
                        {item.baseUom?.code || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-zinc-500 italic tabular-nums text-sm">
                       {formatCurrency(item.buyPrice)}
                    </TableCell>
                    <TableCell className="text-right font-black text-[#1e3a5f] tabular-nums text-xl italic italic leading-none pr-10">
                        {formatCurrency(item.sellPrice)}
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
