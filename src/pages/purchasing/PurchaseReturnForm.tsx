import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { TransactionCart, CartItem } from "../../components/transaction/TransactionCart";
import { RotateCcw, Box, Calendar, History, Trash2, Warehouse, UserCircle, MessageSquare } from "lucide-react";
import { purchasingApi, masterApi } from "../../lib/api-services";

export default function PurchaseReturnForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString()?.split('T')[0],
    contactId: "",
    warehouseId: "",
    notes: "",
    status: "RETURNED"
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [w, s, itm] = await Promise.all([
          masterApi.getWarehouses(),
          masterApi.getContacts("SUPPLIER"),
          masterApi.getItems()
        ]);
        
        setWarehouses(w);
        setSuppliers(s);
        setAvailableItems(itm);

        if (isEdit) {
          const data = await purchasingApi.getReturn(id!);
          setFormData({
            date: data.date?.split('T')[0],
            contactId: data.contactId,
            warehouseId: data.warehouseId || (w.length > 0 ? w[0].id : ""),
            notes: data.notes || "",
            status: "RETURNED"
          });
          setCartItems((data.Lines || []).map((l: any) => ({
            id: l.id,
            itemId: l.itemId,
            name: l.item?.name || 'Item',
            code: l.item?.code || '',
            uom: l.item?.baseUom?.name || 'Unit',
            qty: l.qty,
            price: l.price,
            total: l.qty * l.price
          })));
        } else {
          if (s.length > 0) setFormData(prev => ({ ...prev, contactId: s[0].id }));
          if (w.length > 0) setFormData(prev => ({ ...prev, warehouseId: w[0].id }));
        }
      } catch (e: any) {
          toast.error(e.message || "Gagal memuat data pendukung");
      }
    };
    loadData();
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!formData.contactId || !formData.warehouseId || cartItems.length === 0) {
      return toast.error("Supplier, Gudang, dan Item wajib diisi");
    }

    setIsSaving(true);
    try {
      const payload = {
          ...formData,
          lines: cartItems.map(it => ({
              itemId: it.itemId,
              qty: it.qty,
              price: it.price
          }))
      };

      if (isEdit) {
        await purchasingApi.updateReturn(id!, payload);
      } else {
        await purchasingApi.createReturn(payload);
      }

      toast.success(`Retur Pembelian berhasil disimpan`);
      navigate("/purchasing/return");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan ke server");
    } finally {
      setIsSaving(false);
    }
  };

  const totalAmount = cartItems.reduce((acc, curr) => acc + (curr.total || 0), 0);

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Retur #${id}` : "Retur Pembelian Baru"}
      module="Pembelian > Purchase Return"
      status={formData.status as any}
      onSave={handleSave}
      onCancel={() => navigate("/purchasing/return")}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      <div className="max-w-6xl mx-auto space-y-8 pb-32">
        <div className="ac-form-header grid grid-cols-4 gap-4">
            <div className="ac-field-group">
                <Label className="ac-label">Supplier Tujuan Retur <span className="text-red-500">*</span></Label>
                <select 
                    className="ac-input"
                    value={formData.contactId}
                    onChange={e => { setFormData({...formData, contactId: e.target.value}); }}
                >
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            <div className="ac-field-group">
                <Label className="ac-label">Gudang Keluar</Label>
                <select 
                    className="ac-input"
                    value={formData.warehouseId}
                    onChange={e => { setFormData({...formData, warehouseId: e.target.value}); }}
                >
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
            </div>

            <div className="ac-field-group">
                <Label className="ac-label">Tanggal Retur</Label>
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

        {/* Goods List */}
        <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600 rounded-lg shadow-lg">
                        <RotateCcw className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-red-700">Returned Goods Registry</h3>
                </div>
            </div>
            <TransactionCart 
                items={cartItems}
                availableItems={availableItems}
                showPrice={true}
                onChange={(items) => {
                    setCartItems(items);
                }}
            />
        </div>

        {/* Footer info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
                <div className="bg-red-50/50 p-8 rounded-[2rem] border-2 border-red-100/50 space-y-3">
                    <Label className="text-[10px] font-black text-red-400 uppercase tracking-widest pl-1 italic flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" /> Alasan Pengembalian (Reason of Return)
                    </Label>
                    <textarea 
                        className="w-full h-28 bg-white border border-red-100 rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-red-50 outline-none transition-all italic placeholder:text-zinc-300"
                        placeholder="Contoh: Barang rusak saat diterima, tidak sesuai spesifikasi pesanan, atau kelebihan kiriman..."
                        value={formData.notes}
                        onChange={e => { setFormData({...formData, notes: e.target.value}); }}
                    />
                </div>
            </div>

            <div className="lg:col-span-4 bg-[#1e3a5f] p-10 rounded-[2.5rem] text-white flex flex-col justify-center items-end gap-2 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Credit Amount Total</span>
                <span className="text-4xl lg:text-5xl font-black italic tracking-tighter tabular-nums text-red-400">
                    Rp {totalAmount.toLocaleString()}
                </span>
                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 text-center w-full">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase leading-relaxed tracking-wider">Nilai retur akan memotong tagihan Pembelian pada supplier terkait.</p>
                </div>
            </div>
        </div>
      </div>
    </FullscreenFormLayout>
  );
}

