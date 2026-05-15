import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function SalesmanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    commission: 0,
    target: 0,
    isActive: true
  });

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          const res = await fetch(`/api/master/salesman/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          const resData = await res.json();
          if (res.ok) setFormData(resData);
        } catch (e) {
          toast.error("Gagal mengambil data salesman");
        }
      };
      fetchData();
    }
  }, [isEdit, id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = isEdit ? `/api/master/salesman/${id}` : "/api/master/salesman";
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
      toast.success("Salesman berhasil disimpan");
      navigate("/master/salesman");
    } catch(e) {
      toast.error("Gagal simpan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FullscreenFormLayout
      title={isEdit ? "Edit Salesman" : "Tambah Salesman"}
      module="MASTER-SALESMAN"
      status="DRAFT"
      onSave={handleSave}
      onCancel={() => navigate("/master/salesman")}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      <div className="p-2 space-y-2">
        <div className="ac-form-header grid grid-cols-4 gap-4">
            <div className="ac-field-group">
                <Label className="ac-label">Kode Salesman <span className="text-red-500">*</span></Label>
                <Input 
                  className="ac-input" 
                  value={formData.code}
                  onChange={e => { setFormData({...formData, code: e.target.value}); setIsDirty(true); }}
                />
            </div>
            <div className="ac-field-group col-span-2">
                <Label className="ac-label">Nama Salesman <span className="text-red-500">*</span></Label>
                <Input 
                  className="ac-input" 
                  value={formData.name}
                  onChange={e => { setFormData({...formData, name: e.target.value}); setIsDirty(true); }}
                />
            </div>
             <div className="ac-field-group">
                <Label className="ac-label">Status</Label>
                <select 
                    className="ac-input"
                    value={formData.isActive ? "true" : "false"}
                    onChange={e => { setFormData({...formData, isActive: e.target.value === "true"}); setIsDirty(true); }}
                >
                    <option value="true">Aktif</option>
                    <option value="false">Non-aktif</option>
                </select>
            </div>
             <div className="ac-field-group">
                <Label className="ac-label">Email</Label>
                <Input 
                  className="ac-input" 
                  type="email"
                  value={formData.email}
                  onChange={e => { setFormData({...formData, email: e.target.value}); setIsDirty(true); }}
                />
            </div>
            <div className="ac-field-group">
                <Label className="ac-label">Telepon</Label>
                <Input 
                  className="ac-input" 
                  value={formData.phone}
                  onChange={e => { setFormData({...formData, phone: e.target.value}); setIsDirty(true); }}
                />
            </div>
            <div className="ac-field-group">
                <Label className="ac-label">Komisi (%)</Label>
                <Input 
                  className="ac-input text-right" 
                  type="number"
                  value={formData.commission}
                  onChange={e => { setFormData({...formData, commission: Number(e.target.value)}); setIsDirty(true); }}
                />
            </div>
             <div className="ac-field-group">
                <Label className="ac-label">Target Sales</Label>
                <Input 
                  className="ac-input text-right" 
                  type="number"
                  value={formData.target}
                  onChange={e => { setFormData({...formData, target: Number(e.target.value)}); setIsDirty(true); }}
                />
            </div>
        </div>
      </div>
    </FullscreenFormLayout>
  );
}
