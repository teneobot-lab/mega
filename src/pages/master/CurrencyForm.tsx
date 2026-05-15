import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function CurrencyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    rate: 1,
    isBase: false
  });

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          const res = await fetch(`/api/master/currencies/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          const resData = await res.json();
          if (res.ok) setFormData(resData);
        } catch (e) {
          toast.error("Gagal mengambil data mata uang");
        }
      };
      fetchData();
    }
  }, [isEdit, id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = isEdit ? `/api/master/currencies/${id}` : "/api/master/currencies";
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
      toast.success("Mata Uang berhasil disimpan");
      navigate("/master/currencies");
    } catch(e) {
      toast.error("Gagal simpan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FullscreenFormLayout
      title={isEdit ? "Edit Mata Uang" : "Tambah Mata Uang"}
      module="MASTER-CURRENCY"
      status="DRAFT"
      onSave={handleSave}
      onCancel={() => navigate("/master/currencies")}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      <div className="p-2 space-y-2">
        <div className="ac-form-header grid grid-cols-4 gap-4">
            <div className="ac-field-group">
                <Label className="ac-label">Kode (IDR/USD) <span className="text-red-500">*</span></Label>
                <Input 
                  className="ac-input" 
                  value={formData.code}
                  onChange={e => { setFormData({...formData, code: e.target.value}); setIsDirty(true); }}
                />
            </div>
            <div className="ac-field-group col-span-3">
                <Label className="ac-label">Nama Mata Uang <span className="text-red-500">*</span></Label>
                <Input 
                  className="ac-input" 
                  value={formData.name}
                  onChange={e => { setFormData({...formData, name: e.target.value}); setIsDirty(true); }}
                />
            </div>
            
            <div className="ac-field-group">
                <Label className="ac-label">Kurs ke IDR</Label>
                <Input 
                  type="number"
                  className="ac-input text-right" 
                  value={formData.rate}
                  onChange={e => { setFormData({...formData, rate: Number(e.target.value)}); setIsDirty(true); }}
                />
            </div>
             <div className="ac-field-group">
                 <Label className="ac-label">Base Currency?</Label>
                 <select 
                    className="ac-input"
                    value={formData.isBase ? "true" : "false"}
                    onChange={e => { setFormData({...formData, isBase: e.target.value === "true"}); setIsDirty(true); }}
                >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            </div>
        </div>
      </div>
    </FullscreenFormLayout>
  );
}
