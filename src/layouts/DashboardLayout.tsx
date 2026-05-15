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
    <div className="flex min-h-screen bg-[#F0F4F8] font-sans antialiased">
      {/* Sidebar - EXACT ACCURATE STYLE */}
      <aside className="fixed inset-y-0 left-0 z-50 w-[200px] bg-[#1B3A6B] text-[#BDC3C7] flex flex-col shadow-none border-none">
        {/* Logo/Title Area */}
        <div className="flex h-12 shrink-0 items-center px-[12px] bg-[#0F2A52] shadow-inner">
           <h1 className="font-bold text-[14px] text-white tracking-tight">ACCURATE 5</h1>
        </div>

        <div className="flex-1 overflow-auto py-2">
          {/* Menu Items */}
          <nav className="grid items-start text-sm font-medium">
            <div className="text-[10px] font-bold text-[#7F9DBF] px-[12px] pt-[12px] pb-[4px] uppercase tracking-[0.5px]">Main Navigation</div>
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.href || (link.href !== "/" && location.pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center h-[30px] px-[16px] gap-[8px] transition-all cursor-pointer",
                    isActive 
                      ? "bg-[#2B5BA8] text-white border-l-[3px] border-[#4A7FD4] px-[13px]" 
                      : "hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-[14px] w-[14px]", isActive ? "text-white" : "text-inherit")} />
                  <span className="text-[12px]">{link.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="bg-[#0F2A52] p-[12px] border-t border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-white truncate">{user.name}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-[11px] text-[#7F9DBF] hover:text-white transition-colors"
          >
            <LogOut className="h-3 w-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pl-[200px] flex flex-col h-screen">
        <div className="flex-1 overflow-auto bg-white">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
