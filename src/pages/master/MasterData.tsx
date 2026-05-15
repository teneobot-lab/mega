import { Users, Building, FileText, Box } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function MasterData() {
  const menus = [
    { name: "Daftar Akun (COA)", href: "/accounts", icon: FileText, desc: "Kelola bagan akun untuk jurnal keuangan" },
    { name: "Pelanggan & Pemasok", href: "/contacts", icon: Users, desc: "Data customer, supplier, dan karyawan" },
    { name: "Barang & Jasa", href: "/items", icon: Box, desc: "Kelola stok fisik dan jasa" },
    { name: "Gudang & Lokasi", href: "/warehouses", icon: Building, desc: "Daftar multi-gudang" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Master Data</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menus.map(menu => (
          <Link key={menu.href} to={menu.href}>
            <Card className="hover:bg-zinc-50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-2 bg-zinc-100 rounded-md">
                  <menu.icon className="h-5 w-5 text-zinc-600" />
                </div>
                <CardTitle className="text-base">{menu.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-500">{menu.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
