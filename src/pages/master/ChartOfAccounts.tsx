import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";

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
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ code: "", name: "", type: "ASSET" });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/master/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      toast.success("Akun berhasil dibuat");
      setOpen(false);
      setFormData({ code: "", name: "", type: "ASSET" });
      fetchAccounts();
    } catch (e: any) {
      toast.error(e.message || "Gagal membuat akun");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Daftar Akun (COA)</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Tambah Akun</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Akun Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Kode Akun</Label>
                <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required placeholder="Ex: 110-30" />
              </div>
              <div className="space-y-2">
                <Label>Nama Akun</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ex: Kas Kecil" />
              </div>
              <div className="space-y-2">
                <Label>Tipe Akun</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="ASSET">Asset (Harta)</option>
                  <option value="LIABILITY">Liability (Kewajiban)</option>
                  <option value="EQUITY">Equity (Ekuitas)</option>
                  <option value="REVENUE">Revenue (Pendapatan)</option>
                  <option value="EXPENSE">Expense (Beban)</option>
                </select>
              </div>
              <Button type="submit" className="w-full">Simpan</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="text-right">Saldo Saat Ini</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : accounts.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center">Belum ada data</TableCell></TableRow>
            ) : (
              accounts.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell className="font-medium">{acc.code}</TableCell>
                  <TableCell>{acc.name}</TableCell>
                  <TableCell>{acc.type}</TableCell>
                  <TableCell className="text-right">Rp {acc.balance.toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
