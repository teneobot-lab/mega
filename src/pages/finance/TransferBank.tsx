import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { ArrowRightLeft } from "lucide-react";

export default function TransferBank() {
  const [open, setOpen] = useState(false);
  
  const [accounts, setAccounts] = useState<{id: string, name: string, balance: number}[]>([]);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sourceAccountId, setSourceAccountId] = useState("");
  const [targetAccountId, setTargetAccountId] = useState("");
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState("");

  const loadAccounts = async () => {
    try {
      const res = await fetch("/api/master/accounts", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }});
      if(res.ok) {
         const data = await res.json();
         const banks = data.filter((a: any) => a.type === "ASSET" && (a.name.toLowerCase().includes("kas") || a.name.toLowerCase().includes("bank")));
         setAccounts(banks);
         if(banks.length >= 2) {
            setSourceAccountId(banks[0].id);
            setTargetAccountId(banks[1].id);
         }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadAccounts();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(amount <= 0) return toast.error("Jumlah harus lebih dari 0");
    if(sourceAccountId === targetAccountId) return toast.error("Akun sumber dan tujuan tidak boleh sama");

    try {
      const res = await fetch("/api/finance/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ date, sourceAccountId, targetAccountId, amount, notes })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Transfer berhasil dicatat");
      setOpen(false);
      setAmount(0);
      setNotes("");
    } catch (e: any) {
      toast.error(e.message || "Gagal mencatat transfer");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Transfer Bank</h1>
           <p className="text-zinc-500">Pindah dana antar rekening bank atau kas.</p>
        </div>
      </div>

      <div className="bg-white p-6 border rounded-lg max-w-xl">
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Tanggal Transfer</Label>
              <Input type="date" required value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
               <div className="space-y-2">
                 <Label>Dari Rekening</Label>
                 <select 
                   className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                   value={sourceAccountId} onChange={e => setSourceAccountId(e.target.value)} required
                 >
                   {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Rp {a.balance.toLocaleString()})</option>)}
                 </select>
               </div>
               
               <div className="pt-6">
                  <ArrowRightLeft className="text-zinc-400" />
               </div>

               <div className="space-y-2">
                 <Label>Ke Rekening</Label>
                 <select 
                   className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                   value={targetAccountId} onChange={e => setTargetAccountId(e.target.value)} required
                 >
                   {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Rp {a.balance.toLocaleString()})</option>)}
                 </select>
               </div>
            </div>

            <div className="space-y-2">
              <Label>Jumlah Transfer (Rp)</Label>
              <Input type="number" required min={1} value={amount} onChange={e => setAmount(Number(e.target.value))} className="text-xl font-semibold" />
            </div>

            <div className="space-y-2">
              <Label>Catatan Tambahan (Opsional)</Label>
              <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Misal: Pindah dana ke mandiri" />
            </div>

            <div className="pt-4">
               <Button type="submit" className="w-full">Proses Transfer</Button>
            </div>
         </form>
      </div>
    </div>
  );
}
