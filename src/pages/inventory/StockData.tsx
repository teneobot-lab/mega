import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Replace, ClipboardCheck, Box } from "lucide-react";
import { inventoryApi } from "../../lib/api-services";

export default function StockData() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const resData = await inventoryApi.getStocks();
      setData(resData);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengambil data stok");
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-2 space-y-2">
      <div className="flex justify-between items-center bg-[var(--ac-toolbar-bg)] p-1 border border-[var(--ac-border-default)]">
        <h1 className="text-[12px] font-bold text-[var(--ac-primary-dark)] px-2 uppercase tracking-tight flex items-center gap-2">
            <Box className="w-3.5 h-3.5" /> Data Persediaan Barang
        </h1>
        <div className="flex gap-1">
            <button 
                onClick={() => navigate("/inventory/adjustment/new")}
                className="ac-toolbar-btn ac-btn-cancel !border-[var(--ac-border-default)] !text-[var(--ac-text-primary)]"
            >
                <ClipboardCheck className="h-3 w-3" /> Penyesuaian
            </button>
            <button 
                onClick={() => navigate("/inventory/transfer/new")}
                className="ac-toolbar-btn ac-btn-save-new"
            >
                <Replace className="h-3 w-3" /> Pindah Barang
            </button>
        </div>
      </div>

      <div className="ac-table-container">
        <table className="ac-table text-[11px]">
          <thead>
            <tr>
              <th className="w-[40px] text-center uppercase tracking-widest text-[9px] font-black">NO</th>
              <th className="uppercase tracking-widest text-[9px] font-black">Gudang</th>
              <th className="uppercase tracking-widest text-[9px] font-black">Nama Barang</th>
              <th className="text-right uppercase tracking-widest text-[9px] font-black">Qty Tersedia</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-20 text-zinc-400 font-medium uppercase tracking-[0.2em] italic">Memproses data persediaan...</td></tr>
            ) : data.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-32 text-zinc-300 font-black uppercase tracking-[0.3em] italic">Data persediaan tidak ditemukan</td></tr>
            ) : (
              data.map((stock, i) => (
                <tr key={`${stock.warehouseId}-${stock.itemId}`} className="h-10 hover:bg-zinc-50 transition-colors">
                  <td className="text-center font-mono opacity-40">{i + 1}</td>
                  <td className="font-bold text-[#1e3a5f] uppercase italic">{stock.warehouse?.name}</td>
                  <td className="font-medium text-zinc-600">
                    <span className="font-black text-[#1e3a5f]">{stock.item?.code}</span> - {stock.item?.name}
                  </td>
                  <td className="text-right pr-4 font-black text-[#1e3a5f] bg-zinc-50 tabular-nums">
                    {stock.qty.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
