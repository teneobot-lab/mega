import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Fingerprint, Plus, Calculator, ArrowRightSquare, Search, Layers, Wallet } from "lucide-react";

type Account = {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: number;
};

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/master/accounts", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if(res.ok) setAccounts(data);
    } catch (e) {
      toast.error("Gagal mengambil data akun");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic uppercase italic">Bagan Akun (Chart of Accounts)</h1>
            <p className="text-xs text-zinc-500 font-medium tracking-tight uppercase italic opacity-70 tracking-widest leading-none tracking-widest">Daftar buku besar (General Ledger) perusahaan</p>
        </div>
        <Button 
            onClick={() => navigate("/master/coa/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 px-6"
        >
            <Plus className="w-4 h-4" /> Tambah Akun Baru
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden text-sm">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-zinc-400 font-bold" />
                <input 
                    type="text" 
                    placeholder="Cari akun berdasarkan nama atau kode..." 
                    className="bg-transparent border-none focus:ring-0 text-xs font-bold text-zinc-600 w-80 placeholder:text-zinc-300 placeholder:italic placeholder:font-medium uppercase tracking-widest leading-none outline-none"
                />
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">
                <span>Filter: All Categories</span>
                <span>Total: {accounts.length} Akun</span>
            </div>
        </div>
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic italic">
              <TableHead className="pl-6 w-32">Kode Akun</TableHead>
              <TableHead>Nama Akun / Ledger</TableHead>
              <TableHead>Tipe Akun</TableHead>
              <TableHead className="text-right">Saldo Terakhir</TableHead>
              <TableHead className="text-center w-24 pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-zinc-400 font-medium uppercase tracking-widest italic italic">Memuat daftar akun...</TableCell></TableRow>
            ) : accounts.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-24 text-zinc-300 font-black uppercase tracking-[0.2em] italic opacity-40">Belum ada akun terdaftar</TableCell></TableRow>
            ) : (
              accounts.map((acc) => (
                <TableRow 
                    key={acc.id} 
                    className="h-16 group hover:bg-zinc-50 transition-all active:bg-zinc-100 cursor-pointer"
                    onClick={() => navigate(`/master/coa/${acc.id}`)}
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-[#1e3a5f] font-black italic shadow-inner">
                            {acc.code.charAt(0)}
                        </div>
                        <span className="font-black text-[#1e3a5f] uppercase tracking-tighter">{acc.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-black text-zinc-700 uppercase italic italic group-hover:text-[#1e3a5f] transition-colors">{acc.name}</span>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-zinc-500 italic">
                      <div className="flex items-center gap-2">
                        <Layers className="w-3 h-3 text-zinc-300" />
                        <span className="uppercase tracking-widest leading-none">{acc.type}</span>
                      </div>
                  </TableCell>
                  <TableCell className="text-right font-black text-[#1e3a5f] tabular-nums text-lg italic italic leading-none">
                    <div className="flex items-center justify-end gap-2 leading-none">
                        <Wallet className="w-4 h-4 text-zinc-200" />
                        Rp {acc.balance.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-center pr-6">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-zinc-200 group-hover:text-[#1e3a5f] rounded-full"
                    >
                        <ArrowRightSquare className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
