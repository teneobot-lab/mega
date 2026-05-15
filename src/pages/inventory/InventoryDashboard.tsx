import { Box, ArrowRightLeft, RefreshCw, Layers } from "lucide-react";
import { Link } from "react-router-dom";

export default function InventoryDashboard() {
  const menus = [
    { name: "Stok Barang", href: "/inventory/stocks", icon: Layers, desc: "Lihat saldo stok di setiap gudang" },
    { name: "Pemindahan Barang", href: "/inventory/transfer", icon: ArrowRightLeft, desc: "Pindah stok antar gudang fisik" },
    { name: "Penyesuaian Stok", href: "/inventory/adjust", icon: RefreshCw, desc: "Sesuai fisik vs sistem" },
    { name: "Kartu Stok", href: "/inventory/stock-card", icon: Box, desc: "Histori mutasi barang (Audit Trail)" },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-[14px] font-bold text-[var(--ac-primary-dark)] uppercase">
        Modul Persediaan
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {menus.map((menu) => {
          const Icon = menu.icon;
          return (
            <Link 
              key={menu.name}
              to={menu.href}
              className="flex items-start gap-3 p-3 bg-white border border-[var(--ac-border-default)] hover:bg-[#EBF3FB] hover:border-[var(--ac-border-focus)] transition-all rounded-[2px]"
            >
              <div className="p-1 text-[var(--ac-primary-dark)]">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[var(--ac-primary-dark)]">{menu.name}</span>
                <span className="text-[11px] text-[var(--ac-text-secondary)]">{menu.desc}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
