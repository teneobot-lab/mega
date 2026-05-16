import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { masterApi } from "../../lib/api-services";
import { ConfirmDeleteDialog } from "../../components/ui/confirm-delete-dialog";

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [customers, setCustomers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    customerId: null as string | null,
    startDate: "",
    endDate: "",
    status: "ACTIVE"
  });

  useEffect(() => {
    const loadInitial = async () => {
        try {
            const custData = await masterApi.getContacts("CUSTOMER");
            setCustomers(custData);
            
            if (isEdit) {
                const resData = await masterApi.getProject(id);
                // format dates for input type="date"
                if(resData.startDate) resData.startDate = resData.startDate.split('T')[0];
                if(resData.endDate) resData.endDate = resData.endDate.split('T')[0];
                setFormData(resData);
            }
        } catch (e: any) {
            toast.error(e.message || "Gagal memuat data");
        } finally {
            setIsLoading(false);
        }
    };
    loadInitial();
  }, [isEdit, id]);

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast.error("Kode dan Nama wajib diisi");
      return;
    }
    setIsSaving(true);
    try {
        const payload = {
            ...formData,
            startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
            endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        };

      if (isEdit) {
        await masterApi.updateProject(id, payload);
      } else {
        await masterApi.createProject(payload);
      }
      toast.success("Proyek berhasil disimpan");
      navigate("/master/projects");
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
        await masterApi.deleteProject(id!);
        toast.success("Proyek berhasil dihapus");
        navigate("/master/projects");
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
        title={isEdit ? "Edit Proyek" : "Tambah Proyek"}
        module="MASTER-PROJ"
        status="DRAFT"
        onSave={handleSave}
        onCancel={() => navigate("/master/projects")}
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
                      <Label className="ac-label">Kode Proyek <span className="text-red-500">*</span></Label>
                      <Input 
                      className="ac-input" 
                      value={formData.code}
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      />
                  </div>
                  <div className="ac-field-group col-span-3">
                      <Label className="ac-label">Nama Proyek <span className="text-red-500">*</span></Label>
                      <Input 
                      className="ac-input" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                  </div>
                  <div className="ac-field-group col-span-2">
                      <Label className="ac-label">Customer</Label>
                      <select 
                          className="ac-input"
                          value={formData.customerId || ""}
                          onChange={e => setFormData({...formData, customerId: e.target.value || null})}
                      >
                          <option value="">- Pilih Customer -</option>
                          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                  </div>
                  <div className="ac-field-group">
                      <Label className="ac-label">Status</Label>
                      <select 
                          className="ac-input"
                          value={formData.status}
                          onChange={e => setFormData({...formData, status: e.target.value})}
                      >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="CLOSED">CLOSED</option>
                      </select>
                  </div>
                  <div className="ac-field-group">
                  <Label className="ac-label">Tgl Mulai</Label>
                  <Input type="date" className="ac-input" value={formData.startDate || ""} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div className="ac-field-group">
                  <Label className="ac-label">Tgl Selesai</Label>
                  <Input type="date" className="ac-input" value={formData.endDate || ""} onChange={e => setFormData({...formData, endDate: e.target.value})} />
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
        title="Hapus Proyek"
        description="Apakah Anda yakin ingin menghapus proyek ini? Tindakan ini akan menghapus data proyek secara permanen dari sistem."
        itemName={`${formData.code} - ${formData.name}`}
        isLoading={isDeleting}
      />
    </>
  );
}
