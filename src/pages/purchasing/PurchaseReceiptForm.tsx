import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { useFullscreenForm } from "../../hooks/use-fullscreen-form";
import { TransactionCart, CartItem } from "../../components/transaction/TransactionCart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { PackageOpen, Box, Calendar, History, Warehouse, FileCheck, Truck, ArrowRight } from "lucide-react";

export default function PurchaseReceiptForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const { isSaving, isAutoSaving, setIsSaving, isDirty, setIsDirty, handleCancel } = useFullscreenForm({
    onAutoSave: async () => {
      console.log("Auto-saving receipt draft...");
    }
  });
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    poId: "",
    warehouseToId: "",
    notes: "",
    status: "RECEIVED"
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [wRes, poRes, itmRes] = await Promise.all([
          fetch("/api/master/warehouses", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}),
          fetch("/api/purchasing/orders", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}),
          fetch("/api/master/items", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }})
        ]);
        const w = await wRes.json();
        const p = await poRes.json();
        const itm = await itmRes.json();
        
        setWarehouses(w);
        setPos(p.filter((po: any) => po.status === "APPROVED" || po.status === "PARTIAL"));
        setAvailableItems(itm);

        if (isEdit) {
          const res = await fetch(`/api/transactions/receipt/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          const data = await res.json();
          setFormData({
            date: data.date.split('T')[0],
            poId: data.poId || "",
            warehouseToId: data.warehouseToId,
            notes: data.notes || "",
            status: "RECEIVED"
          });
          setCartItems(data.Lines.map((l: any) => ({
            id: l.id,
            itemId: l.itemId,
            name: l.item?.name || 'Item',
            code: l.item?.code || '',
            uom: l.item?.baseUom?.name || 'Unit',
            qty: l.qty
          })));
        } else {
          if (w.length > 0) setFormData(prev => ({ ...prev, warehouseToId: w[0].id }));
        }
      } catch (e) {}
    };
    loadData();
  }, [id, isEdit]);

  const handlePoChange = (poId: string) => {
    setFormData(prev => ({ ...prev, poId }));
    if (!poId) return;
    const po = pos.find(p => p.id === poId);
    if (po) {
      setCartItems(po.Lines.map((l: any) => ({
        id: l.id,
        itemId: l.itemId,
        name: l.item?.name || 'Item',
        code: l.item?.code || '',
        uom: l.item?.baseUom?.name || 'Unit',
        qty: l.qty
      })));
      setIsDirty(true);
    }
  };

  const handleSave = async () => {
    if (!formData.poId || !formData.warehouseToId || cartItems.length === 0) {
      return toast.error("PO, Gudang, dan Item wajib diisi");
    }

    setIsSaving(true);
    try {
      const payload = {
          ...formData,
          lines: cartItems.map(it => ({ itemId: it.itemId, qty: it.qty }))
      };

      const res = await fetch("/api/transactions/receipt" + (isEdit ? `/${id}` : ""), {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`Penerimaan barang berhasil disimpan`);
        setIsDirty(false);
        navigate("/purchasing/receipt");
      } else {
        throw new Error("Gagal menyimpan");
      }
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan ke server");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedPo = pos.find(p => p.id === formData.poId);

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Penerimaan #${id}` : "Penerimaan Barang Baru"}
      module="Pembelian > Purchase Receipt"
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
                <Label className="ac-label">Referensi PO <span className="text-red-500">*</span></Label>
                <select 
                    className="ac-input"
                    value={formData.poId}
                    onChange={e => handlePoChange(e.target.value)}
                >
                    <option value="">-- Pilih PO Tertunda --</option>
                    {pos.map(p => <option key={p.id} value={p.id}>{p.poNumber} ({p.supplier?.name})</option>)}
                </select>
            </div>

            <div className="ac-field-group">
                <Label className="ac-label">Masuk Ke Gudang</Label>
                <select 
                    className="ac-input"
                    value={formData.warehouseToId}
                    onChange={e => { setFormData({...formData, warehouseToId: e.target.value}); setIsDirty(true); }}
                >
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
            </div>

            <div className="ac-field-group">
                <Label className="ac-label">Tgl Barang Masuk</Label>
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

        {/* Footer / Logistics Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-zinc-50 p-8 rounded-[2rem] border border-dashed border-zinc-200 space-y-3 relative group">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-1 italic">Surat Jalan / Shipment Notes</Label>
                <textarea 
                    className="w-full h-28 bg-white border border-zinc-200 rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-zinc-100 outline-none transition-all italic placeholder:text-zinc-300"
                    placeholder="Masukkan nomor surat jalan vendor, nama ekspedisi, atau keterangan fisik barang yang diterima..."
                    value={formData.notes}
                    onChange={e => { setFormData({...formData, notes: e.target.value}); setIsDirty(true); }}
                />
                <div className="absolute bottom-4 right-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest italic leading-none">Auto-Sync Active</span>
                    <Box className="w-3 h-3 text-zinc-200" />
                </div>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-center items-center bg-white p-8 rounded-[2rem] border-2 border-zinc-100 text-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full bg-[#1e3a5f]/5 flex items-center justify-center text-[#1e3a5f]">
                    <PackageOpen className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest italic">Status: Verifikasi</h4>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase leading-relaxed max-w-[200px] mx-auto">Saldo barang akan otomatis ditambahkan ke Gudang setelah dokumen disimpan.</p>
                </div>
            </div>
        </div>
    </FullscreenFormLayout>
  );
}

