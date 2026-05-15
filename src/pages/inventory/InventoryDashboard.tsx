import { Box, ArrowRightLeft, RefreshCw, Layers } from "lucide-react";
import { DashboardCard } from "../../components/DashboardCard";

export default function InventoryDashboard() {
  const menus = [
    { name: "Stok Barang", href: "/inventory/stocks", icon: Layers, desc: "Lihat saldo stok di setiap gudang", color: "blue", count: "STK" },
    { name: "Pemindahan Barang", href: "/inventory/transfer", icon: ArrowRightLeft, desc: "Pindah stok antar gudang fisik", color: "indigo", count: "TRF" },
    { name: "Penyesuaian Stok", href: "/inventory/adjust", icon: RefreshCw, desc: "Sesuai fisik vs sistem (Stock Opname)", color: "orange", count: "ADJ" },
    { name: "Kartu Stok", href: "/inventory/stock-card", icon: Box, desc: "Histori mutasi barang (Audit Trail Kontrol)", color: "green", count: "CRD" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tighter text-[#1e3a5f] uppercase italic">
          Persediaan
        </h1>
        <p className="text-zinc-500 font-medium text-sm flex items-center gap-2">
            <div className="w-8 h-[2px] bg-red-500" />
            Manajemen pergudangan dan kontrol saldo barang
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Decorative Branding Element */}
      <div className="mt-12 p-8 border-2 border-dashed border-zinc-200 rounded-3xl flex items-center justify-center bg-zinc-50/50">
         <div className="text-center group cursor-default">
            <Box className="h-12 w-12 text-zinc-200 mx-auto group-hover:text-primary transition-colors duration-500" />
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em] mt-4">Module Persediaan Terintegrasi</p>
         </div>
      </div>
    </div>
  );
}
