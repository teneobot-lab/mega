import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { useFullscreenForm } from "../../hooks/use-fullscreen-form";
import { TransactionCart, CartItem } from "../../components/transaction/TransactionCart";
import { apiFetch } from "../../lib/api";
import { ShoppingBag, Calendar, Users, FileText, BadgeInfo } from "lucide-react";

export default function PurchaseOrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const { isSaving, setIsSaving, isDirty, setIsDirty, handleCancel } = useFullscreenForm();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString()?.split('T')[0],
    supplierId: "",
    notes: "",
    status: "DRAFT"
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  useEffect(() => {
    // Load dependencies
    const loadData = async () => {
      try {
        const [sups, itms] = await Promise.all([
          apiFetch("/api/master/contacts?type=SUPPLIER"),
          apiFetch("/api/master/items")
        ]);
        setSuppliers(sups);
        setAvailableItems(itms);

        if (isEdit) {
          const data = await apiFetch(`/api/purchasing/orders/${id}`);
          setFormData({
            date: data.date?.split('T')[0],
            supplierId: data.supplierId,
            notes: data.notes || "",
            status: data.status
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
           if(sups.length > 0) setFormData(prev => ({...prev, supplierId: sups[0].id}));
        }
      } catch (e: any) {
        toast.error(e.message || "Gagal memuat data");
      }
    };
    loadData();
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!formData.supplierId) return toast.error("Supplier wajib diisi");
    if (cartItems.length === 0) return toast.error("Minimal 1 barang pesanan");

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

      await apiFetch("/api/purchasing/orders" + (isEdit ? `/${id}` : ""), {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });

      toast.success(`Pesanan Pembelian berhasil disimpan`);
      setIsDirty(false);
      navigate("/purchasing/po");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan ke server");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Pesanan #${id}` : "Pesanan Pembelian Baru"}
      module="Pembelian > Purchase Order"
      status={formData.status as any}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      <div className="p-2 space-y-2">
        <div className="ac-form-header grid grid-cols-4 gap-4">
            <div className="ac-field-group">
                <Label className="ac-label">Supplier <span className="text-red-500">*</span></Label>
                <select 
                    className="ac-input"
                    value={formData.supplierId}
                    onChange={e => { setFormData({...formData, supplierId: e.target.value}); setIsDirty(true); }}
                >
                    <option value="">Pilih Supplier...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} - {s.category || 'Vendor'}</option>)}
                </select>
            </div>

            <div className="ac-field-group">
                <Label className="ac-label">Tanggal Transaksi</Label>
                <Input 
                  type="date"
                  className="ac-input" 
                  value={formData.date}
                  onChange={e => { setFormData({...formData, date: e.target.value}); setIsDirty(true); }}
                />
            </div>

            <div className="ac-field-group col-span-2">
                <Label className="ac-label">Keterangan</Label>
                <Input 
                  className="ac-input"
                  placeholder="Catatan..."
                  value={formData.notes}
                  onChange={e => { setFormData({...formData, notes: e.target.value}); setIsDirty(true); }}
                />
            </div>
        </div>

        <div className="ac-table-container">
            <TransactionCart 
                items={cartItems}
                availableItems={availableItems}
                showPrice={true}
                onChange={(items) => {
                    setCartItems(items);
                    setIsDirty(true);
                }}
            />
        </div>
      </div>
    </FullscreenFormLayout>
  );
}

