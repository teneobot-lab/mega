import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { TransactionCart, CartItem } from "../../components/transaction/TransactionCart";
import { Truck, Box, Calendar, FileText, Warehouse, History, Search, ArrowRight, PackageCheck } from "lucide-react";
import { salesApi, masterApi } from "../../lib/api-services";

export default function SalesDeliveryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const [isSaving, setIsSaving] = useState(false);
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

  useEffect(() => {
    const loadData = async () => {
      try {
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
          toast.error(e.message || "Gagal memuat data pendukung");
      }
    };
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

  const selectedSo = sos.find(p => p.id === formData.soId);

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Pengiriman #${id}` : "Pengiriman Barang (DO) Baru"}
      module="Penjualan > Sales Delivery"
      status={formData.status as any}
      onSave={handleSave}
      onCancel={() => navigate("/sales/delivery")}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      <div className="p-2 space-y-2">
        <div className="ac-form-header grid grid-cols-4 gap-4">
            <div className="ac-field-group">
                <Label className="ac-label">Referensi Sales Order <span className="text-red-500">*</span></Label>
                <select 
                    className="ac-input"
                    value={formData.soId}
                    onChange={e => handleSoChange(e.target.value)}
                >
                    <option value="">-- Pilih Sales Order --</option>
                    {sos.map(s => <option key={s.id} value={s.id}>{s.soNumber} ({s.customer?.name})</option>)}
                </select>
            </div>
            
            <div className="ac-field-group">
                <Label className="ac-label">Gudang Pengeluaran</Label>
                <select 
                    className="ac-input"
                    value={formData.warehouseFromId}
                    onChange={e => { setFormData({...formData, warehouseFromId: e.target.value}); }}
                >
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
            </div>

            <div className="ac-field-group">
                <Label className="ac-label">Tgl Rencana Kirim</Label>
                <Input 
                    type="date"
                    className="ac-input" 
                    value={formData.date}
                    onChange={e => { setFormData({...formData, date: e.target.value}); }}
                />
            </div>

            <div className="ac-field-group">
                <Label className="ac-label">Catatan</Label>
                <Input 
                    className="ac-input"
                    placeholder="Catatan..."
                    value={formData.notes}
                    onChange={e => { setFormData({...formData, notes: e.target.value}); }}
                />
            </div>
        </div>

        <div className="ac-table-container">
            <TransactionCart 
                items={cartItems}
                availableItems={availableItems}
                onChange={(items) => {
                    setCartItems(items);
                }}
            />
        </div>
      </div>

        {/* Footer / Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 bg-zinc-50 p-8 rounded-[2.5rem] border border-dashed border-zinc-200 space-y-4">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-1 italic">Shipping Instructions / Tracking Number</Label>
                <textarea 
                    className="w-full h-28 bg-white border border-zinc-200 rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-zinc-100 outline-none transition-all italic placeholder:text-zinc-300"
                    placeholder="Contoh: Dikirim via JNE (Resi: 12345), atau armada internal cabang. Berikan catatan detail pengemasan jika ada..."
                    value={formData.notes}
                    onChange={e => { setFormData({...formData, notes: e.target.value}); }}
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
    </FullscreenFormLayout>
  );
}

