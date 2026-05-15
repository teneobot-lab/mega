import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";

export default function SalesDelivery() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [soId, setSoId] = useState("");
  const [warehouseFromId, setWarehouseFromId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<any[]>([]);

  const [sos, setSos] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/transactions/delivery", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data pengiriman");
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [wRes, soRes] = await Promise.all([
         fetch("/api/master/warehouses", { headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}}),
         fetch("/api/sales/orders", { headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}})
      ]);
      const wData = await wRes.json();
      const sData = await soRes.json();
      setWarehouses(wData);
      
      const validSos = sData.filter((p: any) => p.status === "APPROVED");
      setSos(validSos);
      if(wData.length > 0) setWarehouseFromId(wData[0].id);
    } catch(e) {}
  };

  useEffect(() => {
    fetchData();
    loadDependencies();
  }, []);

  const handleSoChange = (id: string) => {
     setSoId(id);
     const so = sos.find(p => p.id === id);
     if(so) {
        setLines(so.Lines.map((l: any) => ({ itemId: l.itemId, name: l.item?.name || l.itemId, qty: l.qty })));
     } else {
        setLines([]);
     }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!soId) return toast.error("Pilih SO terlebih dahulu");
    if(!warehouseFromId) return toast.error("Pilih gudang asal");

    try {
      const res = await fetch("/api/transactions/delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ date, soId, warehouseFromId, notes, lines })
      });
      if(!res.ok) throw new Error((await res.json()).message);
      toast.success("Pengiriman barang berhasil dicatat");
      setOpen(false);
      setSoId("");
      setNotes("");
      setLines([]);
      fetchData();
      loadDependencies();
    } catch(e: any) {
      toast.error(e.message || "Gagal mencatat pengiriman");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Pengiriman Barang (Delivery Order)</h1>
            <p className="text-zinc-500">Mengirim barang fisik keluar gudang untuk pesanan SO</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Buat Pengiriman</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Kirim Barang dari Gudang</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Pilih SO (Approved)</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={soId} onChange={e => handleSoChange(e.target.value)} required>
                        <option value="">-- Pilih SO --</option>
                        {sos.map(p => <option key={p.id} value={p.id}>{p.soNumber} ({p.customer.name})</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <Label>Kirim Dari Gudang</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={warehouseFromId} onChange={e => setWarehouseFromId(e.target.value)} required>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Tanggal Kirim</Label>
                    <Input type="date" required value={date} onChange={e => setDate(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                    <Label>Keterangan / Resi</Label>
                    <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Misal: Dikirim via JNE (Resi: 123)" />
                 </div>
              </div>

              {lines.length > 0 && (
                <div className="border rounded-lg p-4 bg-zinc-50">
                    <h4 className="font-bold mb-2">Item Dikirim</h4>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode Item ID</TableHead>
                                <TableHead className="w-32 text-right">Qty Kirim</TableHead>
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
                <Button type="submit">Catat Stok Keluar</Button>
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
              <TableHead>Referensi SO</TableHead>
              <TableHead>Gudang Asal</TableHead>
              <TableHead>Total Item</TableHead>
              <TableHead>Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
               <TableRow><TableCell colSpan={6} className="text-center">Belum ada pengiriman barang</TableCell></TableRow>
            ) : (
                data.map(d => (
                    <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.transNumber}</TableCell>
                        <TableCell>{new Date(d.date).toLocaleDateString()}</TableCell>
                        <TableCell>{d.reference}</TableCell>
                        <TableCell>{d.warehouseFrom?.name}</TableCell>
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
