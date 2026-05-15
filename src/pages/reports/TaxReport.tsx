import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { toast } from "sonner";
import { exportToExcel, exportToPDF } from "../../lib/export-utils";

type TaxData = {
  date: string;
  docNo: string;
  partner: string;
  dpp: number;
  tax: number;
};

export default function TaxReport() {
  const [data, setData] = useState<TaxData[]>([]);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("ppn-out");

  const fetchData = async () => {
    setLoading(true);
    try {
        const res = await fetch(`/api/reports/tax?type=${tab}&startDate=${startDate}&endDate=${endDate}`, {
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
        "No Faktur": r.docNo,
        "Customer/Supplier": r.partner,
        "DPP": r.dpp,
        "Pajak": r.tax
    })), `Tax_${tab}`, "Laporan Pajak");
  };

  const handleExportPDF = () => {
    exportToPDF(
      ["Tanggal", "No Faktur", "Customer/Supplier", "DPP", "Pajak"],
      data.map(r => [r.date, r.docNo, r.partner, r.dpp.toLocaleString(), r.tax.toLocaleString()]),
      "Laporan Pajak",
      `Tax_${tab}`
    );
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#1e3a5f] uppercase italic">Laporan Pajak</h1>
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

      <Tabs defaultValue="ppn-out" onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="ppn-out">PPN Keluaran</TabsTrigger>
          <TabsTrigger value="ppn-in">PPN Masukan</TabsTrigger>
          <TabsTrigger value="pph">PPh</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-10 text-[10px] uppercase font-black text-zinc-500">
               <TableHead>Tanggal</TableHead>
               <TableHead>No Faktur</TableHead>
               <TableHead>Customer/Supplier</TableHead>
               <TableHead className="text-right">DPP</TableHead>
               <TableHead className="text-right">Pajak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10">Data tidak tersedia</TableCell></TableRow>
            ) : (
                data.map((row, i) => (
                    <TableRow key={i}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.docNo}</TableCell>
                        <TableCell>{row.partner}</TableCell>
                        <TableCell className="text-right">{row.dpp.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{row.tax.toLocaleString()}</TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
