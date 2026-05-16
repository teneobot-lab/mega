import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { masterApi } from "../../lib/api-services";
import { ConfirmDeleteDialog } from "../../components/ui/confirm-delete-dialog";

export default function ItemCategoryForm() {
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
          const resData = await masterApi.getCategory(id);
          setFormData(resData);
        } catch (e: any) {
          toast.error(e.message || "Gagal mengambil data kategori item");
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
        await masterApi.updateCategory(id, formData);
      } else {
        await masterApi.createCategory(formData);
      }
      toast.success("Kategori berhasil disimpan");
      navigate("/master/item-categories");
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
      await masterApi.deleteCategory(id!);
      toast.success("Kategori berhasil dihapus");
      navigate("/master/item-categories");
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
        title={isEdit ? "Edit Kategori Item" : "Tambah Kategori Item"}
        module="MASTER-ITEM-CAT"
        status="DRAFT"
        onSave={handleSave}
        onCancel={() => navigate("/master/item-categories")}
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
                      <Label className="ac-label">Kode Kategori <span className="text-red-500">*</span></Label>
                      <Input 
                      className="ac-input" 
                      value={formData.code}
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      />
                  </div>
                  <div className="ac-field-group col-span-3">
                      <Label className="ac-label">Nama Kategori <span className="text-red-500">*</span></Label>
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

      <ConfirmDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmDelete}
        title="Hapus Kategori"
        description="Apakah Anda yakin ingin menghapus kategori ini? Seluruh data yang terkait dengan kategori ini mungkin akan terpengaruh."
        itemName={`${formData.code} - ${formData.name}`}
        isLoading={isDeleting}
      />
    </>
  );
}
