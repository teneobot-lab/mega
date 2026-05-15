import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function TaxForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    rate: 0,
    type: "PPN"
  });

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          const res = await fetch(`/api/master/taxes/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          const resData = await res.json();
          if (res.ok) setFormData(resData);
        } catch (e) {
          toast.error("Gagal mengambil data pajak");
        }
      };
      fetchData();
    }
  }, [isEdit, id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = isEdit ? `/api/master/taxes/${id}` : "/api/master/taxes";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error();
      toast.success("Pajak berhasil disimpan");
      navigate("/master/taxes");
    } catch(e) {
      toast.error("Gagal simpan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FullscreenFormLayout
      title={isEdit ? "Edit Pajak" : "Tambah Pajak"}
      module="MASTER-TAX"
      status="DRAFT"
      onSave={handleSave}
      onCancel={() => navigate("/master/taxes")}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      <div className="p-2 space-y-2">
        <div className="ac-form-header grid grid-cols-4 gap-4">
            <div className="ac-field-group">
                <Label className="ac-label">Kode Pajak <span className="text-red-500">*</span></Label>
                <Input 
                  className="ac-input" 
                  value={formData.code}
                  onChange={e => { setFormData({...formData, code: e.target.value}); setIsDirty(true); }}
                />
            </div>
            <div className="ac-field-group col-span-3">
                <Label className="ac-label">Nama Pajak <span className="text-red-500">*</span></Label>
                <Input 
                  className="ac-input" 
                  value={formData.name}
                  onChange={e => { setFormData({...formData, name: e.target.value}); setIsDirty(true); }}
                />
            </div>
            
            <div className="ac-field-group">
                <Label className="ac-label">Rate (%)</Label>
                <Input 
                  type="number"
                  className="ac-input text-right" 
                  value={formData.rate}
                  onChange={e => { setFormData({...formData, rate: Number(e.target.value)}); setIsDirty(true); }}
                />
            </div>
            <div className="ac-field-group">
                 <Label className="ac-label">Tipe</Label>
                 <select 
                    className="ac-input"
                    value={formData.type}
                    onChange={e => { setFormData({...formData, type: e.target.value}); setIsDirty(true); }}
                >
                    <option value="PPN">PPN</option>
                    <option value="PPh">PPh</option>
                </select>
            </div>
        </div>
      </div>
    </FullscreenFormLayout>
  );
}
