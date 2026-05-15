import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function DepartmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: ""
  });

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          const res = await fetch(`/api/master/departments/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          const resData = await res.json();
          if (res.ok) setFormData(resData);
        } catch (e) {
          toast.error("Gagal mengambil data departemen");
        }
      };
      fetchData();
    }
  }, [isEdit, id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = isEdit ? `/api/master/departments/${id}` : "/api/master/departments";
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
      toast.success("Departemen berhasil disimpan");
      navigate("/master/departments");
    } catch(e) {
      toast.error("Gagal simpan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FullscreenFormLayout
      title={isEdit ? "Edit Departemen" : "Tambah Departemen"}
      module="MASTER-DEPT"
      status="DRAFT"
      onSave={handleSave}
      onCancel={() => navigate("/master/departments")}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      <div className="p-2 space-y-2">
        <div className="ac-form-header grid grid-cols-4 gap-4">
            <div className="ac-field-group">
                <Label className="ac-label">Kode Departemen <span className="text-red-500">*</span></Label>
                <Input 
                  className="ac-input" 
                  value={formData.code}
                  onChange={e => { setFormData({...formData, code: e.target.value}); setIsDirty(true); }}
                />
            </div>
            <div className="ac-field-group col-span-3">
                <Label className="ac-label">Nama Departemen <span className="text-red-500">*</span></Label>
                <Input 
                  className="ac-input" 
                  value={formData.name}
                  onChange={e => { setFormData({...formData, name: e.target.value}); setIsDirty(true); }}
                />
            </div>
            <div className="ac-field-group col-span-4">
                <Label className="ac-label">Deskripsi</Label>
                <Input 
                  className="ac-input" 
                  value={formData.description}
                  onChange={e => { setFormData({...formData, description: e.target.value}); setIsDirty(true); }}
                />
            </div>
        </div>
      </div>
    </FullscreenFormLayout>
  );
}
