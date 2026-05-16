import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { exportToExcel, exportToPDF } from "../../lib/export-utils";
import { reportsApi, masterApi } from "../../lib/api-services";

type StockCardData = {
  date: string;
  docNo: string;
  description: string;
  in: number;
  out: number;
  balance: number;
};

export default function StockCardReport() {
  const [data, setData] = useState<StockCardData[]>([]);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [itemId, setItemId] = useState("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    masterApi.getItems().then(setItems).catch(console.error);
  }, []);

  const fetchData = async () => {
    if (!itemId) {
        toast.info("Pilih item terlebih dahulu");
        return;
    }
    setLoading(true);
    try {
        const resData = await reportsApi.getStockCard(itemId, startDate, endDate);
        setData(resData);
    } catch(e: any) {
        toast.error(e.message || "Gagal mengambil data kartu stok");
    } finally {
        setLoading(false);
    }
  };
  
  const handleExportExcel = () => {
    exportToExcel(data.map(r => ({
        "Tanggal": r.date,
        "No Dokumen": r.docNo,
        "Keterangan": r.description,
        "Masuk": r.in,
        "Keluar": r.out,
        "Saldo": r.balance
    })), "Stock_Card", "Kartu Stok");
  };

  const handleExportPDF = () => {
    exportToPDF(
      ["Tanggal", "No Dokumen", "Keterangan", "Masuk", "Keluar", "Saldo"],
      data.map(r => [r.date, r.docNo, r.description, r.in.toLocaleString(), r.out.toLocaleString(), r.balance.toLocaleString()]),
      "Kartu Stok",
      "Stock_Card"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#1e3a5f] uppercase italic">Kartu Stok</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}><Download className="mr-2 h-4 w-4" /> Excel</Button>
          <Button variant="outline" onClick={handleExportPDF}><Download className="mr-2 h-4 w-4" /> PDF</Button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl border flex gap-4">
          <select 
            className="flex h-10 w-full max-w-[300px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={itemId} 
            onChange={e => setItemId(e.target.value)}
          >
            <option value="">-- Pilih Item (Wajib) --</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>{item.code} - {item.name}</option>
            ))}
          </select>
          <Input type="date" className="max-w-[200px]" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input type="date" className="max-w-[200px]" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <Button className="bg-[#1e3a5f]" onClick={fetchData} disabled={loading}>Filter</Button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow>
               <TableHead>Tanggal</TableHead>
               <TableHead>No Dokumen</TableHead>
               <TableHead>Keterangan</TableHead>
               <TableHead className="text-right">Masuk</TableHead>
               <TableHead className="text-right">Keluar</TableHead>
               <TableHead className="text-right">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 font-bold text-zinc-400 italic">PILIH ITEM UNTUK MELIHAT KARTU STOK</TableCell></TableRow>
            ) : (
                data.map((row, i) => (
                    <TableRow key={i}>
                        <TableCell className="text-xs font-medium">{new Date(row.date).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell className="font-bold text-[#1e3a5f]">{row.docNo}</TableCell>
                        <TableCell className="text-zinc-500 italic text-xs">{row.description}</TableCell>
                        <TableCell className="text-right text-emerald-600 font-bold">{row.in > 0 ? row.in.toLocaleString() : "-"}</TableCell>
                        <TableCell className="text-right text-red-600 font-bold">{row.out > 0 ? row.out.toLocaleString() : "-"}</TableCell>
                        <TableCell className="text-right font-black text-[#1e3a5f]">{row.balance.toLocaleString()}</TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
