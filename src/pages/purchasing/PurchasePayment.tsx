import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";

import { Printer } from "lucide-react";
import { PrintVoucher } from "../../components/PrintVoucher";

type Payment = {
  id: string;
  payNumber: string;
  date: string;
  contact: { name: string };
  amount: number;
  notes?: string;
  Journals?: any[];
  Lines?: any[];
};

export default function PurchasePayment() {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);
  
  // Data for Form
  const [invoices, setInvoices] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<{id: string, name: string}[]>([]);

  // State Form Baru
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceId, setInvoiceId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/purchasing/payments", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data Pembayaran");
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [invRes, accRes] = await Promise.all([
        fetch("/api/purchasing/invoices", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}),
        fetch("/api/master/accounts", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}),
      ]);
      const [invs, accs] = await Promise.all([invRes.json(), accRes.json()]);
      
      const unpaidInvs = invs.filter((i: any) => i.balance > 0);
      setInvoices(unpaidInvs);
      if(unpaidInvs.length > 0) {
        setInvoiceId(unpaidInvs[0].id);
        setAmount(unpaidInvs[0].balance);
      }
      
      const assetAccs = accs.filter((a: any) => a.type === "ASSET" && (a.name.toLowerCase().includes("kas") || a.name.toLowerCase().includes("bank")));
      setAccounts(assetAccs);
      if(assetAccs.length > 0) setAccountId(assetAccs[0].id);
    } catch (e) {}
  };

  useEffect(() => {
    fetchData();
    loadDependencies();
  }, [open]);

  const handleInvoiceChange = (val: string) => {
    setInvoiceId(val);
    const selected = invoices.find(i => i.id === val);
    if(selected) setAmount(selected.balance);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(amount <= 0) return toast.error("Jumlah harus lebih dari 0");
    
    const selectedInv = invoices.find(i => i.id === invoiceId);

    try {
      const res = await fetch("/api/purchasing/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          date: payDate,
          contactId: selectedInv?.contactId,
          amount,
          notes,
          invoiceId,
          accountId
        })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Pembayaran berhasil dicatat");
      setOpen(false);
      setNotes("");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Gagal mencatat pembayaran");
    }
  };

  const handlePrint = (pay: any) => {
    // Find bank entry (credit for payment)
    const bankEntry = pay.Journals?.[0]?.Entries?.find((e: any) => e.credit > 0);
    const voucherData = {
        ...pay,
        type: "PAY", // Payment
        account: bankEntry?.account,
        invoice: pay.Lines?.[0]?.invoice
    };
    setPrintData(voucherData);
    setTimeout(() => {
        window.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Print Area */}
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        <PrintVoucher data={printData} />
      </div>

      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold tracking-tight">Pembayaran Hutang Usaha</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Buat Pembayaran Baru</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Catat Pembayaran Hutang</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input type="date" required value={payDate} onChange={e => setPayDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Akun Sumber Dana (Kas/Bank)</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={accountId} onChange={e => setAccountId(e.target.value)} required
                  >
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Pilih Tagihan (Invoice Pembelian)</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={invoiceId} onChange={e => handleInvoiceChange(e.target.value)} required
                  >
                    {invoices.map(i => <option key={i.id} value={i.id}>{i.invNumber} - {i.contact.name} (Sisa: Rp {i.balance.toLocaleString()})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Jumlah Bayar</Label>
                  <Input type="number" required min={1} value={amount} onChange={e => setAmount(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Catatan Tambahan</Label>
                  <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Misal: Lunas via transfer BCA" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">Catat Pembayaran</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor Pembayaran</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Pemasok</TableHead>
              <TableHead className="text-right">Jumlah Dibayar</TableHead>
              <TableHead className="text-center w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center">Belum ada data</TableCell></TableRow>
            ) : (
              data.map((pay) => (
                <TableRow key={pay.id}>
                  <TableCell className="font-medium text-primary cursor-pointer hover:underline">{pay.payNumber}</TableCell>
                  <TableCell>{new Date(pay.date).toLocaleDateString()}</TableCell>
                  <TableCell>{pay.contact?.name}</TableCell>
                  <TableCell className="text-right font-medium">Rp {pay.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => handlePrint(pay)}>
                        <Printer className="h-4 w-4 text-zinc-500" />
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
