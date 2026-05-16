import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Users } from "lucide-react";
import { masterApi } from "../../lib/api-services";

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
  const navigate = useNavigate();

  const fetchContacts = async () => {
    try {
      const resData = await masterApi.getContacts();
      setContacts(resData);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengambil data kontak");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const getStatusBadge = (type: string) => {
    switch(type) {
        case 'CUSTOMER': return 'bg-blue-100 text-blue-700';
        case 'SUPPLIER': return 'bg-orange-100 text-orange-700';
        case 'SALESMAN': return 'bg-green-100 text-green-700';
        default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic">Daftar Kontak</h1>
            <p className="text-xs text-zinc-500 font-medium">Data Master Pelanggan, Supplier, dan Karyawan</p>
        </div>
        <Button 
            onClick={() => navigate("/master/contacts/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-bold gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Tambah Kontak
        </Button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12 text-zinc-500 uppercase font-black text-[10px] tracking-widest">
              <TableHead className="pl-6">Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead className="text-right pr-6">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : contacts.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-20">
                     <div className="flex flex-col items-center gap-2 opacity-20">
                         <Users className="h-12 w-12" />
                         <p className="text-sm font-bold uppercase tracking-widest">Belum ada data Kontak</p>
                     </div>
                 </TableCell>
               </TableRow>
            ) : (
              contacts.map((cont) => (
                <TableRow 
                    key={cont.id} 
                    className="group hover:bg-zinc-50 transition-colors h-14 cursor-pointer"
                    onClick={() => navigate(`/master/contacts/${cont.id}`)}
                >
                  <TableCell className="font-bold text-[#1e3a5f] pl-6 group-hover:underline">{cont.code}</TableCell>
                  <TableCell className="text-sm font-semibold text-zinc-700">{cont.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${getStatusBadge(cont.type)} shadow-sm`}>
                      {cont.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-zinc-500">{cont.phone || "-"}</TableCell>
                  <TableCell className="text-right font-black text-zinc-700 pr-6 tabular-nums">Rp {cont.balance.toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
