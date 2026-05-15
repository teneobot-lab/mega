import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { FileDown, Printer, ChevronLeft, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useNavigate } from "react-router-dom";
import { exportToExcel, exportToPDF } from "../../lib/export-utils";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileDown, Printer, ChevronLeft, ArrowRightLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from "../../components/ui/table";
import { useNavigate } from "react-router-dom";
import { exportToPDF } from "../../lib/export-utils";

type CashFlowSection = {
    name: string;
    amount: number;
};
type CashFlowData = {
    operating: CashFlowSection[];
    investing: CashFlowSection[];
    financing: CashFlowSection[];
    netCashFlow: number;
};

export default function CashFlow() {
  const [data, setData] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/reports/cash-flow", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => {
        if(!res.ok) throw new Error("Gagal mengambil data");
        return res.json();
    })
    .then(setData)
    .catch(e => {
        toast.error("Gagal mengambil data Arus Kas");
        console.error(e);
    })
    .finally(() => setLoading(false));
  }, []);

  const handleExportPDF = () => {
    if(!data) return;
    const body: any[][] = [];
    data.operating.forEach(i => body.push([i.name, i.amount.toLocaleString()]));
    data.investing.forEach(i => body.push([i.name, i.amount.toLocaleString()]));
    data.financing.forEach(i => body.push([i.name, i.amount.toLocaleString()]));
    body.push(["Total Arus Kas Bersih", data.netCashFlow.toLocaleString()]);
    exportToPDF(["Deskripsi", "Jumlah"], body, "Laporan Arus Kas", "Cash_Flow");
  }

  const renderSection = (title: string, items: CashFlowSection[]) => (
      <div className="mb-6 border rounded shadow-sm bg-white overflow-hidden">
          <div className="bg-zinc-50 px-4 py-2 text-xs font-bold uppercase text-zinc-600 border-b">{title}</div>
          <Table>
            <TableBody>
                {items.map((item, i) => (
                    <TableRow key={i} className="h-8">
                        <TableCell className="text-xs">{item.name}</TableCell>
                        <TableCell className="text-right text-xs text-zinc-700">Rp {item.amount.toLocaleString()}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
          </Table>
      </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/reports")}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
            </Button>
            <h1 className="text-xl font-bold tracking-tight">Arus Kas (Cash Flow)</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileDown className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      {loading ? (
          <div className="text-center py-20 text-zinc-500">Memuat Laporan...</div>
      ) : !data ? (
          <div className="text-center py-20 text-red-500">Data gagal dimuat.</div>
      ) : (
        <div className="grid gap-6">
            {renderSection("Aktivitas Operasi", data.operating)}
            {renderSection("Aktivitas Investasi", data.investing)}
            {renderSection("Aktivitas Pendanaan", data.financing)}

            <div className="p-4 rounded border flex justify-between items-center bg-[#1e3a5f] text-white">
                <h4 className="font-bold text-sm">TOTAL ARUS KAS BERSIH</h4>
                <span className="text-xl font-black italic">Rp {data.netCashFlow.toLocaleString()}</span>
            </div>
        </div>
      )}
    </div>
  );
}
