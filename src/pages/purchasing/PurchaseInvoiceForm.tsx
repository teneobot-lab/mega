import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { useFullscreenForm } from "../../hooks/use-fullscreen-form";
import { TransactionCart, CartItem } from "../../components/transaction/TransactionCart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { History, Search, FileText, Receipt, Calendar, CreditCard, ChevronDown } from "lucide-react";

export default function PurchaseInvoiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const { isSaving, isAutoSaving, setIsSaving, isDirty, setIsDirty, handleCancel } = useFullscreenForm({
    onAutoSave: async () => {
      console.log("Auto-saving invoice draft...");
    }
  });
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    supplierId: "",
    poId: "",
    notes: "",
    status: "UNPAID"
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [supRes, itmRes, poRes] = await Promise.all([
          fetch("/api/master/contacts?type=SUPPLIER", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}),
          fetch("/api/master/items", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}),
          fetch("/api/purchasing/orders", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }})
        ]);
        const sup = await supRes.json();
        const itm = await itmRes.json();
        const pd = await poRes.json();
        
        setSuppliers(sup);
        setAvailableItems(itm);
        setPos(pd.filter((p: any) => p.status === "APPROVED" || p.status === "PARTIAL"));

        if (isEdit) {
          const res = await fetch(`/api/purchasing/invoices/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          const data = await res.json();
          setFormData({
            date: data.date.split('T')[0],
            dueDate: data.dueDate.split('T')[0],
            supplierId: data.supplierId,
            poId: data.poId || "",
            notes: data.notes || "",
            status: data.status
          });
          setCartItems(data.Lines.map((l: any) => ({
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
          if (sup.length > 0) setFormData(prev => ({ ...prev, supplierId: sup[0].id }));
        }
      } catch (e) {}
    };
    loadData();
  }, [id, isEdit]);

  const handleSelectPO = (poId: string) => {
    setFormData(prev => ({ ...prev, poId }));
    if (!poId) return;
    const selectedPo = pos.find(p => p.id === poId);
    if (selectedPo) {
      setFormData(prev => ({ ...prev, supplierId: selectedPo.supplierId }));
      setCartItems(selectedPo.Lines.map((l: any) => ({
        id: l.id,
        itemId: l.itemId,
        name: l.item?.name || 'Item',
        code: l.item?.code || '',
        uom: l.item?.baseUom?.name || 'Unit',
        qty: l.qty,
        price: l.price,
        total: l.qty * l.price
      })));
      setIsDirty(true);
    }
  };

  const handleSave = async () => {
    if (!formData.supplierId || cartItems.length === 0) return toast.error("Supplier dan Barang wajib diisi");

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

      const res = await fetch("/api/purchasing/invoices" + (isEdit ? `/${id}` : ""), {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`Faktur Pembelian berhasil disimpan`);
        setIsDirty(false);
        navigate("/purchasing/invoice");
      } else {
        throw new Error("Gagal menyimpan");
      }
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan ke server");
    } finally {
      setIsSaving(false);
    }
  };

  const totalAmount = cartItems.reduce((acc, curr) => acc + (curr.total || 0), 0);

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Faktur #${id}` : "Faktur Pembelian Baru"}
      module="Pembelian > Purchase Invoice"
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
                <Label className="ac-label">Supplier <span className="text-red-500">*</span></Label>
                <select 
                    className="ac-input"
                    value={formData.supplierId}
                    disabled={!!formData.poId}
                    onChange={e => { setFormData({...formData, supplierId: e.target.value}); setIsDirty(true); }}
                >
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            
            <div className="ac-field-group">
                <Label className="ac-label">Purchase Order</Label>
                <select 
                    className="ac-input"
                    value={formData.poId}
                    onChange={e => handleSelectPO(e.target.value)}
                >
                    <option value="">Manual Invoice...</option>
                    {pos.map(p => <option key={p.id} value={p.id}>{p.poNumber}</option>)}
                </select>
            </div>

            <div className="ac-field-group">
                <Label className="ac-label">Tgl Faktur</Label>
                <Input 
                    type="date" 
                    className="ac-input" 
                    value={formData.date}
                    onChange={e => { setFormData({...formData, date: e.target.value}); setIsDirty(true); }}
                />
            </div>
            
            <div className="ac-field-group">
                <Label className="ac-label">Jatuh Tempo</Label>
                <Input 
                    type="date" 
                    className="ac-input" 
                    value={formData.dueDate}
                    onChange={e => { setFormData({...formData, dueDate: e.target.value}); setIsDirty(true); }}
                />
            </div>

            <div className="ac-field-group col-span-4">
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

