import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    customer: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE"
  });

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          const res = await fetch(`/api/master/projects/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          const resData = await res.json();
          if (res.ok) setFormData(resData);
        } catch (e) {
          toast.error("Gagal mengambil data proyek");
        }
      };
      fetchData();
    }
  }, [isEdit, id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = isEdit ? `/api/master/projects/${id}` : "/api/master/projects";
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
      toast.success("Proyek berhasil disimpan");
      navigate("/master/projects");
    } catch(e) {
      toast.error("Gagal simpan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FullscreenFormLayout
      title={isEdit ? "Edit Proyek" : "Tambah Proyek"}
      module="MASTER-PROJ"
      status="DRAFT"
      onSave={handleSave}
      onCancel={() => navigate("/master/projects")}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      <div className="p-2 space-y-2">
        <div className="ac-form-header grid grid-cols-4 gap-4">
            <div className="ac-field-group">
                <Label className="ac-label">Kode Proyek <span className="text-red-500">*</span></Label>
                <Input 
                  className="ac-input" 
                  value={formData.code}
                  onChange={e => { setFormData({...formData, code: e.target.value}); setIsDirty(true); }}
                />
            </div>
            <div className="ac-field-group col-span-3">
                <Label className="ac-label">Nama Proyek <span className="text-red-500">*</span></Label>
                <Input 
                  className="ac-input" 
                  value={formData.name}
                  onChange={e => { setFormData({...formData, name: e.target.value}); setIsDirty(true); }}
                />
            </div>
            <div className="ac-field-group col-span-2">
                <Label className="ac-label">Customer</Label>
                <Input 
                  className="ac-input" 
                  value={formData.customer}
                  onChange={e => { setFormData({...formData, customer: e.target.value}); setIsDirty(true); }}
                />
            </div>
            <div className="ac-field-group">
                 <Label className="ac-label">Status</Label>
                 <select 
                    className="ac-input"
                    value={formData.status}
                    onChange={e => { setFormData({...formData, status: e.target.value}); setIsDirty(true); }}
                >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="CLOSED">CLOSED</option>
                </select>
            </div>
            <div className="ac-field-group">
              <Label className="ac-label">Tgl Mulai</Label>
              <Input type="date" className="ac-input" value={formData.startDate} onChange={e => { setFormData({...formData, startDate: e.target.value}); setIsDirty(true); }} />
            </div>
             <div className="ac-field-group">
              <Label className="ac-label">Tgl Selesai</Label>
              <Input type="date" className="ac-input" value={formData.endDate} onChange={e => { setFormData({...formData, endDate: e.target.value}); setIsDirty(true); }} />
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
