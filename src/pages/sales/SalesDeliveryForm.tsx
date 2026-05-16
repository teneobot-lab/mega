import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { TransactionCart, CartItem } from "../../components/transaction/TransactionCart";
import { Truck, Calendar, FileText, Warehouse, History, PackageCheck } from "lucide-react";
import { salesApi, masterApi } from "../../lib/api-services";
import { Skeleton } from "../../components/ui/skeleton";
import { ErrorMessage } from "../../components/ui/error-message";

export default function SalesDeliveryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString()?.split('T')[0],
    soId: "",
    warehouseFromId: "",
    notes: "",
    status: "DELIVERED"
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [sos, setSos] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [w, s, itm] = await Promise.all([
        masterApi.getWarehouses(),
        salesApi.getOrders(),
        masterApi.getItems()
      ]);
      
      setWarehouses(w);
      const validSos = s.filter((p: any) => p.status === "APPROVED" || p.id === formData.soId);
      setSos(validSos);
      setAvailableItems(itm);

      if (isEdit) {
        const data = await salesApi.getDelivery(id!);
        setFormData({
          date: data.date?.split('T')[0],
          soId: data.soId || "",
          warehouseFromId: data.warehouseFromId || (w.length > 0 ? w[0].id : ""),
          notes: data.notes || "",
          status: "DELIVERED"
        });
        setCartItems((data.Lines || []).map((l: any) => ({
          id: l.id,
          itemId: l.itemId,
          name: l.item?.name || 'Item',
          code: l.item?.code || '',
          uom: l.item?.baseUom?.name || 'Unit',
          qty: l.qty
        })));
      } else {
        if (w.length > 0) setFormData(prev => ({ ...prev, warehouseFromId: w[0].id }));
      }
    } catch (e: any) {
        setError(e.message || "Gagal memuat data pendukung");
        toast.error(e.message || "Gagal memuat data pendukung");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, isEdit]);

  const handleSoChange = (soId: string) => {
    setFormData({ ...formData, soId });
    const selectedSo = sos.find(s => s.id === soId);
    if (selectedSo) {
      setCartItems(selectedSo.Lines.map((l: any) => ({
        id: l.id,
        itemId: l.itemId,
        name: l.item?.name || 'Item',
        code: l.item?.code || '',
        uom: l.item?.baseUom?.name || 'Unit',
        qty: l.qty
      })));
    }
  };

  const handleSave = async () => {
    if (!formData.soId || !formData.warehouseFromId || cartItems.length === 0) {
      return toast.error("Sales Order, Gudang Asal, dan Item wajib diisi");
    }

    setIsSaving(true);
    try {
      const payload = {
          ...formData,
          lines: cartItems.map(it => ({ itemId: it.itemId, qty: it.qty }))
      };

      if (isEdit) {
        await salesApi.updateDelivery(id!, payload);
      } else {
        await salesApi.createDelivery(payload);
      }

      toast.success(`Pengiriman Barang berhasil disimpan`);
      navigate("/sales/delivery");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan ke server");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Pengiriman: #${id?.slice(-6)}` : "Buat Pengiriman Barang (DO) Baru"}
      module="Penjualan > Sales Delivery"
      status={formData.status as any}
      onSave={handleSave}
      onCancel={() => navigate("/sales/delivery")}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      {error ? (
        <div className="max-w-2xl mx-auto py-20 p-12 bg-white rounded-[3rem] shadow-xl border border-zinc-100">
          <ErrorMessage message={error} onRetry={loadData} />
        </div>
      ) : loading ? (
        <div className="max-w-6xl mx-auto p-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Skeleton className="h-32 w-full rounded-[2rem]" />
                <Skeleton className="h-32 w-full rounded-[2rem]" />
                <Skeleton className="h-48 w-full col-span-2 rounded-[2rem]" />
            </div>
            <Skeleton className="h-96 w-full rounded-[3rem]" />
        </div>
      ) : (
      <div className="max-w-6xl mx-auto p-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
            <div className="space-y-3">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Referensi Sales Order <span className="text-red-500 font-bold">*</span></Label>
                <div className="relative">
                    <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                    <select 
                        className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner appearance-none"
                        value={formData.soId}
                        onChange={e => handleSoChange(e.target.value)}
                    >
                        <option value="">Pilih Sales Order...</option>
                        {sos.map(s => <option key={s.id} value={s.id}>{s.soNumber} ({s.customer?.name})</option>)}
                    </select>
                </div>
            </div>
            
            <div className="space-y-3">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Gudang Pengeluaran <span className="text-red-500 font-bold">*</span></Label>
                <div className="relative">
                    <Warehouse className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                    <select 
                        className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner appearance-none"
                        value={formData.warehouseFromId}
                        onChange={e => setFormData({...formData, warehouseFromId: e.target.value})}
                    >
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Tgl Rencana Kirim <span className="text-red-500 font-bold">*</span></Label>
                <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                    <Input 
                        type="date"
                        className="h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner" 
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                </div>
            </div>
            
            <div className="space-y-3 col-span-full">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Catatan / Keterangan</Label>
                <div className="relative">
                    <FileText className="absolute left-6 top-6 w-5 h-5 text-indigo-300 pointer-events-none" />
                    <textarea 
                        className="w-full h-32 bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] p-8 pl-16 text-sm font-medium text-zinc-700 outline-none focus:bg-white focus:border-indigo-100 transition-all italic placeholder:text-zinc-200 shadow-inner resize-none"
                        placeholder="Contoh: Dikirim via JNE (Resi: 12345), atau armada internal cabang..."
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                </div>
            </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
            <TransactionCart 
                items={cartItems}
                availableItems={availableItems}
                onChange={setCartItems}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 bg-zinc-50 p-8 rounded-[2.5rem] border border-dashed border-zinc-200 space-y-4">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-1 italic">Shipping Instructions / Tracking Number</Label>
                <textarea 
                    className="w-full h-28 bg-white border border-zinc-200 rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-zinc-100 outline-none transition-all italic placeholder:text-zinc-300 shadow-inner resize-none"
                    placeholder="Catatan detail pengemasan jika ada..."
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                />
            </div>

            <div className="lg:col-span-4 flex flex-col items-end justify-center bg-[#1e3a5f] p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                <h4 className="text-xl font-black italic tracking-tighter uppercase mb-2">Inventory Sync</h4>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest leading-relaxed text-right opacity-60">Barang akan langsung memotong saldo stok secara real-time pada gudang pengiriman saat dokumen disimpan.</p>
                <div className="mt-6 flex items-center gap-2">
                    <History className="w-4 h-4 text-orange-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Linked Transaction</span>
                </div>
            </div>
        </div>
      </div>
      )}
    </FullscreenFormLayout>
  );
}

