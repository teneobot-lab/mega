import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { AlertCircle, Trash2 } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";

export default function FixedAssets() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [disposeOpen, setDisposeOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const [disposeDate, setDisposeDate] = useState(new Date().toISOString().split('T')[0]);
  const [disposeAmount, setDisposeAmount] = useState(0);

  // ... form states for creation ...

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [salvageValue, setSalvageValue] = useState(0);
  const [usefulLife, setUsefulLife] = useState(0);
  const [depreciationMethod, setDepreciationMethod] = useState("STRAIGHT_LINE");
  const [accountId, setAccountId] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/assets", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data aset tetap");
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
     try {
       const res = await fetch("/api/master/accounts", { headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}});
       if(res.ok) {
           const data = await res.json();
           const assetAccounts = data.filter((a: any) => a.type === 'ASSET' || a.type === 'FIXED_ASSET');
           setAccounts(assetAccounts);
           if(assetAccounts.length > 0) setAccountId(assetAccounts[0].id);
       }
     } catch(e) {}
  };

  useEffect(() => {
    fetchData();
    loadAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!accountId) return toast.error("Pilih Akun Aset Terlebih Dahulu");

    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ 
          code, name, purchaseDate, 
          purchasePrice, salvageValue, 
          usefulLife, depreciationMethod, accountId
        })
      });
      if(!res.ok) throw new Error((await res.json()).message);
      toast.success("Aset berhasil ditambahkan");
      setOpen(false);
      
      // Reset form
      setCode(""); setName(""); setPurchasePrice(0); setSalvageValue(0); setUsefulLife(0);
      
      fetchData();
    } catch(e: any) {
      toast.error(e.message || "Gagal menyimpan aset");
    }
  };

  const handleDispose = async () => {
    if(!selectedAsset) return;
    try {
      const res = await fetch(`/api/assets/${selectedAsset.id}/dispose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ 
          date: disposeDate, 
          amount: disposeAmount, 
          notes: "Disposal Aset via UI" 
        })
      });
      if(!res.ok) throw new Error((await res.json()).message);
      toast.success("Aset berhasil di-dispose");
      setDisposeOpen(false);
      fetchData();
    } catch(e: any) {
      toast.error(e.message || "Gagal disposal aset");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Aset Tetap (Fixed Assets)</h1>
           <p className="text-zinc-500">Kelola daftar aset tetap dan penyusutan perusahaan.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Tambah Aset Tetap</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Daftarkan Aset Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kode Aset</Label>
                    <Input required value={code} onChange={e => setCode(e.target.value)} placeholder="AST-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Aset</Label>
                    <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Mobil Box Operasional" />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal Beli</Label>
                    <Input type="date" required value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Harga Beli (Rp)</Label>
                    <Input type="number" required min={0} value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nilai Sisa (Salvage Value)</Label>
                    <Input type="number" required min={0} value={salvageValue} onChange={e => setSalvageValue(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Umur Ekonomis (Bulan)</Label>
                    <Input type="number" required min={1} value={usefulLife} onChange={e => setUsefulLife(Number(e.target.value))} />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Metode Penyusutan</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={depreciationMethod} onChange={e => setDepreciationMethod(e.target.value)}>
                        <option value="STRAIGHT_LINE">Garis Lurus (Straight Line)</option>
                        {/* More methods can be added later */}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Akun Aset (Neraca)</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={accountId} onChange={e => setAccountId(e.target.value)} required>
                        {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit">Simpan Aset</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Aset</TableHead>
              <TableHead>Tgl Beli</TableHead>
              <TableHead className="text-right">Harga Beli</TableHead>
              <TableHead className="text-right">Umur Ek. (Bulan)</TableHead>
              <TableHead>Penyusutan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
               <TableRow><TableCell colSpan={8} className="text-center">Belum ada aset tetap</TableCell></TableRow>
            ) : (
                data.map(d => (
                    <TableRow key={d.id} className={d.status === 'DISPOSED' ? 'bg-zinc-50 opacity-60' : ''}>
                        <TableCell className="font-medium">{d.code}</TableCell>
                        <TableCell>{d.name}</TableCell>
                        <TableCell>{new Date(d.purchaseDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">Rp {d.purchasePrice.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{d.usefulLife}</TableCell>
                        <TableCell>
                            {d.depreciationMethod === 'STRAIGHT_LINE' ? 'Garis Lurus' : d.depreciationMethod}
                        </TableCell>
                        <TableCell>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                d.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-600'
                            }`}>
                                {d.status}
                            </span>
                        </TableCell>
                        <TableCell className="text-center">
                            {d.status === 'ACTIVE' && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        setSelectedAsset(d);
                                        setDisposeOpen(true);
                                    }}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={disposeOpen} onOpenChange={setDisposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-700">
              <AlertCircle className="w-5 h-5 mr-2" /> Disposal Aset Tetap
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-red-50 border border-red-100 rounded text-xs text-red-800">
              Anda akan menghentikan penggunaan aset <strong>{selectedAsset?.name}</strong>. 
              Tindakan ini akan menghentikan penyusutan otomatis dan mencatat penghapusan aset.
            </div>
            <div className="space-y-2">
              <Label>Tanggal Disposal</Label>
              <Input type="date" value={disposeDate} onChange={e => setDisposeDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Harga Jual / Nilai Disposal (Rp)</Label>
              <Input type="number" value={disposeAmount} onChange={e => setDisposeAmount(Number(e.target.value))} placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisposeOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDispose}>Konfirmasi Disposal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
