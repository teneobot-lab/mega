import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { exportToExcel, exportToPDF } from "../../lib/export-utils";

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

  const fetchData = async () => {
    if (!itemId) {
        toast.info("Pilih item terlebih dahulu");
        return;
    }
    setLoading(true);
    try {
        const res = await fetch(`/api/reports/stock-card?itemId=${itemId}&startDate=${startDate}&endDate=${endDate}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const resData = await res.json();
        if(res.ok) setData(resData);
        else toast.error("Gagal mengambil data");
    } catch(e) {
        toast.error("Gagal mengambil data");
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
          <Input placeholder="Pilih Item (Wajib)" className="max-w-[300px]" value={itemId} onChange={e => setItemId(e.target.value)} />
          <Input type="date" className="max-w-[200px]" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input type="date" className="max-w-[200px]" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <Button className="bg-[#1e3a5f]" onClick={fetchData} disabled={loading}>Filter</Button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-10 text-[10px] uppercase font-black text-zinc-500">
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
                <TableRow><TableCell colSpan={6} className="text-center py-10">Pilih item untuk melihat kartu stok</TableCell></TableRow>
            ) : (
                data.map((row, i) => (
                    <TableRow key={i}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.docNo}</TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell className="text-right">{row.in.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{row.out.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{row.balance.toLocaleString()}</TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
