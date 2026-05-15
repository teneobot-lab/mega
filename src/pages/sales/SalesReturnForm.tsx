import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { useFullscreenForm } from "../../hooks/use-fullscreen-form";
import { TransactionCart, CartItem } from "../../components/transaction/TransactionCart";
import { RotateCw, Box, Calendar, History, Trash2, Warehouse, Users, ReceiptText, Undo2, ArrowUpRight } from "lucide-react";

export default function SalesReturnForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const { isSaving, isAutoSaving, setIsSaving, isDirty, setIsDirty, handleCancel } = useFullscreenForm({
    onAutoSave: async () => {
      console.log("Auto-saving sales return draft...");
    }
  });
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    contactId: "",
    warehouseId: "",
    notes: "",
    status: "RETURNED"
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [wRes, cusRes, itmRes] = await Promise.all([
          fetch("/api/master/warehouses", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}),
          fetch("/api/master/contacts?type=CUSTOMER", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}),
          fetch("/api/master/items", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }})
        ]);
        const w = await wRes.json();
        const c = await cusRes.json();
        const itm = await itmRes.json();
        
        setWarehouses(w);
        setCustomers(c);
        setAvailableItems(itm);

        if (isEdit) {
          const res = await fetch(`/api/sales/returns/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          const data = await res.json();
          setFormData({
            date: data.date.split('T')[0],
            contactId: data.contactId,
            warehouseId: data.warehouseId || (w.length > 0 ? w[0].id : ""),
            notes: data.notes || "",
            status: "RETURNED"
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
          if (c.length > 0) setFormData(prev => ({ ...prev, contactId: c[0].id }));
          if (w.length > 0) setFormData(prev => ({ ...prev, warehouseId: w[0].id }));
        }
      } catch (e) {}
    };
    loadData();
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!formData.contactId || !formData.warehouseId || cartItems.length === 0) {
      return toast.error("Customer, Gudang, dan Item wajib diisi");
    }

    setIsSaving(true);
    try {
      const payload = {
          ...formData,
          lines: cartItems.map(it => ({ itemId: it.itemId, qty: it.qty, price: it.price }))
      };

      const res = await fetch("/api/sales/returns" + (isEdit ? `/${id}` : ""), {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`Retur Penjualan berhasil disimpan`);
        setIsDirty(false);
        navigate("/sales/return");
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
      title={isEdit ? `Edit Retur #${id}` : "Retur Penjualan Baru"}
      module="Penjualan > Sales Return"
      status={formData.status as any}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
      isAutoSaving={isAutoSaving}
      isEdit={isEdit}
    >
      <div className="max-w-6xl mx-auto space-y-8 pb-32">
        {/* Header Section */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-2xl relative overflow-hidden grid grid-cols-12 gap-8 ring-1 ring-zinc-50">
            <div className="absolute top-0 right-0 p-12 opacity-[0.05]">
                <Undo2 className="w-48 h-48 rotate-12" />
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-2">
                <Label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.25em] flex items-center gap-2 pl-1 italic">
                    <Users className="w-3.5 h-3.5" /> Pelanggan Yang Meretur <span className="text-red-500">*</span>
                </Label>
                <select 
                    className="w-full h-14 bg-blue-50/20 border-2 border-blue-100 rounded-2xl px-6 text-sm font-black text-[#1e3a5f] focus:bg-white outline-none transition-all appearance-none italic"
                    value={formData.contactId}
                    onChange={e => { setFormData({...formData, contactId: e.target.value}); setIsDirty(true); }}
                >
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <div className="col-span-12 md:col-span-6 lg:col-span-4 space-y-2">
                <Label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] flex items-center gap-2 pl-1 italic">
                    <Warehouse className="w-3.5 h-3.5" /> Penerimaan Stok (Gudang)
                </Label>
                <select 
                    className="w-full h-14 bg-indigo-50/20 border-2 border-indigo-100 rounded-2xl px-6 text-sm font-black text-indigo-900 focus:bg-white outline-none transition-all appearance-none italic"
                    value={formData.warehouseId}
                    onChange={e => { setFormData({...formData, warehouseId: e.target.value}); setIsDirty(true); }}
                >
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
            </div>

            <div className="col-span-12 md:col-span-6 lg:col-span-4 space-y-2">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] flex items-center gap-2 pl-1 italic">
                    <Calendar className="w-3.5 h-3.5" /> Tgl Bukti Retur
                </Label>
                <Input 
                    type="date"
                    className="h-14 bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 text-sm font-black text-[#1e3a5f]" 
                    value={formData.date}
                    onChange={e => { setFormData({...formData, date: e.target.value}); setIsDirty(true); }}
                />
            </div>
        </div>

        {/* Action List Section */}
        <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-xl ring-4 ring-blue-600/10">
                        <ReceiptText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1e3a5f]">Return Inventory manifest</h3>
                </div>
                <div className="flex items-center gap-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] italic">
                    <span className="flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> Status: {isEdit ? "ADJUSTMENT" : "DRAFT NEW"}</span>
                </div>
            </div>
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

        {/* Footer / Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 bg-zinc-50 p-8 rounded-[2.5rem] border border-dashed border-zinc-200 space-y-4">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-1 italic flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5 text-zinc-300" /> Reason for return / damage notes
                </Label>
                <textarea 
                    className="w-full h-32 bg-white border border-zinc-200 rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-zinc-100 outline-none transition-all italic placeholder:text-zinc-300"
                    placeholder="Wajib diisi: Jelaskan mengapa barang ini diretur (misal: Rusak dalam pengiriman, salah spek, atau cacat pabrik)..."
                    value={formData.notes}
                    onChange={e => { setFormData({...formData, notes: e.target.value}); setIsDirty(true); }}
                />
            </div>

            <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#1e3a5f] p-10 rounded-[3rem] text-white space-y-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                    <div className="space-y-1 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic">Total Credit Adjustment</span>
                        <div className="text-5xl font-black italic tracking-tighter tabular-nums text-blue-300">
                             Rp {totalAmount.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100/50 flex items-start gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <span className="text-[9px] font-black text-red-600 uppercase tracking-widest block mb-1">Financial Impact</span>
                        <p className="text-[10px] font-bold text-red-400 leading-relaxed italic uppercase">Sistem akan otomatis menerbitkan Credit Memo dan memotong saldo piutang pelanggan ini secara real-time.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </FullscreenFormLayout>
  );
}

