import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { useFullscreenForm } from "../../hooks/use-fullscreen-form";

export default function ContactForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const { isSaving, setIsSaving, isDirty, setIsDirty, handleCancel } = useFullscreenForm();
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "CUSTOMER",
    phone: "",
    email: "",
    address: "",
    notes: ""
  });

  useEffect(() => {
    if (isEdit) {
      // Fetch details if edit
      fetch(`/api/master/contacts/${id}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => res.json())
      .then(data => setFormData(data));
    }
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!formData.name || !formData.code) return toast.error("Kode dan Nama wajib diisi");
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/master/contacts" + (isEdit ? `/${id}` : ""), {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(`Kontak berhasil ${isEdit ? 'diubah' : 'dibuat'}`);
        setIsDirty(false);
        navigate("/contacts");
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
      title={isEdit ? formData.name : "Kontak Baru"}
      module="Master Data > Kontak"
      status="DRAFT"
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm grid grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tipe Kontak <span className="text-red-500">*</span></Label>
            <select 
                className="w-full h-8 bg-zinc-50 border border-zinc-300 rounded px-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={formData.type}
                onChange={e => { setFormData({...formData, type: e.target.value}); setIsDirty(true); }}
            >
                <option value="CUSTOMER">PELANGGAN</option>
                <option value="SUPPLIER">SUPPLIER</option>
                <option value="EMPLOYEE">KARYAWAN</option>
                <option value="OTHER">LAINNYA</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Kode Kontak <span className="text-red-500">*</span></Label>
            <Input 
              className="h-8 text-xs border-zinc-300 font-bold" 
              placeholder="CUST-001"
              value={formData.code}
              onChange={e => { setFormData({...formData, code: e.target.value}); setIsDirty(true); }}
            />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nama Kontak <span className="text-red-500">*</span></Label>
            <Input 
              className="h-8 text-xs border-zinc-300" 
              placeholder="Masukkan nama lengkap..."
              value={formData.name}
              onChange={e => { setFormData({...formData, name: e.target.value}); setIsDirty(true); }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No. Telepon</Label>
            <Input 
              className="h-8 text-xs border-zinc-300" 
              placeholder="0812xxxx"
              value={formData.phone}
              onChange={e => { setFormData({...formData, phone: e.target.value}); setIsDirty(true); }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email</Label>
            <Input 
              type="email"
              className="h-8 text-xs border-zinc-300" 
              placeholder="email@perusahaan.com"
              value={formData.email}
              onChange={e => { setFormData({...formData, email: e.target.value}); setIsDirty(true); }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-2">
                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Alamat Lengkap</Label>
                <textarea 
                    className="w-full h-24 bg-white border border-zinc-200 rounded-xl p-4 text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    placeholder="Masukkan alamat pengiriman & penagihan..."
                    value={formData.address}
                    onChange={e => { setFormData({...formData, address: e.target.value}); setIsDirty(true); }}
                />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Catatan Internal</Label>
                <textarea 
                    className="w-full h-24 bg-white border border-zinc-200 rounded-xl p-4 text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all italic"
                    value={formData.notes}
                    onChange={e => { setFormData({...formData, notes: e.target.value}); setIsDirty(true); }}
                />
            </div>
          </div>
        </div>
      </div>
    </FullscreenFormLayout>
  );
}
