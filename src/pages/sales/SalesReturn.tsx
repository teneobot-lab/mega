import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Search, Plus, Trash } from "lucide-react";

export default function SalesReturn() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [contactId, setContactId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<any[]>([{ itemId: "", qty: 0, price: 0 }]);

  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/sales/returns", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data retur penjualan");
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [wRes, cusRes, itemRes] = await Promise.all([
         fetch("/api/master/warehouses", { headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}}),
         fetch("/api/master/contacts", { headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}}),
         fetch("/api/master/items", { headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}})
      ]);
      const wData = await wRes.json();
      const sData = await cusRes.json();
      const iData = await itemRes.json();
      
      setWarehouses(wData);
      setCustomers(sData.filter((c: any) => c.type === 'CUSTOMER'));
      setItems(iData);
      if(wData.length > 0) setWarehouseId(wData[0].id);
    } catch(e) {}
  };

  useEffect(() => {
    fetchData();
    loadDependencies();
  }, []);

  const handleAddLine = () => {
     setLines([...lines, { itemId: "", qty: 0, price: 0 }]);
  };

  const handleRemoveLine = (idx: number) => {
     const newLines = [...lines];
     newLines.splice(idx, 1);
     setLines(newLines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!contactId) return toast.error("Pilih Customer terlebih dahulu");
    if(!warehouseId) return toast.error("Pilih gudang tujuan");
    if(lines.some(l => !l.itemId || l.qty <= 0 || l.price <= 0)) return toast.error("Pastikan semua baris item valid");

    try {
      const res = await fetch("/api/sales/returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ date, contactId, warehouseId, notes, lines })
      });
      if(!res.ok) throw new Error((await res.json()).message);
      toast.success("Retur penjualan berhasil dicatat");
      setOpen(false);
      setContactId("");
      setNotes("");
      setLines([{ itemId: "", qty: 0, price: 0 }]);
      fetchData();
    } catch(e: any) {
      toast.error(e.message || "Gagal mencatat retur");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Retur Penjualan (Sales Return)</h1>
            <p className="text-zinc-500">Menerima barang kembali dari Customer dan memberikan potongan piutang.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Input Retur Baru</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Buat Retur Penjualan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Pilih Customer</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={contactId} onChange={e => setContactId(e.target.value)} required>
                        <option value="">-- Pilih Customer --</option>
                        {customers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <Label>Masuk Ke Gudang</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={warehouseId} onChange={e => setWarehouseId(e.target.value)} required>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Tanggal Retur</Label>
                    <Input type="date" required value={date} onChange={e => setDate(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                    <Label>Catatan / Alasan Retur</Label>
                    <Input value={notes} onChange={e => setNotes(e.target.value)} />
                 </div>
              </div>

              <div className="border rounded-lg p-4 bg-zinc-50">
                  <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold">Item yang Diretur</h4>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddLine}><Plus className="h-4 w-4 mr-2"/> Tambah Item</Button>
                  </div>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Pilih Barang</TableHead>
                              <TableHead className="w-32 text-right">Qty</TableHead>
                              <TableHead className="w-48 text-right">Harga Retur</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                              <TableHead></TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {lines.map((l, idx) => (
                              <TableRow key={idx}>
                                  <TableCell>
                                      <select className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm" value={l.itemId} onChange={e => {
                                          const newLines = [...lines];
                                          newLines[idx].itemId = e.target.value;
                                          const itm = items.find(i => i.id === e.target.value);
                                          if (itm) newLines[idx].price = itm.sellingPrice;
                                          setLines(newLines);
                                      }} required>
                                          <option value="">Pilih...</option>
                                          {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                      </select>
                                  </TableCell>
                                  <TableCell>
                                      <Input type="number" min={1} value={l.qty} onChange={(e) => {
                                          const newLines = [...lines];
                                          newLines[idx].qty = Number(e.target.value);
                                          setLines(newLines);
                                      }} required />
                                  </TableCell>
                                  <TableCell>
                                      <Input type="number" min={1} value={l.price} onChange={(e) => {
                                          const newLines = [...lines];
                                          newLines[idx].price = Number(e.target.value);
                                          setLines(newLines);
                                      }} required />
                                  </TableCell>
                                  <TableCell className="text-right font-semibold">
                                      Rp {(l.qty * l.price).toLocaleString()}
                                  </TableCell>
                                  <TableCell>
                                      {lines.length > 1 && (
                                         <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveLine(idx)}><Trash className="h-4 w-4" /></Button>
                                      )}
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
                  <div className="flex justify-end pt-4 font-bold text-lg">
                      Total Retur: Rp {lines.reduce((s, l) => s + (l.qty * l.price), 0).toLocaleString()}
                  </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit">Catat Retur Penjualan</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode Retur</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total Item</TableHead>
              <TableHead className="text-right">Total Nilai</TableHead>
              <TableHead>Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
               <TableRow><TableCell colSpan={6} className="text-center">Belum ada retur penjualan</TableCell></TableRow>
            ) : (
                data.map(d => (
                    <TableRow key={d.id}>
                        <TableCell className="font-medium text-blue-600">{d.invNumber}</TableCell>
                        <TableCell>{new Date(d.date).toLocaleDateString()}</TableCell>
                        <TableCell>{d.contact?.name}</TableCell>
                        <TableCell>{d.Lines.length} baris</TableCell>
                        <TableCell className="text-right font-bold">Rp {d.total.toLocaleString()}</TableCell>
                        <TableCell>{d.notes || '-'}</TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
