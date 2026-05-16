import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { masterApi } from "../../lib/api-services"; 
import { ConfirmDeleteDialog } from "../../components/ui/confirm-delete-dialog";

export default function WarehouseForm() {
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
    location: "",
    notes: ""
  });

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          const resData = await masterApi.getWarehouse(id);
          setFormData({
            code: resData.code || "",
            name: resData.name || "",
            location: resData.location || "",
            notes: resData.notes || ""
          });
        } catch (e: any) {
          toast.error(e.message || "Gagal mengambil data gudang");
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
        await masterApi.updateWarehouse(id, formData);
      } else {
        await masterApi.createWarehouse(formData);
      }
      toast.success("Gudang berhasil disimpan");
      navigate("/master/warehouses");
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
      await masterApi.deleteWarehouse(id!);
      toast.success("Berhasil dihapus");
      navigate("/master/warehouses");
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
      title={isEdit ? "Edit Gudang" : "Tambah Gudang"}
      module="MASTER-WAREHOUSE"
      status="DRAFT"
      onSave={handleSave}
      onCancel={() => navigate("/master/warehouses")}
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
                    <Label className="ac-label">Kode Gudang <span className="text-red-500">*</span></Label>
                    <Input 
                        className="ac-input font-bold" 
                        value={formData.code}
                        onChange={e => setFormData({...formData, code: e.target.value})}
                    />
                </div>
                <div className="ac-field-group col-span-3">
                    <Label className="ac-label">Nama Gudang <span className="text-red-500">*</span></Label>
                    <Input 
                        className="ac-input" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="ac-field-group col-span-2">
                    <Label className="ac-label">Lokasi</Label>
                    <Input 
                        className="ac-input" 
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                </div>
                <div className="ac-field-group col-span-4">
                    <Label className="ac-label">Catatan</Label>
                    <textarea 
                        className="w-full h-24 bg-white border border-zinc-200 rounded-xl p-4 text-xs focus:ring-2 focus:ring-[#1e3a5f]/20 focus:outline-none transition-all"
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
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
