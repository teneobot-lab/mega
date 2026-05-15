import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { exportToExcel, exportToPDF } from "../../lib/export-utils";

type PurchaseData = {
  code: string;
  name: string;
  qty: number;
  total: number;
};

export default function PurchaseReport() {
  const [data, setData] = useState<PurchaseData[]>([]);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
        const res = await fetch(`/api/reports/purchase?startDate=${startDate}&endDate=${endDate}`, {
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
        "Kode": r.code,
        "Nama": r.name,
        "Qty": r.qty,
        "Total": r.total
    })), "Purchase_Report", "Purchase Report");
  };

  const handleExportPDF = () => {
    exportToPDF(
      ["Kode", "Nama", "Qty", "Total"],
      data.map(r => [r.code, r.name, r.qty.toLocaleString(), r.total.toLocaleString()]),
      "Laporan Pembelian",
      "Purchase_Report"
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#1e3a5f] uppercase italic">Laporan Pembelian</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}><Download className="mr-2 h-4 w-4" /> Excel</Button>
          <Button variant="outline" onClick={handleExportPDF}><Download className="mr-2 h-4 w-4" /> PDF</Button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl border flex gap-4">
          <Input type="date" className="max-w-[200px]" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input type="date" className="max-w-[200px]" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <Button className="bg-[#1e3a5f]" onClick={fetchData} disabled={loading}>Filter</Button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-10 text-[10px] uppercase font-black text-zinc-500">
               <TableHead>Kode</TableHead>
               <TableHead>Nama</TableHead>
               <TableHead className="text-right">Qty</TableHead>
               <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10">Data tidak tersedia</TableCell></TableRow>
            ) : (
                data.map((row, i) => (
                    <TableRow key={i}>
                        <TableCell>{row.code}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="text-right">{row.qty.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{row.total.toLocaleString()}</TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
