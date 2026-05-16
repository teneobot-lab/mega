import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { masterApi } from "../../lib/api-services";
import { ConfirmDeleteDialog } from "../../components/ui/confirm-delete-dialog";
import { Users, Hash, User, Phone, Mail, MapPin, FileText } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import { ErrorMessage } from "../../components/ui/error-message";

export default function ContactForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "CUSTOMER",
    phone: "",
    email: "",
    address: "",
    notes: ""
  });

  const loadData = async () => {
    try {
        setIsLoading(true);
        setError(null);
        if (isEdit) {
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
        }
    } catch (e: any) {
        setError(e.message || "Gagal memuat data");
        toast.error(e.message || "Gagal memuat data");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
        title={isEdit ? `Edit Kontak: ${formData.code}` : "Tambah Kontak Baru"}
        module="Master > Kontak / Pelanggan / Supplier"
        status="DRAFT"
        onSave={handleSave}
        onCancel={() => navigate("/master/contacts")}
        onDelete={isEdit ? handleDelete : undefined}
        isSaving={isSaving}
        isEdit={isEdit}
      >
        {error ? (
          <div className="max-w-2xl mx-auto py-20 p-12 bg-white rounded-[3rem] shadow-xl border border-zinc-100">
            <ErrorMessage message={error} onRetry={loadData} />
          </div>
        ) : isLoading ? (
          <div className="max-w-6xl mx-auto p-12 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <Skeleton className="h-32 w-full rounded-[2rem]" />
                  <Skeleton className="h-32 w-full rounded-[2rem]" />
                  <Skeleton className="h-48 w-full col-span-2 rounded-[2rem]" />
              </div>
              <Skeleton className="h-96 w-full rounded-[3rem]" />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto p-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
                
                <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Type Kontak <span className="text-red-500 font-bold">*</span></Label>
                    <div className="relative">
                        <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                        <select 
                            className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner appearance-none"
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
                </div>

                <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Kode Kontak <span className="text-red-500 font-bold">*</span></Label>
                    <div className="relative">
                        <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                        <Input 
                            className="h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner" 
                            value={formData.code}
                            onChange={e => setFormData({...formData, code: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-3 col-span-full md:col-span-1">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Nama Kontak <span className="text-red-500 font-bold">*</span></Label>
                    <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                        <Input 
                            className="h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Telepon</Label>
                    <div className="relative">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                        <Input 
                            className="h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner" 
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                </div>
                
                 <div className="space-y-3 col-span-full">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                        <Input 
                            type="email"
                            className="h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner" 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-3 col-span-full">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Alamat</Label>
                    <div className="relative">
                        <MapPin className="absolute left-6 top-6 w-5 h-5 text-indigo-300 pointer-events-none" />
                        <textarea 
                            className="w-full h-32 bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] p-8 pl-16 text-sm font-medium text-zinc-700 outline-none focus:bg-white focus:border-indigo-100 transition-all italic placeholder:text-zinc-200 shadow-inner resize-none"
                            placeholder="Alamat lengkap..."
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                    </div>
                </div>
                
                <div className="space-y-3 col-span-full">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Catatan</Label>
                    <div className="relative">
                        <FileText className="absolute left-6 top-6 w-5 h-5 text-indigo-300 pointer-events-none" />
                        <textarea 
                            className="w-full h-32 bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] p-8 pl-16 text-sm font-medium text-zinc-700 outline-none focus:bg-white focus:border-indigo-100 transition-all italic placeholder:text-zinc-200 shadow-inner resize-none"
                            placeholder="Contoh: Pembayaran tempo 30 hari..."
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>
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
