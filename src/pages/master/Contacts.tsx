import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Users } from "lucide-react";
import { masterApi } from "../../lib/api-services";
import { formatCurrency, cn } from "../../lib/utils";
import { TableSkeleton } from "../../components/ui/table-skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { ErrorMessage } from "../../components/ui/error-message";

type Contact = {
  id: string;
  code: string;
  name: string;
  type: string;
  phone: string;
  balance: number;
};

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await masterApi.getContacts();
      setContacts(resData);
    } catch (e: any) {
      setError(e.message || "Gagal mengambil data kontak");
      toast.error(e.message || "Gagal mengambil data kontak");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const getStatusStyle = (type: string) => {
    switch(type) {
        case 'CUSTOMER': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'SUPPLIER': return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'SALESMAN': return 'bg-green-50 text-green-700 border-green-200';
        default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black tracking-tighter text-[#1e3a5f] uppercase italic italic">Daftar Kontak</h1>
            <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase italic opacity-70 leading-none">Kelola data master pelanggan, supplier, dan karyawan</p>
        </div>
        <Button 
            onClick={() => navigate("/master/contacts/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 px-8 h-12 rounded-full"
        >
          <Plus className="w-5 h-5" /> Tambah Kontak
        </Button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden text-sm">
        {error ? (
          <ErrorMessage message={error} onRetry={fetchContacts} className="py-20" />
        ) : loading ? (
          <div className="p-8">
            <TableSkeleton rowCount={8} columnCount={5} />
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState
            title="Belum ada data kontak"
            description="Tambah data pelanggan, supplier, atau karyawan Anda di sini."
            actionLabel="Tambah Kontak"
            onAction={() => navigate("/master/contacts/new")}
            icon={<Users className="h-10 w-10 text-zinc-300" />}
            className="py-24"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow className="h-14 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic italic border-b border-zinc-100">
                  <TableHead className="pl-10 w-32">Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead className="text-right pr-10">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((cont) => (
                    <TableRow 
                        key={cont.id} 
                        className="h-20 group hover:bg-zinc-50 transition-all cursor-pointer border-b border-zinc-50 last:border-0"
                        onClick={() => navigate(`/master/contacts/${cont.id}`)}
                    >
                      <TableCell className="pl-10">
                        <span className="font-black text-[#1e3a5f] uppercase tracking-tighter text-base group-hover:underline decoration-2 underline-offset-4">
                            {cont.code}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-black text-zinc-700 uppercase italic italic group-hover:text-[#1e3a5f] transition-colors text-sm">
                            {cont.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", getStatusStyle(cont.type))}>
                          {cont.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-zinc-500 tabular-nums">
                        {cont.phone || "-"}
                      </TableCell>
                      <TableCell className="text-right font-black text-zinc-700 pr-10 tabular-nums italic text-sm">
                        {formatCurrency(cont.balance)}
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
