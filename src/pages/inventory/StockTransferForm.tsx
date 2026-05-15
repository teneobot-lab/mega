import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { useFullscreenForm } from "../../hooks/use-fullscreen-form";
import { TransactionCart, CartItem } from "../../components/transaction/TransactionCart";

export default function StockTransferForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const { isSaving, isAutoSaving, setIsSaving, isDirty, setIsDirty, handleCancel } = useFullscreenForm({
    onAutoSave: async () => {
      console.log("Auto-saving transfer draft...");
    }
  });
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sourceWarehouseId: "",
    targetWarehouseId: "",
    notes: "",
    status: "DRAFT"
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
        // Mock data fetch for now
        setWarehouses([{ id: '1', name: 'Gudang Utama' }, { id: '2', name: 'Gudang Cabang' }]);
        setAvailableItems([{ id: '1', name: 'Item A', code: 'A' }]);
        if (warehouses.length > 0) {
            setFormData(prev => ({ 
                ...prev, 
                sourceWarehouseId: warehouses[0].id,
                targetWarehouseId: warehouses.length > 1 ? warehouses[1].id : warehouses[0].id
            }));
        }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    if (!formData.sourceWarehouseId || !formData.targetWarehouseId) return toast.error("Gudang asal dan tujuan wajib dipilih");
    if (formData.sourceWarehouseId === formData.targetWarehouseId) return toast.error("Gudang asal dan tujuan tidak boleh sama");
    if (cartItems.length === 0) return toast.error("Belum ada barang yang dipindah");

    setIsSaving(true);
    try {
        toast.success(`Pemindahan barang berhasil diproses`);
        setIsDirty(false);
        navigate("/inventory/stocks");
    } catch (e: any) {
        toast.error(e.message || "Gagal menyimpan ke server");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Transfer #${id}` : "Pemindahan Barang (Inter-Warehouse) Baru"}
      module="Inventory > Stock Transfer"
      status={formData.status as any}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
      isAutoSaving={isAutoSaving}
      isEdit={isEdit}
    >
      <div className="p-2 space-y-2">
        <div className="ac-form-header grid grid-cols-4 gap-4">
            <div className="ac-field-group">
                <Label className="ac-label">Gudang Asal <span className="text-red-500">*</span></Label>
                <select 
                    className="ac-input"
                    value={formData.sourceWarehouseId}
                    onChange={e => { setFormData({...formData, sourceWarehouseId: e.target.value}); setIsDirty(true); }}
                >
                    <option value="">Pilih Gudang Asal...</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
            </div>

            <div className="ac-field-group">
                <Label className="ac-label">Gudang Tujuan <span className="text-red-500">*</span></Label>
                <select 
                    className="ac-input"
                    value={formData.targetWarehouseId}
                    onChange={e => { setFormData({...formData, targetWarehouseId: e.target.value}); setIsDirty(true); }}
                >
                    <option value="">Pilih Gudang Tujuan...</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
            </div>

            <div className="ac-field-group">
                <Label className="ac-label">Tanggal</Label>
                <Input 
                    type="date"
                    className="ac-input" 
                    value={formData.date}
                    onChange={e => { setFormData({...formData, date: e.target.value}); setIsDirty(true); }}
                />
            </div>

            <div className="ac-field-group">
                <Label className="ac-label">Catatan</Label>
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


