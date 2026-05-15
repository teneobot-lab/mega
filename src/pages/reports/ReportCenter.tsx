import React from "react";
import { 
  FileText, 
  BarChart3, 
  PieChart, 
  ArrowRightLeft, 
  BookOpen, 
  TrendingUp, 
  Wallet,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

const reportGroups = [
  {
    title: "Laporan Keuangan",
    description: "Laporan posisi keuangan utama",
    reports: [
      { name: "Neraca (Balance Sheet)", path: "/accounting/balance-sheet", icon: Wallet },
      { name: "Laba / Rugi (Income Statement)", path: "/accounting/income-statement", icon: TrendingUp },
      { name: "Arus Kas (Cash Flow)", path: "/reports/cash-flow", icon: ArrowRightLeft },
      { name: "Laporan Pajak", path: "/reports/tax", icon: PieChart },
    ]
  },
  {
    title: "Buku Besar",
    description: "Detail mutasi akun dan saldo",
    reports: [
      { name: "Buku Besar (Ledger)", path: "/accounting/ledger", icon: BookOpen },
      { name: "Jurnal Umum", path: "/accounting/journals", icon: FileText },
      { name: "Neraca Saldo", path: "/reports/trial-balance", icon: Settings },
    ]
  },
  {
    title: "Penjualan & Piutang",
    description: "Laporan aktivitas penjualan",
    reports: [
      { name: "Laporan Penjualan", path: "/reports/sales", icon: BarChart3 },
      { name: "Aging Piutang (AR)", path: "/reports/ar-aging", icon: PieChart },
    ]
  },
  {
    title: "Pembelian & Hutang",
    description: "Laporan aktivitas pembelian",
    reports: [
      { name: "Laporan Pembelian", path: "/reports/purchase", icon: BarChart3 },
      { name: "Aging Hutang (AP)", path: "/reports/ap-aging", icon: PieChart },
    ]
  },
  {
    title: "Inventory",
    description: "Analisis stok barang",
    reports: [
      { name: "Kartu Stok", path: "/reports/stock-card", icon: FileText },
    ]
  }
];

export default function ReportCenter() {
  return (
    <div className="space-y-10 pb-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tighter text-[#1e3a5f] uppercase italic">
          Pusat Laporan
        </h1>
        <p className="text-zinc-500 font-medium text-sm flex items-center gap-2">
          <div className="w-8 h-[2px] bg-red-500" />
          Akses seluruh laporan finansial dan operasional perusahaan anda
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {reportGroups.map((group, idx) => (
          <div key={idx} className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-indigo-600 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-1000 group-hover:duration-200"></div>
            <Card className="relative border-zinc-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl">
              <CardHeader className="bg-[#1e3a5f] text-white py-4 px-6">
                <div className="flex items-center justify-between">
                   <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-90">{group.title}</CardTitle>
                   <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                   </div>
                </div>
                <CardDescription className="text-white/60 text-[10px] uppercase font-bold mt-1">{group.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 bg-white">
                <div className="flex flex-col">
                  {group.reports.map((report, rIdx) => (
                    <Link 
                      key={rIdx} 
                      to={report.path}
                      className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-all border-b border-zinc-100 last:border-0 group/item"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center mr-4 group-hover/item:bg-red-50 transition-colors">
                           <report.icon className="w-4 h-4 text-zinc-400 group-hover/item:text-red-500 transition-colors" />
                        </div>
                        <span className="text-sm font-bold text-zinc-700 group-hover/item:text-[#1e3a5f] transition-colors">{report.name}</span>
                      </div>
                      <TrendingUp className="w-3 h-3 text-zinc-300 group-hover/item:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all transform translate-x-2 group-hover/item:translate-x-0" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
