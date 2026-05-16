import { Users, Building, FileText, Box, Ticket, Landmark, Percent, Briefcase, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function MasterData() {
  const menus = [
    { name: "Daftar Akun (COA)", href: "/master/coa", icon: FileText, desc: "Kelola bagan akun untuk jurnal keuangan" },
    { name: "Pelanggan & Pemasok", href: "/master/contacts", icon: Users, desc: "Data customer, supplier, dan karyawan" },
    { name: "Barang & Jasa", href: "/master/items", icon: Box, desc: "Kelola stok fisik dan jasa" },
    { name: "Gudang & Lokasi", href: "/master/warehouses", icon: Building, desc: "Daftar multi-gudang" },
    { name: "Salesman", href: "/master/salesman", icon: UserPlus, desc: "Daftar staf penjualan/marketing" },
    { name: "Department", href: "/master/departments", icon: Landmark, desc: "Mapping biaya per departemen" },
    { name: "Project", href: "/master/projects", icon: Briefcase, desc: "Lacak profitabilitas per proyek" },
    { name: "Pajak (Tax)", href: "/master/taxes", icon: Percent, desc: "PPN, PPh, dan peraturan pajak" },
    { name: "Mata Uang (Currency)", href: "/master/currencies", icon: Ticket, desc: "Multi-currency dan kurs harian" },
    { name: "Satuan (UOM)", href: "/master/uoms", icon: Box, desc: "Satuan barang (Pcs, Box, Kg)" },
    { name: "Kategori Barang", href: "/master/item-categories", icon: Box, desc: "Pengelompokan barang & jasa" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic">Master Data Central</h1>
          <p className="text-xs text-zinc-500 font-medium">Manajemen data referensi dan pengaturan sistem</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {menus.map(menu => (
          <Link key={menu.href} to={menu.href}>
            <Card className="hover:bg-zinc-50 transition-all cursor-pointer border-zinc-200 shadow-sm hover:shadow-md h-full group">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors">
                  <menu.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-black uppercase tracking-tight group-hover:text-[#1e3a5f] transition-colors">{menu.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] font-medium text-zinc-500 leading-tight">{menu.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
