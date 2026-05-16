import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { FileDown, Printer, Search, ChevronLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table";
import { exportToExcel, exportToPDF } from "../../lib/export-utils";
import { useNavigate } from "react-router-dom";
import { reportsApi } from "../../lib/api-services";
import { toast } from "sonner";

export default function ARAging() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    reportsApi.getArAging(new Date().toISOString().split('T')[0])
    .then(setData)
    .catch(e => toast.error(e.message || "Gagal mengambil data Aging AR"))
    .finally(() => setLoading(false));
  }, []);

  const filteredData = data.filter(item => 
    item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.invNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportExcel = () => {
    exportToExcel(filteredData, "Aging_Piutang", "Aging AR");
  };

  const handleExportPDF = () => {
    const columns = ["No. Invoice", "Customer", "Tgl", "Jatuh Tempo", "Saldo", "Hari", "Kategori"];
    const body = filteredData.map(item => [
      item.invNumber,
      item.customer,
      item.date,
      item.dueDate,
      item.balance.toLocaleString(),
      item.daysOverdue,
      item.category
    ]);
    exportToPDF(columns, body, "Laporan Analisis Umur Piutang (Aging AR)", "Aging_AR");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/reports")}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
            </Button>
            <h1 className="text-xl font-bold tracking-tight">Umur Piutang (Aging AR)</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileDown className="w-4 h-4 mr-2" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Printer className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 border rounded shadow-sm">
        <div className="flex items-center bg-zinc-100 px-3 rounded-md mb-4 max-w-sm">
          <Search className="w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Cari customer atau no. inv..." 
            className="border-none bg-transparent focus-visible:ring-0 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead className="text-xs font-bold">No. Invoice</TableHead>
              <TableHead className="text-xs font-bold">Customer</TableHead>
              <TableHead className="text-xs font-bold">Tanggal</TableHead>
              <TableHead className="text-xs font-bold">Jatuh Tempo</TableHead>
              <TableHead className="text-xs font-bold text-right">Saldo Terutang</TableHead>
              <TableHead className="text-xs font-bold text-center">Hari Terlambat</TableHead>
              <TableHead className="text-xs font-bold">Kategori</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10">Memuat data...</TableCell></TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-zinc-500 italic">Tidak ada piutang jatuh tempo</TableCell></TableRow>
            ) : filteredData.map((item, idx) => (
              <TableRow key={idx} className="hover:bg-zinc-50">
                <TableCell className="text-xs font-medium text-blue-600">{item.invNumber}</TableCell>
                <TableCell className="text-xs">{item.customer}</TableCell>
                <TableCell className="text-xs">{item.date}</TableCell>
                <TableCell className="text-xs">{item.dueDate}</TableCell>
                <TableCell className="text-xs text-right font-semibold">Rp {item.balance.toLocaleString()}</TableCell>
                <TableCell className="text-xs text-center">{item.daysOverdue}</TableCell>
                <TableCell className="text-xs">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.category === 'Current' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.category}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
