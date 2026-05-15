import { FileText, BookOpen, BarChart3, PieChart, Repeat } from "lucide-react";
import { DashboardCard } from "../../components/DashboardCard";

export default function AccountingDashboard() {
  const menus = [
    { name: "Jurnal Umum", href: "/accounting/journals", icon: FileText, desc: "Daftar dan buat jurnal manual perusahaan", color: "blue", count: "JV" },
    { name: "Buku Besar", href: "/accounting/ledger", icon: BookOpen, desc: "Rincian pergerakan saldo per akun (General Ledger)", color: "indigo", count: "GL" },
    { name: "Neraca", href: "/accounting/balance-sheet", icon: PieChart, desc: "Laporan posisi keuangan (Statemen of Financial Position)", color: "orange", count: "BS" },
    { name: "Laba / Rugi", href: "/accounting/income-statement", icon: BarChart3, desc: "Laporan Pendapatan dan Beban (Profit & Loss Statement)", color: "green", count: "PL" },
    { name: "Transaksi Berulang", href: "/accounting/recurring", icon: Repeat, desc: "Otomatisasi jurnal rutin bulanan/mingguan", color: "purple", count: "REC" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tighter text-[#1e3a5f] uppercase italic">
          Buku Besar & Jurnal
        </h1>
        <p className="text-zinc-500 font-medium text-sm flex items-center gap-2">
            <div className="w-8 h-[2px] bg-red-500" />
            Pusat pencatatan transaksi finansial dan pelaporan standar akuntansi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {menus.map((menu) => (
          <DashboardCard 
            key={menu.name}
            title={menu.name}
            href={menu.href}
            icon={menu.icon}
            description={menu.desc}
            color={menu.color}
            count={menu.count}
          />
        ))}
      </div>
    </div>
  );
}
