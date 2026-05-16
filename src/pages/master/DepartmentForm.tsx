import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { masterApi } from "../../lib/api-services"; 
import { ConfirmDeleteDialog } from "../../components/ui/confirm-delete-dialog";

export default function DepartmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: ""
  });

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          const resData = await masterApi.getDepartment(id);
          setFormData(resData);
        } catch (e: any) {
          toast.error(e.message || "Gagal mengambil data departemen");
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
        await masterApi.updateDepartment(id, formData);
      } else {
        await masterApi.createDepartment(formData);
      }
      toast.success("Departemen berhasil disimpan");
      navigate("/master/departments");
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
      await masterApi.deleteDepartment(id!);
      toast.success("Berhasil dihapus");
      navigate("/master/departments");
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
      title={isEdit ? "Edit Departemen" : "Tambah Departemen"}
      module="MASTER-DEPT"
      status="DRAFT"
      onSave={handleSave}
      onCancel={() => navigate("/master/departments")}
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
                    <Label className="ac-label">Kode Departemen <span className="text-red-500">*</span></Label>
                    <Input 
                    className="ac-input" 
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    />
                </div>
                <div className="ac-field-group col-span-3">
                    <Label className="ac-label">Nama Departemen <span className="text-red-500">*</span></Label>
                    <Input 
                    className="ac-input" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="ac-field-group col-span-4">
                    <Label className="ac-label">Deskripsi</Label>
                    <Input 
                    className="ac-input" 
                    value={formData.description || ""}
                    onChange={e => setFormData({...formData, description: e.target.value})}
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
