import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Plus, Trash } from "lucide-react";

export default function GeneralJournal() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<{id: string, name: string, code: string}[]>([]);

  // State Form Baru
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [entries, setEntries] = useState<{accountId: string, debit: number, credit: number}[]>([
      { accountId: "", debit: 0, credit: 0 },
      { accountId: "", debit: 0, credit: 0 }
  ]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/accounting/journals", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data jurnal");
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
     try {
       const res = await fetch("/api/master/accounts", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }});
       if(res.ok) {
           const body = await res.json();
           setAccounts(body);
           if(body.length >= 2) {
             const newE = [...entries];
             newE[0].accountId = body[0].id;
             newE[1].accountId = body[1].id;
             setEntries(newE);
           }
       }
     } catch (e) {}
  };

  useEffect(() => {
    fetchData();
    loadAccounts();
  }, []);

  const handleAddLine = () => {
    setEntries([...entries, { accountId: accounts[0]?.id || "", debit: 0, credit: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    if(entries.length <= 2) return toast.error("Minimal harus ada 2 baris jurnal");
    const newLines = [...entries];
    newLines.splice(index, 1);
    setEntries(newLines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
    const totalCredit = entries.reduce((s, e) => s + e.credit, 0);

    if (totalDebit !== totalCredit) return toast.error("Total Debit harus sama dengan Kredit!");
    if (totalDebit === 0) return toast.error("Total Debit/Kredit tidak boleh 0");
    if (entries.some(e => !e.accountId)) return toast.error("Semua baris harus memilih akun");

    try {
      const res = await fetch("/api/accounting/journals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ date, description, entries })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Jurnal Umum berhasil dicatat");
      setOpen(false);
      setDescription("");
      const newE = [
         { accountId: accounts[0]?.id || "", debit: 0, credit: 0 },
         { accountId: accounts[1]?.id || "", debit: 0, credit: 0 }
      ];
      setEntries(newE);
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Gagal mencatat jurnal");
    }
  };

  const totalD = entries.reduce((s, e) => s + e.debit, 0);
  const totalC = entries.reduce((s, e) => s + e.credit, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Jurnal Umum</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Buat Jurnal Manual</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Jurnal Umum Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input type="date" required value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi / Catatan Transaksi</Label>
                  <Input value={description} required onChange={e => setDescription(e.target.value)} placeholder="Misal: Catat beban penyusutan kendaraan" />
                </div>
              </div>
              
              <div className="border bg-zinc-50 rounded-lg p-4 space-y-4 mt-4">
                <div className="flex items-center justify-between">
                   <h3 className="font-semibold text-sm">Baris Jurnal</h3>
                   <Button type="button" variant="outline" size="sm" onClick={handleAddLine}><Plus className="h-4 w-4 mr-2"/> Tambah</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Akun Transaksi</TableHead>
                      <TableHead className="w-48 text-right">Debit</TableHead>
                      <TableHead className="w-48 text-right">Kredit</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((line, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <select 
                            className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                            value={line.accountId}
                            onChange={(e) => {
                              const newLines = [...entries];
                              newLines[idx].accountId = e.target.value;
                              setEntries(newLines);
                            }}
                          >
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input type="number" min={0} value={line.debit} 
                            onChange={(e) => {
                              const newLines = [...entries];
                              newLines[idx].debit = Number(e.target.value);
                              // Auto zero out credit
                              if(newLines[idx].debit > 0) newLines[idx].credit = 0;
                              setEntries(newLines);
                            }} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" min={0} value={line.credit}
                             onChange={(e) => {
                              const newLines = [...entries];
                              newLines[idx].credit = Number(e.target.value);
                              // Auto zero out debit
                              if(newLines[idx].credit > 0) newLines[idx].debit = 0;
                              setEntries(newLines);
                            }} />
                        </TableCell>
                        <TableCell>
                           {entries.length > 2 && (
                             <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveLine(idx)}>
                               <Trash className="h-4 w-4" />
                             </Button>
                           )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="flex justify-between items-center text-sm font-bold pt-4">
                   <div className={totalD === totalC ? "text-green-600" : "text-red-600"}>
                     {totalD === totalC ? "Balance ✅" : "Tidak Balance ❌"}
                   </div>
                   <div className="space-x-8">
                     <span>Total Debit: Rp {totalD.toLocaleString()}</span>
                     <span>Total Kredit: Rp {totalC.toLocaleString()}</span>
                   </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit">Catat Jurnal</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {loading ? (
             <div className="text-center p-8 bg-white border rounded">Loading...</div>
        ) : data.length === 0 ? (
             <div className="text-center p-8 bg-white border rounded">Belum ada aktivitas jurnal</div>
        ) : (
          data.map(journal => (
            <div key={journal.id} className="bg-white border rounded-lg p-0 overflow-hidden shadow-sm">
                <div className="bg-zinc-100 p-4 border-b flex justify-between items-center text-sm">
                  <div className="space-y-1">
                    <span className="font-bold text-primary block">{journal.journalNumber} {journal.isAuto && "(AUTO)"}</span>
                    <span className="text-zinc-500 block">{new Date(journal.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold block">{journal.description}</span>
                    <span className="text-zinc-500 text-xs">{journal.reference && `Ref: ${journal.reference}`}</span>
                  </div>
                </div>
                <Table>
                   <TableHeader className="bg-white">
                      <TableRow>
                          <TableHead>Akun</TableHead>
                          <TableHead className="text-right w-48">Debit</TableHead>
                          <TableHead className="text-right w-48">Kredit</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {journal.Entries.map((e: any) => (
                         <TableRow key={e.id}>
                            <TableCell>{e.account.code} - {e.account.name}</TableCell>
                            <TableCell className="text-right">{e.debit > 0 ? `Rp ${e.debit.toLocaleString()}` : '-'}</TableCell>
                            <TableCell className="text-right">{e.credit > 0 ? `Rp ${e.credit.toLocaleString()}` : '-'}</TableCell>
                         </TableRow>
                      ))}
                      <TableRow className="font-bold bg-zinc-50">
                         <TableCell className="text-right">Total:</TableCell>
                         <TableCell className="text-right">Rp {journal.Entries.reduce((s:any, e:any)=>s+e.debit, 0).toLocaleString()}</TableCell>
                         <TableCell className="text-right">Rp {journal.Entries.reduce((s:any, e:any)=>s+e.credit, 0).toLocaleString()}</TableCell>
                      </TableRow>
                   </TableBody>
                </Table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
