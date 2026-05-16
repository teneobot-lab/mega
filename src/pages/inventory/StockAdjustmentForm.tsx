import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { TransactionCart, CartItem } from "../../components/transaction/TransactionCart";
import { inventoryApi, masterApi } from "../../lib/api-services";

export default function StockAdjustmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString()?.split('T')[0],
    warehouseId: "",
    notes: "",
    status: "DRAFT"
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
        try {
            const [ws, its] = await Promise.all([
                masterApi.getWarehouses(),
                masterApi.getItems()
            ]);
            setWarehouses(ws);
            setAvailableItems(its);
            if (ws.length > 0) setFormData(prev => ({ ...prev, warehouseId: ws[0].id }));
        } catch (e) {
            toast.error("Gagal mengambil data referensi");
        }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    if (!formData.warehouseId) return toast.error("Gudang wajib dipilih");
    if (cartItems.length === 0) return toast.error("Belum ada barang yang disesuaikan");

    setIsSaving(true);
    try {
        await inventoryApi.createAdjustment({
            ...formData,
            items: cartItems.map(it => ({
                itemId: it.itemId,
                qty: it.qty,
                notes: ""
            }))
        });
        toast.success(`Penyesuaian stok berhasil disimpan`);
        navigate("/inventory/stocks");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan ke server");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Adjustment #${id}` : "Penyesuaian Stok (Opname) Baru"}
      module="Inventory > Stock Adjustment"
      status={formData.status as any}
      onSave={handleSave}
      onCancel={() => navigate("/inventory/stocks")}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      <div className="p-2 space-y-2">
        <div className="ac-form-header grid grid-cols-4 gap-4">
            <div className="ac-field-group">
                <Label className="ac-label">Site / Lokasi Gudang <span className="text-red-500">*</span></Label>
                <select 
                    className="ac-input"
                    value={formData.warehouseId}
                    onChange={e => { setFormData({...formData, warehouseId: e.target.value}); }}
                >
                    <option value="">Pilih Gudang...</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
            </div>

            <div className="ac-field-group">
                <Label className="ac-label">Tanggal</Label>
                <Input 
                    type="date"
                    className="ac-input" 
                    value={formData.date}
                    onChange={e => { setFormData({...formData, date: e.target.value}); }}
                />
            </div>

            <div className="ac-field-group col-span-2">
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
    </FullscreenFormLayout>
  );
}


