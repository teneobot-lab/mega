import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";

export default function StockData() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // For modal actions
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const [warehouses, setWarehouses] = useState<{id: string, name: string}[]>([]);
  const [items, setItems] = useState<{id: string, name: string}[]>([]);

  // Adjustment State
  const [adjWarehouseId, setAdjWarehouseId] = useState("");
  const [adjItemId, setAdjItemId] = useState("");
  const [adjQty, setAdjQty] = useState(0);

  // Transfer State
  const [trfSourceId, setTrfSourceId] = useState("");
  const [trfTargetId, setTrfTargetId] = useState("");
  const [trfItemId, setTrfItemId] = useState("");
  const [trfQty, setTrfQty] = useState(0);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/inventory/stocks", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data stok");
    } finally {
       setLoading(false);
    }
  };

  const loadDependencies = async () => {
      try {
         const [wRes, iRes] = await Promise.all([
             fetch("/api/master/warehouses", { headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}}),
             fetch("/api/master/items", { headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}})
         ]);
         const w = await wRes.json();
         const i = await iRes.json();
         setWarehouses(w);
         setItems(i);
         if (w.length > 0) {
             setAdjWarehouseId(w[0].id);
             setTrfSourceId(w[0].id);
             setTrfTargetId(w.length > 1 ? w[1].id : w[0].id);
         }
         if (i.length > 0) {
             setAdjItemId(i[0].id);
             setTrfItemId(i[0].id);
         }
      } catch(e) {}
  };

  useEffect(() => {
    fetchData();
    loadDependencies();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
       const res = await fetch("/api/inventory/adjust", {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             "Authorization": `Bearer ${localStorage.getItem("token")}`
           },
           body: JSON.stringify({
               date: new Date().toISOString(),
               warehouseId: adjWarehouseId,
               itemId: adjItemId,
               adjustQty: adjQty,
           })
       });
       if(!res.ok) throw new Error((await res.json()).message);
       toast.success("Barang disesuaikan");
       setAdjustOpen(false);
       setAdjQty(0);
       fetchData();
     } catch(e: any) {
       toast.error(e.message || "Gagal sesuaikan stok");
     }
  }

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/inventory/transfer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
              date: new Date().toISOString(),
              sourceWarehouseId: trfSourceId,
              targetWarehouseId: trfTargetId,
              itemId: trfItemId,
              qty: trfQty,
          })
      });
      if(!res.ok) throw new Error((await res.json()).message);
      toast.success("Barang berhasil dipindahkan");
      setTransferOpen(false);
      setTrfQty(0);
      fetchData();
    } catch(e: any) {
      toast.error(e.message || "Gagal pindah stok");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Data Stok Tersedia</h1>
        <div className="space-x-2">
            <Button variant="outline" onClick={() => setAdjustOpen(true)}>Penyesuaian Stok</Button>
            <Button onClick={() => setTransferOpen(true)}>Pindah Barang</Button>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode Barang</TableHead>
              <TableHead>Nama Barang</TableHead>
              <TableHead>Gudang</TableHead>
              <TableHead className="text-right">Qty Tersedia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center">Stok kosong</TableCell></TableRow>
            ) : (
              data.map((stock) => (
                <TableRow key={`${stock.warehouseId}-${stock.itemId}`}>
                  <TableCell className="font-medium text-zinc-500">{stock.item?.name}</TableCell>
                  <TableCell className="font-bold">{stock.item?.name}</TableCell>
                  <TableCell>{stock.warehouse?.name}</TableCell>
                  <TableCell className="text-right font-bold text-lg">{stock.qty}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
          <DialogContent>
             <DialogHeader>
                 <DialogTitle>Penyesuaian Stok Baru</DialogTitle>
             </DialogHeader>
             <form onSubmit={handleAdjustSubmit} className="space-y-4">
                 <div className="space-y-2">
                     <Label>Pilih Gudang</Label>
                     <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={adjWarehouseId} onChange={(e) => setAdjWarehouseId(e.target.value)}>
                         {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                     </select>
                 </div>
                 <div className="space-y-2">
                     <Label>Pilih Barang</Label>
                     <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={adjItemId} onChange={(e) => setAdjItemId(e.target.value)}>
                         {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                     </select>
                 </div>
                 <div className="space-y-2">
                     <Label>Kuantitas (Gunakan Minus (-) jika barang hilang/rusak)</Label>
                     <Input type="number" required value={adjQty} onChange={e => setAdjQty(Number(e.target.value))} />
                 </div>
                 <div className="pt-4 flex justify-end">
                     <Button type="submit">Catat Penyesuaian</Button>
                 </div>
             </form>
          </DialogContent>
      </Dialog>

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
          <DialogContent>
             <DialogHeader>
                 <DialogTitle>Pemindahan Barang</DialogTitle>
             </DialogHeader>
             <form onSubmit={handleTransferSubmit} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                         <Label>Dari Gudang (Asal)</Label>
                         <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={trfSourceId} onChange={(e) => setTrfSourceId(e.target.value)}>
                             {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                         </select>
                     </div>
                     <div className="space-y-2">
                         <Label>Ke Gudang (Tujuan)</Label>
                         <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={trfTargetId} onChange={(e) => setTrfTargetId(e.target.value)}>
                             {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                         </select>
                     </div>
                 </div>
                 <div className="space-y-2">
                     <Label>Pilih Barang</Label>
                     <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={trfItemId} onChange={(e) => setTrfItemId(e.target.value)}>
                         {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                     </select>
                 </div>
                 <div className="space-y-2">
                     <Label>Kuantitas Pindah</Label>
                     <Input type="number" required min={1} value={trfQty} onChange={e => setTrfQty(Number(e.target.value))} />
                 </div>
                 <div className="pt-4 flex justify-end">
                     <Button type="submit">Proses Pemindahan</Button>
                 </div>
             </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}
