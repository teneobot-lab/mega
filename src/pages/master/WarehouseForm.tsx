import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { useFullscreenForm } from "../../hooks/use-fullscreen-form";

export default function WarehouseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const { isSaving, setIsSaving, isDirty, setIsDirty, handleCancel } = useFullscreenForm();
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    location: "",
    notes: ""
  });

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/master/warehouses/${id}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => res.json())
      .then(data => setFormData({
        code: data.code,
        name: data.name,
        location: data.location || "",
        notes: data.notes || ""
      }));
    }
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!formData.name || !formData.code) return toast.error("Kode dan Nama wajib diisi");
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/master/warehouses" + (isEdit ? `/${id}` : ""), {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(`Gudang berhasil ${isEdit ? 'diubah' : 'dibuat'}`);
        setIsDirty(false);
        navigate("/warehouses");
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
      title={isEdit ? formData.name : "Gudang Baru"}
      module="Master Data > Gudang"
      status="DRAFT"
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm grid grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Kode Gudang <span className="text-red-500">*</span></Label>
            <Input 
              className="h-8 text-xs border-zinc-300 font-bold" 
              placeholder="WH-001"
              value={formData.code}
              onChange={e => { setFormData({...formData, code: e.target.value}); setIsDirty(true); }}
            />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nama Gudang <span className="text-red-500">*</span></Label>
            <Input 
              className="h-8 text-xs border-zinc-300" 
              placeholder="Masukkan nama gudang..."
              value={formData.name}
              onChange={e => { setFormData({...formData, name: e.target.value}); setIsDirty(true); }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Lokasi</Label>
            <Input 
              className="h-8 text-xs border-zinc-300 font-medium" 
              placeholder="Kota / Wilayah..."
              value={formData.location}
              onChange={e => { setFormData({...formData, location: e.target.value}); setIsDirty(true); }}
            />
          </div>
        </div>

        <div className="space-y-2">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Catatan Tambahan</Label>
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
