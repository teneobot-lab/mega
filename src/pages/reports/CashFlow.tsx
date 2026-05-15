import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { FileDown, Printer, ChevronLeft, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useNavigate } from "react-router-dom";
import { exportToExcel, exportToPDF } from "../../lib/export-utils";

export default function CashFlow() {
  const [data, setData] = useState<{inflow: number, outflow: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/reports/cash-flow", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => res.json())
    .then(setData)
    .finally(() => setLoading(false));
  }, []);

  const handleExportPDF = () => {
    if(!data) return;
    const body = [
        ["Total Arus Kas Masuk (Inflow)", `Rp ${data.inflow.toLocaleString()}`],
        ["Total Arus Kas Keluar (Outflow)", `Rp ${data.outflow.toLocaleString()}`],
        ["Arus Kas Bersih (Net)", `Rp ${(data.inflow - data.outflow).toLocaleString()}`]
    ];
    exportToPDF(["Deskripsi", "Jumlah"], body, "Laporan Arus Kas (Sederhana)", "Arus_Kas");
  }

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
            <Printer className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>
      </div>

      {loading ? (
          <div className="text-center py-20">Memuat Laporan...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-green-200 bg-green-50/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cash Inflow</CardTitle>
                    <TrendingUp className="h-4 h-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-700">Rp {data?.inflow.toLocaleString()}</div>
                    <p className="text-xs text-zinc-500 mt-1">Total penerimaan periode ini</p>
                </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cash Outflow</CardTitle>
                    <TrendingDown className="h-4 h-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-700">Rp {data?.outflow.toLocaleString()}</div>
                    <p className="text-xs text-zinc-500 mt-1">Total pengeluaran periode ini</p>
                </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
                    <Wallet className="h-4 h-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-700">Rp {(data ? data.inflow - data.outflow : 0).toLocaleString()}</div>
                    <p className="text-xs text-zinc-500 mt-1">Arus kas bersih</p>
                </CardContent>
            </Card>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-bold uppercase mb-4 text-zinc-500">Analisis Arus Kas</h3>
          <p className="text-sm text-zinc-600 italic">
              Laporan ini menunjukkan ringkasan dana yang masuk dan keluar dari operasional perusahaan. 
              Gunakan laporan ini untuk merencanakan likuiditas jangka pendek.
          </p>
      </div>
    </div>
  );
}
