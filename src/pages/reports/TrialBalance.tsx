import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { exportToExcel, exportToPDF } from "../../lib/export-utils";
import { reportsApi } from "../../lib/api-services";

type TrialBalanceData = {
  accountCode: string;
  accountName: string;
  beginningBalance: number;
  debit: number;
  credit: number;
  endingBalance: number;
};

export default function TrialBalance() {
  const [data, setData] = useState<TrialBalanceData[]>([]);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    try {
        const resData = await reportsApi.getTrialBalance(startDate, endDate);
        setData(resData);
    } catch(e: any) {
        toast.error(e.message || "Gagal mengambil data Neraca Saldo");
    } finally {
        setLoading(false);
    }
  };

  const handleExportExcel = () => {
    exportToExcel(data.map(r => ({
        "Kode Akun": r.accountCode,
        "Nama Akun": r.accountName,
        "Saldo Awal": r.beginningBalance,
        "Debit": r.debit,
        "Kredit": r.credit,
        "Saldo Akhir": r.endingBalance
    })), "Trial_Balance", "Trial Balance");
  };

  const handleExportPDF = () => {
    exportToPDF(
      ["Kode", "Nama", "Saldo Awal", "Debit", "Kredit", "Saldo Akhir"],
      data.map(r => [r.accountCode, r.accountName, ...[r.beginningBalance, r.debit, r.credit, r.endingBalance].map(n => n.toLocaleString())]),
      "Trial Balance",
      "Trial_Balance"
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#1e3a5f] uppercase italic">Trial Balance</h1>
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
              <TableHead>Kode Akun</TableHead>
              <TableHead>Nama Akun</TableHead>
              <TableHead className="text-right">Saldo Awal</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Kredit</TableHead>
              <TableHead className="text-right">Saldo Akhir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">Data tidak tersedia</TableCell></TableRow>
            ) : (
                data.map((row, i) => (
                    <TableRow key={i}>
                        <TableCell>{row.accountCode}</TableCell>
                        <TableCell>{row.accountName}</TableCell>
                        <TableCell className="text-right">{row.beginningBalance.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{row.debit.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{row.credit.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{row.endingBalance.toLocaleString()}</TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
