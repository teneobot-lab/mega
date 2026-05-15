import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Plus, Replace, ClipboardCheck, Box } from "lucide-react";

export default function StockData() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // Mock fetch
      setData([{ warehouse: { name: 'Gudang Utama' }, item: { name: 'Item A', code: 'A01'}, qty: 10 }]);
    } catch (e) {
      toast.error("Gagal mengambil data stok");
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
        <h1 className="text-[12px] font-bold text-[var(--ac-primary-dark)] px-2">Data Persediaan Barang</h1>
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
        <table className="ac-table">
          <thead>
            <tr>
              <th className="w-[30px] text-center">NO</th>
              <th>Gudang</th>
              <th>Nama Barang</th>
              <th className="text-right">Qty Tersedia</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10">Loading...</td></tr>
            ) : data.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10">Data Kosong</td></tr>
            ) : (
              data.map((stock, i) => (
                <tr key={`${stock.warehouseId}-${stock.itemId}`}>
                  <td className="text-center">{i + 1}</td>
                  <td>{stock.warehouse?.name}</td>
                  <td>{stock.item?.name} ({stock.item?.code})</td>
                  <td className="text-right pr-2">{stock.qty}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
