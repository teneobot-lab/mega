import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, ArrowRightSquare, Search, Layers, Wallet, Filter } from "lucide-react";
import { masterApi } from "../../lib/api-services";
import { formatCurrency, cn } from "../../lib/utils";
import { TableSkeleton } from "../../components/ui/table-skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { ErrorMessage } from "../../components/ui/error-message";

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
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await masterApi.getAccounts();
      setAccounts(data);
    } catch (e: any) {
      setError(e.message || "Gagal mengambil data akun");
      toast.error(e.message || "Gagal mengambil data akun");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.name.toLowerCase().includes(search.toLowerCase()) ||
      acc.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tighter text-[#1e3a5f] uppercase italic italic">
            Bagan Akun
          </h1>
          <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase italic opacity-70 leading-none">
            Daftar buku besar (General Ledger) perusahaan
          </p>
        </div>
        <Button
          onClick={() => navigate("/master/coa/new")}
          className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 px-8 h-12 rounded-full"
        >
          <Plus className="w-5 h-5" /> Tambah Akun
        </Button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden text-sm">
        <div className="p-8 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-50/30">
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-zinc-200 shadow-inner flex-1 max-w-md group focus-within:ring-2 focus-within:ring-[#1e3a5f]/10 transition-all">
            <Search className="w-4 h-4 text-zinc-400 font-bold group-focus-within:text-[#1e3a5f]" />
            <input
              type="text"
              placeholder="Cari akun berdasarkan nama atau kode..."
              className="bg-transparent border-none focus:ring-0 text-xs font-bold text-zinc-600 w-full placeholder:text-zinc-300 placeholder:italic placeholder:font-medium uppercase tracking-widest leading-none outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full text-zinc-500">
              <Filter className="w-3 h-3" />
              <span>All Categories</span>
            </div>
            <span className="hidden sm:inline">Total: {filteredAccounts.length} Akun</span>
          </div>
        </div>

        {error ? (
          <ErrorMessage message={error} onRetry={fetchAccounts} className="py-20" />
        ) : loading ? (
          <div className="p-8">
            <TableSkeleton rowCount={8} columnCount={5} />
          </div>
        ) : filteredAccounts.length === 0 ? (
          <EmptyState
            title={search ? "Akun tidak ditemukan" : "Belum ada akun"}
            description={
              search
                ? `Tidak ada hasil untuk "${search}". Coba kata kunci lain.`
                : "Mulai dengan menambahkan akun baru ke bagan akun Anda."
            }
            actionLabel={search ? "Clear Search" : "Tambah Akun Pertama"}
            onAction={search ? () => setSearch("") : () => navigate("/master/coa/new")}
            className="py-24"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow className="h-14 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic italic border-b border-zinc-100">
                  <TableHead className="pl-10 w-40">Kode Akun</TableHead>
                  <TableHead>Nama Akun / Ledger</TableHead>
                  <TableHead>Tipe Akun</TableHead>
                  <TableHead className="text-right">Saldo Terakhir</TableHead>
                  <TableHead className="text-center w-24 pr-10">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((acc) => (
                  <TableRow
                    key={acc.id}
                    className="h-20 group hover:bg-zinc-50 transition-all active:bg-zinc-100 cursor-pointer border-b border-zinc-50 last:border-0"
                    onClick={() => navigate(`/master/coa/${acc.id}`)}
                  >
                    <TableCell className="pl-10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#1e3a5f]/5 text-[#1e3a5f] flex items-center justify-center font-black italic shadow-inner border border-[#1e3a5f]/10 group-hover:bg-[#1e3a5f] group-hover:text-white transition-all duration-300">
                          {acc.code.charAt(0)}
                        </div>
                        <span className="font-black text-[#1e3a5f] uppercase tracking-tighter text-base">
                          {acc.code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-black text-zinc-700 uppercase italic italic group-hover:text-[#1e3a5f] transition-colors text-sm">
                        {acc.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-zinc-400 italic">
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-zinc-300" />
                        <span className="uppercase tracking-[0.15em] leading-none whitespace-nowrap">
                          {acc.type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-black text-[#1e3a5f] tabular-nums text-xl italic italic leading-none">
                      <div className="flex items-center justify-end gap-3 leading-none">
                        <Wallet className="w-5 h-5 text-zinc-200 group-hover:text-[#1e3a5f]/30 transition-colors" />
                        {formatCurrency(acc.balance)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center pr-10">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 text-zinc-300 group-hover:text-[#1e3a5f] rounded-full hover:bg-white hover:shadow-md transition-all active:scale-90"
                      >
                        <ArrowRightSquare className="h-6 w-6" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
