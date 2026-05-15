import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";

export default function PurchaseReceipt() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [poId, setPoId] = useState("");
  const [warehouseToId, setWarehouseToId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<any[]>([]);

  const [pos, setPos] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/transactions/receipt", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data penerimaan");
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [wRes, poRes] = await Promise.all([
         fetch("/api/master/warehouses", { headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}}),
         fetch("/api/purchasing/orders", { headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}})
      ]);
      const wData = await wRes.json();
      const pData = await poRes.json();
      setWarehouses(wData);
      // Filter ONLY APPROVED POs that haven't been received fully
      const validPos = pData.filter((p: any) => p.status === "APPROVED");
      setPos(validPos);
      if(wData.length > 0) setWarehouseToId(wData[0].id);
    } catch(e) {}
  };

  useEffect(() => {
    fetchData();
    loadDependencies();
  }, []);

  const handlePoChange = (id: string) => {
     setPoId(id);
     const po = pos.find(p => p.id === id);
     if(po) {
        setLines(po.Lines.map((l: any) => ({ itemId: l.itemId, name: l.item?.name || l.itemId, qty: l.qty })));
     } else {
        setLines([]);
     }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!poId) return toast.error("Pilih PO terlebih dahulu");
    if(!warehouseToId) return toast.error("Pilih gudang tujuan");

    try {
      const res = await fetch("/api/transactions/receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ date, poId, warehouseToId, notes, lines })
      });
      if(!res.ok) throw new Error((await res.json()).message);
      toast.success("Penerimaan barang berhasil dicatat");
      setOpen(false);
      setPoId("");
      setNotes("");
      setLines([]);
      fetchData();
      loadDependencies(); // Refresh PO list
    } catch(e: any) {
      toast.error(e.message || "Gagal mencatat penerimaan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Penerimaan Barang (Good Receipt)</h1>
            <p className="text-zinc-500">Menerima barang fisik masuk gudang dari PO</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Input Penerimaan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Terima Barang ke Gudang</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Pilih PO (Approved)</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={poId} onChange={e => handlePoChange(e.target.value)} required>
                        <option value="">-- Pilih PO --</option>
                        {pos.map(p => <option key={p.id} value={p.id}>{p.poNumber} ({p.supplier.name})</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <Label>Gudang Penerima</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={warehouseToId} onChange={e => setWarehouseToId(e.target.value)} required>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Tanggal Masuk</Label>
                    <Input type="date" required value={date} onChange={e => setDate(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                    <Label>Keterangan / No Surat Jalan</Label>
                    <Input value={notes} onChange={e => setNotes(e.target.value)} />
                 </div>
              </div>

              {lines.length > 0 && (
                <div className="border rounded-lg p-4 bg-zinc-50">
                    <h4 className="font-bold mb-2">Item Diterima</h4>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode Item ID (Sementara)</TableHead>
                                <TableHead className="w-32 text-right">Qty Masuk</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lines.map((l, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{l.name}</TableCell>
                                    <TableCell>
                                        <Input type="number" min={1} value={l.qty} onChange={(e) => {
                                            const newLines = [...lines];
                                            newLines[idx].qty = Number(e.target.value);
                                            setLines(newLines);
                                        }} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit">Catat Stok Masuk</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Dokumen</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Referensi PO</TableHead>
              <TableHead>Gudang Masuk</TableHead>
              <TableHead>Total Item</TableHead>
              <TableHead>Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
               <TableRow><TableCell colSpan={6} className="text-center">Belum ada penerimaan barang</TableCell></TableRow>
            ) : (
                data.map(d => (
                    <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.transNumber}</TableCell>
                        <TableCell>{new Date(d.date).toLocaleDateString()}</TableCell>
                        <TableCell>{d.reference}</TableCell>
                        <TableCell>{d.warehouseTo?.name}</TableCell>
                        <TableCell>{d.Lines.length} baris</TableCell>
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
