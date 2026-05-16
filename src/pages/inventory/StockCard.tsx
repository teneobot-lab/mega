import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Search, ChevronLeft, ArrowUpRight, ArrowDownLeft, History } from "lucide-react";
import { Button } from "../../components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table";
import { useNavigate } from "react-router-dom";
import { exportToPDF } from "../../lib/export-utils";
import { inventoryApi, masterApi } from "../../lib/api-services";
import { toast } from "sonner";

export default function StockCard() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    masterApi.getItems()
    .then(data => {
        setItems(data);
        if(data.length > 0) setSelectedItemId(data[0].id);
    })
    .catch(err => toast.error("Gagal mengambil data barang"));
  }, []);

  const fetchStockCard = async (id: string) => {
    setLoading(true);
    try {
        const resData = await inventoryApi.getStockCard(id);
        setData(resData);
    } catch (e: any) {
        toast.error(e.message || "Gagal mengambil data kartu stok");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if(selectedItemId) {
        fetchStockCard(selectedItemId);
    }
  }, [selectedItemId]);

  const handleExportPDF = () => {
    const selectedItem = items.find(i => i.id === selectedItemId);
    const columns = ["Tanggal", "No. Trans", "Keterangan", "Masuk", "Keluar", "Saldo"];
    const body = data.map(d => [
        format(new Date(d.date), "dd/MM/yyyy"),
        d.transNumber,
        d.notes,
        d.qtyIn || 0,
        d.qtyOut || 0,
        d.balance
    ]);
    exportToPDF(columns, body, `Kartu Stok: ${selectedItem?.name} (${selectedItem?.code})`, "Stock_Card");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
            </Button>
            <h1 className="text-xl font-bold tracking-tight">Kartu Stok (Stock Card)</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={!selectedItemId}>
             Export PDF
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 border rounded shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
            <div className="w-full max-w-sm space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Pilih Barang</label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedItemId}
                    onChange={e => setSelectedItemId(e.target.value)}
                >
                    {items.map(i => <option key={i.id} value={i.id}>{i.code} - {i.name}</option>)}
                </select>
            </div>
            {/* Optional: Date Filter */}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead className="text-xs">Tanggal</TableHead>
              <TableHead className="text-xs">No. Transaksi</TableHead>
              <TableHead className="text-xs">Keterangan</TableHead>
              <TableHead className="text-xs text-right text-green-600">Masuk</TableHead>
              <TableHead className="text-xs text-right text-red-600">Keluar</TableHead>
              <TableHead className="text-xs text-right font-bold">Saldo Akhir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 italic text-zinc-400">Memuat data kartu stok...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-zinc-400">Tidak ada riwayat transaksi untuk barang ini</TableCell></TableRow>
            ) : data.map((d, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-xs">{format(new Date(d.date), "dd/MM/yyyy HH:mm")}</TableCell>
                <TableCell className="text-xs font-mono font-medium">{d.transNumber}</TableCell>
                <TableCell className="text-xs">{d.notes}</TableCell>
                <TableCell className="text-xs text-right text-green-600">
                    {d.qtyIn > 0 ? `+${d.qtyIn}` : '-'}
                </TableCell>
                <TableCell className="text-xs text-right text-red-600">
                    {d.qtyOut > 0 ? `-${d.qtyOut}` : '-'}
                </TableCell>
                <TableCell className="text-xs text-right font-bold">{d.balance}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
