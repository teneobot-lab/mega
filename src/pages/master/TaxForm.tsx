import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { masterApi } from "../../lib/api-services"; 
import { ConfirmDeleteDialog } from "../../components/ui/confirm-delete-dialog";

export default function TaxForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    rate: 0,
    type: "PPN",
    accountId: null as string | null
  });

  useEffect(() => {
    const loadInitial = async () => {
        try {
            const accData = await masterApi.getAccounts();
            setAccounts(accData);
            
            if (isEdit) {
                const resData = await masterApi.getTax(id);
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
      if (isEdit) {
        await masterApi.updateTax(id, formData);
      } else {
        await masterApi.createTax(formData);
      }
      toast.success("Pajak berhasil disimpan");
      navigate("/master/taxes");
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
      await masterApi.deleteTax(id!);
      toast.success("Berhasil dihapus");
      navigate("/master/taxes");
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
      title={isEdit ? "Edit Pajak" : "Tambah Pajak"}
      module="MASTER-TAX"
      status="DRAFT"
      onSave={handleSave}
      onCancel={() => navigate("/master/taxes")}
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
                    <Label className="ac-label">Kode Pajak <span className="text-red-500">*</span></Label>
                    <Input 
                    className="ac-input" 
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    />
                </div>
                <div className="ac-field-group col-span-3">
                    <Label className="ac-label">Nama Pajak <span className="text-red-500">*</span></Label>
                    <Input 
                    className="ac-input" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                
                <div className="ac-field-group">
                    <Label className="ac-label">Rate (%)</Label>
                    <Input 
                    type="number"
                    className="ac-input text-right" 
                    value={formData.rate}
                    onChange={e => setFormData({...formData, rate: Number(e.target.value)})}
                    />
                </div>
                <div className="ac-field-group">
                    <Label className="ac-label">Tipe</Label>
                    <select 
                        className="ac-input"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                        <option value="PPN">PPN</option>
                        <option value="PPh">PPh</option>
                    </select>
                </div>
                <div className="ac-field-group col-span-2">
                    <Label className="ac-label">Akun Pemetaan</Label>
                    <select 
                        className="ac-input"
                        value={formData.accountId || ""}
                        onChange={e => setFormData({...formData, accountId: e.target.value || null})}
                    >
                        <option value="">- Pilih Akun -</option>
                        {accounts.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.code} - {a.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
      )}
    </FullscreenFormLayout>
      <ConfirmDeleteDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} onConfirm={confirmDelete} title="Konfirmasi" description="Apakah Anda yakin ingin menghapus data ini?" isLoading={isDeleting} />
    </>
  );
}
