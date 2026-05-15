import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { useFullscreenForm } from "../../hooks/use-fullscreen-form";

export default function ItemForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const { isSaving, setIsSaving, isDirty, setIsDirty, handleCancel } = useFullscreenForm();
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    baseUomId: "",
    buyPrice: 0,
    sellPrice: 0,
    minStock: 0,
    notes: ""
  });

  const [uoms, setUoms] = useState<{id: string, code: string, name: string}[]>([]);

  useEffect(() => {
    // Fetch UOMs
    fetch("/api/master/uoms", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => res.json())
    .then(data => {
        setUoms(data);
        if (!isEdit && data.length > 0) setFormData(prev => ({...prev, baseUomId: data[0].id}));
    });

    if (isEdit) {
      fetch(`/api/master/items/${id}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => res.json())
      .then(data => setFormData(data));
    }
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!formData.name || !formData.code || !formData.baseUomId) {
        return toast.error("Kode, Nama, dan Satuan wajib diisi");
    }
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/master/items" + (isEdit ? `/${id}` : ""), {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(`Barang berhasil ${isEdit ? 'diubah' : 'dibuat'}`);
        setIsDirty(false);
        navigate("/items");
      } else {
        throw new Error("Gagal menyimpan");
      }
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan ke server");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FullscreenFormLayout
      title={isEdit ? formData.name : "Barang Baru"}
      module="Master Data > Barang"
      status="DRAFT"
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm grid grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Kode Barang <span className="text-red-500">*</span></Label>
            <Input 
              className="h-8 text-xs border-zinc-300 font-bold" 
              placeholder="ITM-001"
              value={formData.code}
              onChange={e => { setFormData({...formData, code: e.target.value}); setIsDirty(true); }}
            />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nama Barang <span className="text-red-500">*</span></Label>
            <Input 
              className="h-8 text-xs border-zinc-300" 
              placeholder="Masukkan nama barang lengkap..."
              value={formData.name}
              onChange={e => { setFormData({...formData, name: e.target.value}); setIsDirty(true); }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Satuan Dasar <span className="text-red-500">*</span></Label>
            <select 
                className="w-full h-8 bg-zinc-50 border border-zinc-300 rounded px-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={formData.baseUomId}
                onChange={e => { setFormData({...formData, baseUomId: e.target.value}); setIsDirty(true); }}
            >
                {uoms.map(u => <option key={u.id} value={u.id}>{u.code}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Harga Beli Terakhir</Label>
            <Input 
              type="number"
              className="h-8 text-xs border-zinc-300 text-right tabular-nums" 
              value={formData.buyPrice}
              onChange={e => { setFormData({...formData, buyPrice: Number(e.target.value)}); setIsDirty(true); }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Harga Jual Standar</Label>
            <Input 
              type="number"
              className="h-8 text-xs border-zinc-300 text-right tabular-nums" 
              value={formData.sellPrice}
              onChange={e => { setFormData({...formData, sellPrice: Number(e.target.value)}); setIsDirty(true); }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Stok Minimum</Label>
            <Input 
              type="number"
              className="h-8 text-xs border-zinc-300 text-right tabular-nums" 
              value={formData.minStock}
              onChange={e => { setFormData({...formData, minStock: Number(e.target.value)}); setIsDirty(true); }}
            />
          </div>
        </div>

        <div className="space-y-2">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Keterangan Barang</Label>
            <textarea 
                className="w-full h-24 bg-white border border-zinc-200 rounded-xl p-4 text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all italic"
                placeholder="..."
                value={formData.notes}
                onChange={e => { setFormData({...formData, notes: e.target.value}); setIsDirty(true); }}
            />
        </div>
      </div>
    </FullscreenFormLayout>
  );
}
