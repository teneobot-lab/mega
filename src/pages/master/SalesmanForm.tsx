import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { masterApi } from "../../lib/api-services"; 
import { ConfirmDeleteDialog } from "../../components/ui/confirm-delete-dialog";

export default function SalesmanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [formData, setFormData] = useState({
    type: "SALESMAN",
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
          const resData = await masterApi.getContact(id);
          setFormData(resData);
        } catch (e: any) {
          toast.error(e.message || "Gagal mengambil data salesman");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isEdit, id]);

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast.error("Kode dan Nama wajib diisi");
      return;
    }
    setIsSaving(true);
    try {
      if (isEdit) {
        await masterApi.updateContact(id, formData);
      } else {
        await masterApi.createContact(formData);
      }
      toast.success("Salesman berhasil disimpan");
      navigate("/master/salesman");
    } catch(e: any) {
      toast.error(e.message || "Gagal menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await masterApi.deleteContact(id!);
      toast.success("Berhasil dihapus");
      navigate("/master/salesman");
    } catch (e: any) {
      toast.error(e.message || "Gagal menghapus");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <FullscreenFormLayout
      title={isEdit ? "Edit Salesman" : "Tambah Salesman"}
      module="MASTER-SALESMAN"
      status="DRAFT"
      onSave={handleSave}
      onCancel={() => navigate("/master/salesman")}
      onDelete={isEdit ? handleDelete : undefined}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64 font-bold text-zinc-400 italic">Memuat data...</div>
      ) : (
        <div className="p-2 space-y-2">
          <div className="ac-form-header grid grid-cols-4 gap-4">
              <div className="ac-field-group">
                  <Label className="ac-label">Kode Salesman <span className="text-red-500">*</span></Label>
                  <Input 
                    className="ac-input" 
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                  />
              </div>
              <div className="ac-field-group col-span-2">
                  <Label className="ac-label">Nama Salesman <span className="text-red-500">*</span></Label>
                  <Input 
                    className="ac-input" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
              </div>
              <div className="ac-field-group">
                  <Label className="ac-label">Status</Label>
                  <select 
                      className="ac-input"
                      value={formData.isActive ? "true" : "false"}
                      onChange={e => setFormData({...formData, isActive: e.target.value === "true"})}
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
                    value={formData.email || ""}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
              </div>
              <div className="ac-field-group">
                  <Label className="ac-label">Telepon</Label>
                  <Input 
                    className="ac-input" 
                    value={formData.phone || ""}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
              </div>
              <div className="ac-field-group">
                  <Label className="ac-label">Komisi (%)</Label>
                  <Input 
                    className="ac-input text-right" 
                    type="number"
                    value={formData.commission}
                    onChange={e => setFormData({...formData, commission: Number(e.target.value)})}
                  />
              </div>
              <div className="ac-field-group">
                  <Label className="ac-label">Target Sales</Label>
                  <Input 
                    className="ac-input text-right" 
                    type="number"
                    value={formData.target}
                    onChange={e => setFormData({...formData, target: Number(e.target.value)})}
                  />
              </div>
          </div>
        </div>
      )}
    </FullscreenFormLayout>
      <ConfirmDeleteDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} onConfirm={confirmDelete} title="Konfirmasi" description="Apakah Anda yakin ingin menghapus data ini?" isLoading={isDeleting} />
    </>
  );
}
