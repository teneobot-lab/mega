import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { useFullscreenForm } from "../../hooks/use-fullscreen-form";
import { EditableTable } from "../../components/fullscreen-form/EditableTable";

export default function SalesOrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const { isSaving, setIsSaving, isDirty, setIsDirty, handleCancel } = useFullscreenForm();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerId: "",
    notes: "",
    status: "DRAFT"
  });

  const [lines, setLines] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    // Load dependencies
    const loadData = async () => {
      try {
        const [custRes, itmRes] = await Promise.all([
          fetch("/api/master/contacts?type=CUSTOMER", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}),
          fetch("/api/master/items", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }})
        ]);
        const custs = await custRes.json();
        const itms = await itmRes.json();
        setCustomers(custs);
        setItems(itms);

        if (isEdit) {
          const res = await fetch(`/api/sales/orders/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          const data = await res.json();
          setFormData({
            date: data.date.split('T')[0],
            customerId: data.customerId,
            notes: data.notes || "",
            status: data.status
          });
          setLines(data.Lines.map((l: any) => ({
            id: l.id,
            itemId: l.itemId,
            qty: l.qty,
            price: l.price,
            total: l.qty * l.price
          })));
        } else {
           if(custs.length > 0) setFormData(prev => ({...prev, customerId: custs[0].id}));
        }
      } catch (e) {}
    };
    loadData();
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!formData.customerId) return toast.error("Pelanggan wajib diisi");
    if (lines.length === 0) return toast.error("Minimal 1 barang pesanan");

    setIsSaving(true);
    try {
      const res = await fetch("/api/sales/orders" + (isEdit ? `/${id}` : ""), {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ ...formData, lines })
      });

      if (res.ok) {
        toast.success(`Pesanan Penjualan berhasil ${isEdit ? 'diubah' : 'dibuat'}`);
        setIsDirty(false);
        navigate("/sales/so");
      } else {
        throw new Error("Gagal menyimpan");
      }
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan ke server");
    } finally {
      setIsSaving(false);
    }
  };

  const tableColumns = [
    {
      key: "itemId",
      label: "Barang",
      type: "select" as const,
      options: items.map(i => ({ value: i.id, label: i.name }))
    },
    {
      key: "qty",
      label: "Quantity",
      type: "number" as const,
      width: "120px"
    },
    {
      key: "price",
      label: "Harga Satuan",
      type: "number" as const,
      width: "180px"
    },
    {
      key: "total",
      label: "Total",
      type: "number" as const,
      width: "180px",
      readOnly: true
    }
  ];

  const totalValue = lines.reduce((acc, curr) => acc + (curr.total || 0), 0);

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Pesanan #${id}` : "Pesanan Penjualan Baru"}
      module="Penjualan > Sales Order"
      status={formData.status as any}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm grid grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pelanggan <span className="text-red-500">*</span></Label>
            <select 
                className="w-full h-8 bg-zinc-50 border border-zinc-300 rounded px-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={formData.customerId}
                onChange={e => { setFormData({...formData, customerId: e.target.value}); setIsDirty(true); }}
            >
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tanggal Pesanan <span className="text-red-500">*</span></Label>
            <Input 
              type="date"
              className="h-8 text-xs border-zinc-300" 
              value={formData.date}
              onChange={e => { setFormData({...formData, date: e.target.value}); setIsDirty(true); }}
            />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Keterangan / Catatan</Label>
            <Input 
              className="h-8 text-xs border-zinc-300" 
              placeholder="..."
              value={formData.notes}
              onChange={e => { setFormData({...formData, notes: e.target.value}); setIsDirty(true); }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
             <h3 className="text-xs font-black uppercase tracking-widest text-[#1e3a5f]">Daftar Barang & Jasa</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <EditableTable 
              columns={tableColumns}
              data={lines}
              onChange={(newLines) => {
                setLines(newLines);
                setIsDirty(true);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10">
          <div></div>
          <div className="bg-[#1e3a5f] p-8 rounded-2xl text-white flex flex-col gap-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">Total Pesanan</span>
              <span className="text-3xl font-black italic tracking-tighter">Rp {totalValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </FullscreenFormLayout>
  );
}
