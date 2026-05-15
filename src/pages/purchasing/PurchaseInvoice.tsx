import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Plus, Trash, Printer } from "lucide-react";
import { PrintInvoice } from "../../components/PrintInvoice";

type Invoice = {
  id: string;
  invNumber: string;
  date: string;
  dueDate: string;
  contact: { name: string, address?: string };
  status: string;
  balance: number;
  subTotal: number;
  total: number;
  notes?: string;
  Lines?: any[];
};

export default function PurchaseInvoice() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [printData, setPrintData] = useState<Invoice | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Data Master untuk Form
  const [suppliers, setSuppliers] = useState<{id: string, name: string}[]>([]);
  const [items, setItems] = useState<{id: string, name: string, buyPrice: number}[]>([]);
  const [pos, setPos] = useState<any[]>([]);

  // State Form Baru
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]);
  const [supplierId, setSupplierId] = useState("");
  const [poId, setPoId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<{itemId: string, qty: number, price: number}[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/purchasing/invoices", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data Faktur");
    } finally {
      setLoading(false);
    }
  };

  const loadMasters = async () => {
    try {
      const [supRes, itmRes, poRes] = await Promise.all([
        fetch("/api/master/contacts?type=SUPPLIER", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}),
        fetch("/api/master/items", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}),
        fetch("/api/purchasing/orders", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }})
      ]);
      const [sup, itm, pd] = await Promise.all([supRes.json(), itmRes.json(), poRes.json()]);
      setSuppliers(sup);
      setItems(itm);
      // Hanya ambil PO yg APPROVED
      setPos(pd.filter((p: any) => p.status === "APPROVED"));
      if(sup.length > 0) setSupplierId(sup[0].id);
    } catch (e) {}
  };

  useEffect(() => {
    fetchData();
    loadMasters();
  }, []);

  const handleSelectPO = (id: string) => {
    setPoId(id);
    if (!id) return;
    const selectedPo = pos.find(p => p.id === id);
    if (selectedPo) {
      setSupplierId(selectedPo.supplierId);
      // Auto fill lines
      setLines(selectedPo.Lines.map((l: any) => ({
        itemId: l.itemId,
        qty: l.qty,
        price: l.price
      })));
    }
  };

  const handleAddLine = () => {
    if(items.length === 0) return toast.error("Tidak ada data barang!");
    setLines([...lines, { itemId: items[0].id, qty: 1, price: items[0].buyPrice }]);
  };

  const handleRemoveLine = (index: number) => {
    const newLines = [...lines];
    newLines.splice(index, 1);
    setLines(newLines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(lines.length === 0) return toast.error("Faktur harus memiliki minimal 1 barang");
    try {
      const res = await fetch("/api/purchasing/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          date: invDate,
          dueDate: dueDate,
          supplierId,
          poId,
          contactId: supplierId,
          notes,
          lines
        })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Faktur berhasil dibuat");
      setOpen(false);
      setLines([]);
      setPoId("");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Gagal membuat Faktur");
    }
  };

  const handlePrint = (inv: Invoice) => {
    setPrintData(inv);
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Printable Area */}
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        <PrintInvoice data={printData} />
      </div>

      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold tracking-tight">Faktur Pembelian (Purchase Invoice)</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Buat Faktur Baru</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Buat Faktur Pembelian</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label>Tarik dari PO (Opsional)</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={poId} onChange={e => handleSelectPO(e.target.value)}
                  >
                    <option value="">Pilih PO...</option>
                    {pos.map(p => <option key={p.id} value={p.id}>{p.poNumber}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={supplierId} 
                    onChange={e => setSupplierId(e.target.value)}
                    disabled={!!poId}
                  >
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Faktur</Label>
                  <Input type="date" required value={invDate} onChange={e => setInvDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Jatuh Tempo</Label>
                  <Input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>
              
              <div className="border bg-zinc-50 rounded-lg p-4 space-y-4 mt-4">
                <div className="flex items-center justify-between">
                   <h3 className="font-semibold text-sm">Rincian Barang</h3>
                   {!poId && <Button type="button" variant="outline" size="sm" onClick={handleAddLine}><Plus className="h-4 w-4 mr-2"/> Tambah</Button>}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Barang</TableHead>
                      <TableHead className="w-24">QTY</TableHead>
                      <TableHead className="w-48">Harga Unit</TableHead>
                      <TableHead className="w-48 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((reqLine, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <select 
                            className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm disabled:opacity-50"
                            value={reqLine.itemId}
                            disabled={!!poId}
                            onChange={(e) => {
                              const newLines = [...lines];
                              newLines[idx].itemId = e.target.value;
                              setLines(newLines);
                            }}
                          >
                            {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input type="number" min={1} value={reqLine.qty} disabled={!!poId} 
                            onChange={(e) => {
                              const newLines = [...lines];
                              newLines[idx].qty = Number(e.target.value);
                              setLines(newLines);
                            }} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" min={0} value={reqLine.price} disabled={!!poId}
                             onChange={(e) => {
                              const newLines = [...lines];
                              newLines[idx].price = Number(e.target.value);
                              setLines(newLines);
                            }} />
                        </TableCell>
                        <TableCell className="text-right">
                          Rp {(reqLine.qty * reqLine.price).toLocaleString()}
                        </TableCell>
                        {!poId && (
                           <TableCell>
                             <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveLine(idx)}>
                               <Trash className="h-4 w-4" />
                             </Button>
                           </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="flex justify-end text-lg font-bold">
                   TOTAL: Rp {lines.reduce((acc, l) => acc + (l.qty * l.price), 0).toLocaleString()}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit">Simpan & Jurnal Otomatis</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Nomor Faktur</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jatuh Tempo</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Sisa Tagihan</TableHead>
              <TableHead className="text-center w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center">Belum ada data Faktur</TableCell></TableRow>
            ) : (
              data.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${inv.status === 'UNPAID' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {inv.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-blue-600 cursor-pointer">{inv.invNumber}</TableCell>
                  <TableCell>{new Date(inv.date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{inv.contact?.name}</TableCell>
                  <TableCell className="text-right font-medium">Rp {inv.balance.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handlePrint(inv)}
                      title="Cetak Faktur"
                    >
                      <Printer className="h-4 w-4 text-zinc-500 hover:text-red-700" />
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
