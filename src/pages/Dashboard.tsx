import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Users, Truck, ShoppingCart, Box, TrendingUp, ArrowUpRight, ArrowDownLeft, Activity } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
     totalPiutang: 0, countPiutang: 0,
     totalHutang: 0, countHutang: 0,
     totalKas: 0,
     minimumStocks: 0
  });

  useEffect(() => {
     fetch("/api/dashboard/summary", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } })
        .then(res => res.json())
        .then(d => {
            setData(d);
            setLoading(false);
        })
        .catch(e => console.error(e));
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tighter text-[#1e3a5f] uppercase italic">
          Dashboard Eksekutif
        </h1>
        <p className="text-zinc-500 font-medium text-sm flex items-center gap-2">
            <div className="w-8 h-[2px] bg-red-500" />
            Ikhtisar posisi keuangan dan operasional real-time
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Klaim Pelanggan", val: data.totalPiutang, sub: `${data.countPiutang} Invoice Open`, Icon: ArrowUpRight, color: "blue" },
          { title: "Kewajiban Supplier", val: data.totalHutang, sub: `${data.countHutang} Bill Open`, Icon: ArrowDownLeft, color: "indigo" },
          { title: "Likuiditas Kas", val: data.totalKas, sub: "Saldo Konsolidasi", Icon: TrendingUp, color: "green" },
          { title: "Defisit Persediaan", val: data.minimumStocks, sub: "Item Perlu Restock", Icon: Activity, color: "red" },
        ].map((card, i) => (
            <Card key={i} className="border-zinc-200 overflow-hidden group shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-primary transition-colors">
                    {card.title}
                </CardTitle>
                <div className={`p-1.5 rounded-lg border bg-zinc-50 ${i === 3 && card.val > 0 ? 'bg-red-50 border-red-200 text-red-600 animate-bounce' : 'group-hover:bg-primary group-hover:text-white transition-colors'}`}>
                    <card.Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-[150px]" />
                        <Skeleton className="h-4 w-[100px]" />
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className={`text-2xl font-black tracking-tight ${i === 3 && card.val > 0 ? 'text-red-500' : 'text-[#1e3a5f]'}`}>
                            {i === 3 ? `${card.val} Items` : `Rp ${card.val.toLocaleString()}`}
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mt-1">{card.sub}</p>
                    </div>
                )}
              </CardContent>
              <div className={`h-1 w-full ${i === 2 ? 'bg-green-500' : i === 3 ? 'bg-red-500' : 'bg-primary'} opacity-20`} />
            </Card>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          <CardHeader className="bg-zinc-50 border-b">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-[#1e3a5f]">Aktivitas Ledger Terakhir</CardTitle>
            <CardDescription className="text-[10px] font-bold">Log mutasi transaksi sistem ke buku besar</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
             <div className="text-center">
                <TrendingUp className="h-12 w-12 text-zinc-100 mx-auto" />
                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mt-4">Menunggu Data Transaksi Baru...</p>
             </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          <CardHeader className="bg-zinc-50 border-b">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-[#1e3a5f]">Indikator Cash Flow</CardTitle>
            <CardDescription className="text-[10px] font-bold">Trend 30 Hari Terakhir</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col items-center justify-center p-8">
             <div className="w-full space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                      <span>Inflow Integrity</span>
                      <span className="text-green-600">Stable</span>
                   </div>
                   <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[70%]" />
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                      <span>Outflow Burn</span>
                      <span className="text-amber-500">Normal</span>
                   </div>
                   <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-[35%]" />
                   </div>
                </div>
             </div>
             <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mt-12">Analisis Finansial Otomatis</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
