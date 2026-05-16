import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { masterApi } from "../../lib/api-services";
import { ConfirmDeleteDialog } from "../../components/ui/confirm-delete-dialog";

export default function ContactForm() {
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
    type: "CUSTOMER",
    phone: "",
    email: "",
    address: "",
    notes: ""
  });

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          const resData = await masterApi.getContact(id);
          setFormData({
            code: resData.code || "",
            name: resData.name || "",
            type: resData.type || "CUSTOMER",
            phone: resData.phone || "",
            email: resData.email || "",
            address: resData.address || "",
            notes: resData.notes || ""
          });
        } catch (e: any) {
          toast.error(e.message || "Gagal mengambil data kontak");
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
      toast.success("Kontak berhasil disimpan");
      navigate("/master/contacts");
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
      toast.success("Kontak berhasil dihapus");
      navigate("/master/contacts");
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
        title={isEdit ? "Edit Kontak" : "Tambah Kontak"}
        module="MASTER-CONTACT"
        status="DRAFT"
        onSave={handleSave}
        onCancel={() => navigate("/master/contacts")}
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
                      <Label className="ac-label">Tipe Kontak <span className="text-red-500">*</span></Label>
                      <select 
                          className="ac-input font-bold"
                          value={formData.type}
                          onChange={e => setFormData({...formData, type: e.target.value})}
                      >
                          <option value="CUSTOMER">PELANGGAN</option>
                          <option value="SUPPLIER">SUPPLIER</option>
                          <option value="SALESMAN">SALESMAN</option>
                          <option value="EMPLOYEE">KARYAWAN</option>
                          <option value="OTHER">LAINNYA</option>
                      </select>
                  </div>
                  <div className="ac-field-group">
                      <Label className="ac-label">Kode Kontak <span className="text-red-500">*</span></Label>
                      <Input 
                          className="ac-input font-bold" 
                          value={formData.code}
                          onChange={e => setFormData({...formData, code: e.target.value})}
                      />
                  </div>
                  <div className="ac-field-group col-span-2">
                      <Label className="ac-label">Nama Kontak <span className="text-red-500">*</span></Label>
                      <Input 
                          className="ac-input" 
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                  </div>
                  <div className="ac-field-group">
                      <Label className="ac-label">Telepon</Label>
                      <Input 
                          className="ac-input" 
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                  </div>
                  <div className="ac-field-group">
                      <Label className="ac-label">Email</Label>
                      <Input 
                          type="email"
                          className="ac-input" 
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                  </div>
                  <div className="ac-field-group col-span-4">
                      <Label className="ac-label">Alamat</Label>
                      <textarea 
                          className="w-full h-24 bg-white border border-zinc-200 rounded-xl p-4 text-xs focus:ring-2 focus:ring-[#1e3a5f]/20 focus:outline-none transition-all"
                          value={formData.address}
                          onChange={e => setFormData({...formData, address: e.target.value})}
                      />
                  </div>
                  <div className="ac-field-group col-span-4">
                      <Label className="ac-label">Catatan</Label>
                      <textarea 
                          className="w-full h-24 bg-white border border-zinc-200 rounded-xl p-4 text-xs focus:ring-2 focus:ring-[#1e3a5f]/20 focus:outline-none transition-all italic"
                          value={formData.notes}
                          onChange={e => setFormData({...formData, notes: e.target.value})}
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
        title="Hapus Kontak"
        description="Apakah Anda yakin ingin menghapus kontak ini? Tindakan ini akan menghapus data kontak secara permanen dari sistem."
        itemName={`${formData.code} - ${formData.name}`}
        isLoading={isDeleting}
      />
    </>
  );
}
