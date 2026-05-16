import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Replace, ClipboardCheck, Box, Search, Package2, Warehouse } from "lucide-react";
import { inventoryApi } from "../../lib/api-services";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { TableSkeleton } from "../../components/ui/table-skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { ErrorMessage } from "../../components/ui/error-message";
import { cn } from "../../lib/utils";

export default function StockData() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await inventoryApi.getStocks();
      setData(resData);
    } catch (e: any) {
      setError(e.message || "Gagal mengambil data stok");
      toast.error(e.message || "Gagal mengambil data stok");
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(stock => 
    stock.item?.name?.toLowerCase().includes(search.toLowerCase()) ||
    stock.item?.code?.toLowerCase().includes(search.toLowerCase()) ||
    stock.warehouse?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tighter text-[#1e3a5f] uppercase italic italic">
            Data Persediaan
          </h1>
          <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase italic opacity-70 leading-none">
            Monitoring stok barang di seluruh gudang
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/inventory/adjustment/new")}
            className="border-zinc-200 hover:bg-zinc-50 text-[#1e3a5f] font-black uppercase italic tracking-widest gap-2 shadow-sm rounded-full px-6 h-12"
          >
            <ClipboardCheck className="w-5 h-5" /> Adjusment
          </Button>
          <Button
            onClick={() => navigate("/inventory/transfer/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 px-8 h-12 rounded-full"
          >
            <Replace className="w-5 h-5" /> Transfer
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden text-sm">
        <div className="p-8 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-50/30">
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-zinc-200 shadow-inner flex-1 max-w-md group focus-within:ring-2 focus-within:ring-[#1e3a5f]/10 transition-all">
            <Search className="w-4 h-4 text-zinc-400 font-bold group-focus-within:text-[#1e3a5f]" />
            <input
              type="text"
              placeholder="Cari item atau gudang..."
              className="bg-transparent border-none focus:ring-0 text-xs font-bold text-zinc-600 w-full placeholder:text-zinc-300 placeholder:italic placeholder:font-medium uppercase tracking-widest leading-none outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic font-medium">
            <span>Total Records: {filteredData.length}</span>
          </div>
        </div>

        {error ? (
          <ErrorMessage message={error} onRetry={fetchData} className="py-20" />
        ) : loading ? (
          <div className="p-8">
            <TableSkeleton rowCount={10} columnCount={4} />
          </div>
        ) : filteredData.length === 0 ? (
          <EmptyState
            title={search ? "Data tidak ditemukan" : "Persediaan Kosong"}
            description={
              search
                ? `Tidak ada hasil untuk "${search}". Coba kata kunci lain.`
                : "Belum mendata stok barang. Tambahkan pembelian atau saldo awal."
            }
            actionLabel={search ? "Clear Search" : undefined}
            onAction={search ? () => setSearch("") : undefined}
            icon={<Package2 className="w-12 h-12 text-zinc-200" />}
            className="py-24"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow className="h-14 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic border-b border-zinc-100">
                  <TableHead className="pl-10 w-24">No</TableHead>
                  <TableHead>Gudang</TableHead>
                  <TableHead>Informasi Barang</TableHead>
                  <TableHead className="text-right pr-10">Qty Tersedia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((stock, i) => (
                  <TableRow
                    key={`${stock.warehouseId}-${stock.itemId}`}
                    className="h-16 group hover:bg-zinc-50 transition-all border-b border-zinc-50 last:border-0"
                  >
                    <TableCell className="pl-10 font-mono text-xs text-zinc-300 group-hover:text-zinc-500 transition-colors">
                      {(i + 1).toString().padStart(2, '0')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Warehouse className="w-4 h-4 text-zinc-300 group-hover:text-amber-500 transition-colors" />
                        <span className="font-black text-[#1e3a5f] uppercase italic text-sm">
                          {stock.warehouse?.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-[#1e3a5f] uppercase tracking-tight text-sm">
                          {stock.item?.name}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                          Code: {stock.item?.code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <span className="inline-flex items-center justify-center min-w-[3rem] h-8 px-3 rounded-xl bg-zinc-100 font-black text-[#1e3a5f] tabular-nums text-base shadow-inner group-hover:bg-[#1e3a5f] group-hover:text-white transition-all duration-300">
                        {stock.qty.toLocaleString()}
                      </span>
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
