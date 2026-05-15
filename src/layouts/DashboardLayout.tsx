import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  WalletCards,
  FileText,
  LogOut,
  Building,
  Box,
  Truck,
  BarChart3
} from "lucide-react";
import { cn } from "../lib/utils";

const sidebarLinks = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Master Data", href: "/master", icon: FileText },
  { name: "Pembelian", href: "/purchasing", icon: ShoppingCart },
  { name: "Penjualan", href: "/sales", icon: Truck },
  { name: "Inventory", href: "/inventory", icon: Box },
  { name: "Kas & Bank", href: "/cash-bank", icon: WalletCards },
  { name: "Aset Tetap", href: "/assets", icon: Building },
  { name: "Akuntansi", href: "/accounting", icon: FileText },
  { name: "Laporan", href: "/reports", icon: BarChart3 },
];

export default function DashboardLayout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  useKeyboardShortcuts();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#f1f3f6] dark:bg-zinc-950 font-sans antialiased">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-[#1e3a5f] text-zinc-100 flex flex-col shadow-xl">
        <div className="flex h-20 shrink-0 items-center justify-center border-b border-white/10 bg-black/10">
          <div className="flex flex-col items-center">
             <h1 className="font-black text-2xl italic tracking-tighter text-white">ACCURATE</h1>
             <span className="text-[10px] font-bold tracking-[0.2em] text-blue-300 -mt-1 ml-1 uppercase">Cloud Replica</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-6">
          <nav className="grid items-start px-3 text-sm font-medium space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.href || (link.href !== "/" && location.pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-200 group relative",
                    isActive 
                      ? "bg-white/10 text-white shadow-sm border-l-4 border-red-500 rounded-l-none -ml-3 pl-6" 
                      : "text-zinc-300 hover:text-white hover:bg-white/5 active:scale-95"
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-zinc-400")} />
                  <span className={cn(isActive && "font-bold")}>{link.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="border-t border-white/10 p-4 bg-black/20">
          <div className="mb-4 px-2">
            <p className="text-xs font-bold text-zinc-400 tracking-widest uppercase mb-1">Signed in as:</p>
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] font-medium text-blue-300 uppercase tracking-tighter">{user.role?.name}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pl-64">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
          <div className="flex items-center gap-2">
             <div className="h-6 w-1 bg-primary rounded-full" />
             <h2 className="font-bold text-zinc-800 uppercase tracking-tight">
                {sidebarLinks.find(l => location.pathname === l.href || (l.href !== "/" && location.pathname.startsWith(l.href)))?.name || "Dashboard"}
             </h2>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded tracking-widest uppercase">
                Enterprise Edition
             </div>
          </div>
        </header>
        <div className="p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
