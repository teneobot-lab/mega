import { WalletCards, ArrowRightLeft, CreditCard, Banknote } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function FinanceDashboard() {
  const menus = [
    { name: "Penerimaan Kas", href: "/cash-bank/receipt", icon: Banknote, desc: "Penerimaan kas selain penjualan" },
    { name: "Pengeluaran Kas", href: "/cash-bank/expense", icon: CreditCard, desc: "Biaya operasional & pengeluaran lain" },
    { name: "Transfer Bank", href: "/cash-bank/transfer", icon: ArrowRightLeft, desc: "Pindah dana antar rekening" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Kas & Bank</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menus.map((menu) => {
          const Icon = menu.icon;
          return (
            <Link key={menu.name} to={menu.href}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{menu.name}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{menu.desc}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
