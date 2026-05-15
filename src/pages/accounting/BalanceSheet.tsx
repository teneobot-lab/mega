import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Printer, FileDown, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { exportToPDF } from "../../lib/export-utils";

type Account = { id: string, code: string, name: string, balance: number };
type BalanceData = {
  assets: Account[],
  totalAssets: number,
  liabilities: Account[],
  totalLiabilities: number,
  equity: Account[],
  totalEquity: number,
  currentEarnings: number
};

export default function BalanceSheet() {
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/accounting/balance-sheet?date=${date}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(!res.ok) throw new Error("Gagal mengambil data");
      setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data Neraca");
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
         ["Total Aset", data.totalAssets.toLocaleString()],
         ["Total Kewajiban", data.totalLiabilities.toLocaleString()],
         ["Total Ekuitas", data.totalEquity.toLocaleString()]
     ];
     exportToPDF(["Keterangan", "Jumlah"], body, `Neraca Per ${date}`, "Balance_Sheet");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f4f6]">
      {/* HEADER SECTION */}
      <div className="bg-[#1e3a5f] text-white px-4 py-2 flex items-center justify-between shadow-md">
        <div className="flex flex-col">
            <div className="flex items-center text-[10px] opacity-70">
              <span>Laporan</span>
              <ChevronRight className="w-3 h-3 mx-1" />
              <span className="font-semibold text-white">Neraca</span>
            </div>
            <h1 className="text-sm font-bold uppercase tracking-wider">Neraca (Standard)</h1>
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

      <div className="p-4 space-y-4 max-w-6xl mx-auto w-full">
         {/* FILTERS */}
         <div className="bg-white p-3 border rounded shadow-sm flex items-end space-x-4">
            <div className="space-y-1">
               <Label className="text-[10px] font-bold uppercase text-zinc-500">Per Tanggal</Label>
               <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-8 text-xs border-zinc-300 w-40" />
            </div>
            <Button onClick={fetchData} className="bg-[#1e3a5f] h-8 text-xs uppercase font-bold">Tampilkan</Button>
         </div>

         {loading || !data ? (
            <div className="bg-white p-20 border rounded text-center text-zinc-400">Loading Report...</div>
         ) : (
            <div className="bg-white border shadow-sm rounded overflow-hidden">
               {/* REPORT HEADER PRINT */}
               <div className="p-8 text-center border-b space-y-1">
                  <h2 className="text-xl font-bold text-[#1e3a5f]">PT ACCURATE LOCAL REPLICA</h2>
                  <h3 className="text-lg font-bold">NERACA (STANDAR)</h3>
                  <p className="text-sm text-zinc-500 italic">Per Tanggal: {formatDate(date)}</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* AKTIVA (ASET) */}
                  <div className="border-r border-zinc-200">
                     <div className="bg-zinc-50 px-4 py-1 border-b text-[11px] font-bold uppercase tracking-tighter text-zinc-600">AKTIVA</div>
                     <Table className="text-xs">
                        <TableBody>
                           {data.assets.map((a: any) => (
                              <TableRow key={a.id} className="h-7 hover:bg-zinc-50 border-0">
                                 <TableCell className="py-1 font-mono text-[11px] text-blue-700 w-24">{a.code}</TableCell>
                                 <TableCell className="py-1">{a.name}</TableCell>
                                 <TableCell className="py-1 text-right font-medium">Rp {a.balance.toLocaleString()}</TableCell>
                              </TableRow>
                           ))}
                           <TableRow className="h-10 bg-[#1e3a5f]/5 border-t-2 border-[#1e3a5f]">
                              <TableCell colSpan={2} className="py-1 font-bold text-[#1e3a5f] uppercase pl-4">TOTAL AKTIVA (ASET)</TableCell>
                              <TableCell className="py-1 text-right font-black text-sm text-[#1e3a5f]">Rp {data.totalAssets.toLocaleString()}</TableCell>
                           </TableRow>
                        </TableBody>
                     </Table>
                  </div>

                  {/* PASIVA (KEWAJIBAN & EKUITAS) */}
                  <div className="flex flex-col">
                     <div className="bg-zinc-50 px-4 py-1 border-b text-[11px] font-bold uppercase tracking-tighter text-zinc-600">KEWAJIBAN & EKUITAS</div>
                     
                     {/* Kewajiban */}
                     <Table className="text-xs border-b">
                        <TableBody>
                           <TableRow className="h-7 bg-zinc-50/50"><TableCell colSpan={3} className="py-1 italic font-bold">KEWAJIBAN</TableCell></TableRow>
                           {data.liabilities.map((a: any) => (
                              <TableRow key={a.id} className="h-7 hover:bg-zinc-50 border-0">
                                 <TableCell className="py-1 font-mono text-[11px] text-red-700 w-24">{a.code}</TableCell>
                                 <TableCell className="py-1">{a.name}</TableCell>
                                 <TableCell className="py-1 text-right font-medium">Rp {a.balance.toLocaleString()}</TableCell>
                              </TableRow>
                           ))}
                           <TableRow className="h-8 font-bold border-t"><TableCell colSpan={2} className="py-1 pl-4">Total Kewajiban</TableCell><TableCell className="py-1 text-right">Rp {data.totalLiabilities.toLocaleString()}</TableCell></TableRow>
                        </TableBody>
                     </Table>

                     {/* Ekuitas */}
                     <Table className="text-xs border-b">
                        <TableBody>
                           <TableRow className="h-7 bg-zinc-50/50"><TableCell colSpan={3} className="py-1 italic font-bold">EKUITAS (MODAL)</TableCell></TableRow>
                           {data.equity.map((a: any) => (
                              <TableRow key={a.id} className="h-7 hover:bg-zinc-50 border-0">
                                 <TableCell className="py-1 font-mono text-[11px] text-green-700 w-24">{a.code}</TableCell>
                                 <TableCell className="py-1">{a.name}</TableCell>
                                 <TableCell className="py-1 text-right font-medium">Rp {a.balance.toLocaleString()}</TableCell>
                              </TableRow>
                           ))}
                           <TableRow className="h-7">
                                 <TableCell className="py-1 font-mono text-[11px] text-green-700 w-24">-</TableCell>
                                 <TableCell className="py-1 italic text-blue-600">Laba Berjalan Berjalan</TableCell>
                                 <TableCell className="py-1 text-right italic font-semibold text-blue-600">Rp {data.currentEarnings.toLocaleString()}</TableCell>
                           </TableRow>
                           <TableRow className="h-8 font-bold border-t"><TableCell colSpan={2} className="py-1 pl-4">Total Ekuitas</TableCell><TableCell className="py-1 text-right">Rp {data.totalEquity.toLocaleString()}</TableCell></TableRow>
                        </TableBody>
                     </Table>

                     <div className="flex-1" />
                     <Table className="text-xs">
                        <TableBody>
                           <TableRow className="h-10 bg-zinc-800 text-white font-bold border-t-2 border-black">
                              <TableCell colSpan={2} className="py-1 uppercase pl-4">TOTAL PASIVA (KEWAJIBAN & EKUITAS)</TableCell>
                              <TableCell className="py-1 text-right font-black text-sm">Rp {(data.totalLiabilities + data.totalEquity).toLocaleString()}</TableCell>
                           </TableRow>
                        </TableBody>
                     </Table>
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

