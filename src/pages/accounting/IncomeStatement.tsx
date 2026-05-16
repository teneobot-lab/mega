import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Printer, FileDown, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { exportToPDF } from "../../lib/export-utils";
import { accountingApi } from "../../lib/api-services";

type Account = { id: string, code: string, name: string, balance: number };
type IncomeData = {
  revenues: Account[],
  totalRevenues: number,
  expenses: Account[],
  totalExpenses: number,
  netIncome: number
};

export default function IncomeStatement() {
  const [data, setData] = useState<IncomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resData = await accountingApi.getIncomeStatement(startDate, endDate);
      setData(resData);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengambil data Laba Rugi");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = () => {
     if(!data) return;
     const body = [
         ["Total Pendapatan", data.totalRevenues.toLocaleString()],
         ["Total Beban", data.totalExpenses.toLocaleString()],
         ["Laba Bersih", data.netIncome.toLocaleString()]
     ];
     exportToPDF(["Keterangan", "Jumlah"], body, `Laba Rugi ${startDate} s/d ${endDate}`, "Income_Statement");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f4f6]">
      {/* HEADER SECTION */}
      <div className="bg-[#1e3a5f] text-white px-4 py-2 flex items-center justify-between shadow-md">
        <div className="flex flex-col">
            <div className="flex items-center text-[10px] opacity-70">
              <span>Laporan</span>
              <ChevronRight className="w-3 h-3 mx-1" />
              <span className="font-semibold text-white">Laba / Rugi</span>
            </div>
            <h1 className="text-sm font-bold uppercase tracking-wider">Laba / Rugi (Income Statement)</h1>
        </div>
        <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 h-8 text-xs" onClick={() => window.print()}>
               <Printer className="w-3.5 h-3.5 mr-1.5" /> PRINT
            </Button>
            <Button size="sm" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 h-8 text-xs" onClick={handleExport}>
               <FileDown className="w-3.5 h-3.5 mr-1.5" /> EXPORT
            </Button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto w-full">
         {/* FILTERS */}
         <div className="bg-white p-3 border rounded shadow-sm flex items-end space-x-4">
            <div className="space-y-1">
               <Label className="text-[10px] font-bold uppercase text-zinc-500">Dari</Label>
               <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-8 text-xs border-zinc-300 w-40" />
            </div>
            <div className="space-y-1">
               <Label className="text-[10px] font-bold uppercase text-zinc-500">Sampai</Label>
               <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-8 text-xs border-zinc-300 w-40" />
            </div>
            <Button onClick={fetchData} className="bg-[#1e3a5f] h-8 text-xs uppercase font-bold">Tampilkan</Button>
         </div>

         {loading || !data ? (
            <div className="bg-white p-20 border rounded text-center text-zinc-400">Loading Report...</div>
         ) : (
            <div className="bg-white border shadow-sm rounded overflow-hidden">
               <div className="p-8 text-center border-b space-y-1">
                  <h2 className="text-xl font-bold text-[#1e3a5f]">PT ACCURATE LOCAL REPLICA</h2>
                  <h3 className="text-lg font-bold uppercase">Laba / Rugi (Standard)</h3>
                  <p className="text-sm text-zinc-500 italic">Periode: {formatDate(startDate)} s.d {formatDate(endDate)}</p>
               </div>

               <div className="p-4">
                  {/* Pendapatan */}
                  <div className="border border-zinc-200 rounded mb-6">
                    <div className="bg-zinc-50 px-4 py-1 border-b text-[11px] font-bold uppercase tracking-tighter text-[#1e3a5f]">PENDAPATAN</div>
                    <Table className="text-xs">
                       <TableBody>
                          {(data?.revenues || []).map((a: any) => (
                             <TableRow key={a.id} className="h-7 border-0">
                                <TableCell className="py-1 font-mono text-[11px] text-zinc-600 w-24 pl-4">{a.code}</TableCell>
                                <TableCell className="py-1">{a.name}</TableCell>
                                <TableCell className="py-1 text-right font-medium pr-4">Rp {(a.balance || 0).toLocaleString()}</TableCell>
                             </TableRow>
                          ))}
                          <TableRow className="h-9 font-bold bg-blue-50/30 border-t">
                             <TableCell colSpan={2} className="py-1 pl-4 uppercase">TOTAL PENDAPATAN</TableCell>
                             <TableCell className="py-1 text-right pr-4 text-blue-700">Rp {data.totalRevenues.toLocaleString()}</TableCell>
                          </TableRow>
                       </TableBody>
                    </Table>
                  </div>

                  {/* Beban */}
                  <div className="border border-zinc-200 rounded mb-6">
                    <div className="bg-zinc-50 px-4 py-1 border-b text-[11px] font-bold uppercase tracking-tighter text-red-700">BEBAN / BIAYA</div>
                    <Table className="text-xs">
                       <TableBody>
                          {(data?.expenses || []).map((a: any) => (
                             <TableRow key={a.id} className="h-7 border-0">
                                <TableCell className="py-1 font-mono text-[11px] text-zinc-600 w-24 pl-4">{a.code}</TableCell>
                                <TableCell className="py-1">{a.name}</TableCell>
                                <TableCell className="py-1 text-right font-medium pr-4">Rp {(a.balance || 0).toLocaleString()}</TableCell>
                             </TableRow>
                          ))}
                          <TableRow className="h-9 font-bold bg-red-50/30 border-t">
                             <TableCell colSpan={2} className="py-1 pl-4 uppercase">TOTAL BEBAN</TableCell>
                             <TableCell className="py-1 text-right pr-4 text-red-700">Rp {data.totalExpenses.toLocaleString()}</TableCell>
                          </TableRow>
                       </TableBody>
                    </Table>
                  </div>

                  {/* Kesimpulan */}
                  <div className={cn(
                    "p-4 rounded border-2 flex justify-between items-center",
                    data.netIncome >= 0 ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"
                  )}>
                     <div>
                        <h4 className="text-[10px] font-bold uppercase opacity-60">Laba / Rugi Bersih</h4>
                        <p className="text-sm font-semibold">{data.netIncome >= 0 ? "Laba Bersih" : "Rugi Bersih"}</p>
                     </div>
                     <span className="text-2xl font-black italic">Rp {data.netIncome.toLocaleString()}</span>
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch(e) {
        return dateStr;
    }
}

