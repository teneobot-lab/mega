import { ShoppingCart, FileText, CheckSquare, RefreshCcw, WalletCards } from "lucide-react";
import { DashboardCard } from "../../components/DashboardCard";

export default function PurchasingDashboard() {
  const menus = [
    { name: "Pesanan Pembelian", href: "/purchasing/po", icon: FileText, desc: "Buat pesanan barang & jasa ke supplier", color: "blue", count: "PO" },
    { name: "Penerimaan Barang", href: "/purchasing/receipt", icon: CheckSquare, desc: "Catat barang fisik masuk dari supplier", color: "indigo", count: "GR" },
    { name: "Faktur Pembelian", href: "/purchasing/invoice", icon: ShoppingCart, desc: "Catat tagihan dari supplier dan akui hutang", color: "orange", count: "PI" },
    { name: "Pembayaran Hutang", href: "/purchasing/payment", icon: WalletCards, desc: "Lunasi tagihan pembelian ke supplier", color: "green", count: "PAY" },
    { name: "Retur Pembelian", href: "/purchasing/return", icon: RefreshCcw, desc: "Proses pengembalian barang ke supplier", color: "red", count: "PRN" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tighter text-[#1e3a5f] uppercase italic">
          Modul Pembelian
        </h1>
        <p className="text-zinc-500 font-medium text-sm flex items-center gap-2">
            <div className="w-8 h-[2px] bg-red-500" />
            Manajemen siklus pengadaan dari pesanan hingga pelunasan hutang
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
