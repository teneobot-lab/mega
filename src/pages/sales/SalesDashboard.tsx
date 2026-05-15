import { ShoppingBag, FileText, CheckSquare, RefreshCcw, WalletCards } from "lucide-react";
import { DashboardCard } from "../../components/DashboardCard";

export default function SalesDashboard() {
  const menus = [
    { name: "Pesanan Penjualan", href: "/sales/so", icon: FileText, desc: "Catat pesanan barang & jasa dari pelanggan", color: "blue", count: "SO" },
    { name: "Pengiriman Pesanan", href: "/sales/delivery", icon: CheckSquare, desc: "Kirim barang fisik dari gudang ke pelanggan", color: "indigo", count: "DO" },
    { name: "Faktur Penjualan", href: "/sales/invoice", icon: ShoppingBag, desc: "Kirim tagihan dan akui pendapatan", color: "orange", count: "SI" },
    { name: "Penerimaan Piutang", href: "/sales/payment", icon: WalletCards, desc: "Terima pembayaran tunai atau transfer bank", color: "green", count: "PAY" },
    { name: "Retur Penjualan", href: "/sales/return", icon: RefreshCcw, desc: "Proses pengembalian barang dari pelanggan", color: "red", count: "SRN" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tighter text-[#1e3a5f] uppercase italic">
          Modul Penjualan
        </h1>
        <p className="text-zinc-500 font-medium text-sm flex items-center gap-2">
            <div className="w-8 h-[2px] bg-red-500" />
            Manajemen siklus pendapatan dari pesanan hingga pelunasan
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
