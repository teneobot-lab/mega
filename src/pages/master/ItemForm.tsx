import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { masterApi } from "../../lib/api-services";
import { ConfirmDeleteDialog } from "../../components/ui/confirm-delete-dialog";
import { Package, Tag, FileText, LayoutGrid, DollarSign, Box } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import { ErrorMessage } from "../../components/ui/error-message";

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [uoms, setUoms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    baseUomId: "",
    categoryId: null as string | null,
    buyPrice: 0,
    sellPrice: 0,
    minStock: 0,
    notes: ""
  });

  const loadData = async () => {
    try {
        setIsLoading(true);
        setError(null);
        const [uomData, catData] = await Promise.all([
            masterApi.getUoms(),
            masterApi.getCategories()
        ]);
        setUoms(uomData);
        setCategories(catData);
        
        if (isEdit) {
            const resData = await masterApi.getItem(id);
            setFormData(resData);
        } else if (uomData.length > 0) {
            setFormData(prev => ({...prev, baseUomId: uomData[0].id}));
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
    if (!formData.code || !formData.name || !formData.baseUomId) {
      toast.error("Kode, Nama, dan Satuan wajib diisi");
      return;
    }
    setIsSaving(true);
    try {
      if (isEdit) {
        await masterApi.updateItem(id, formData);
      } else {
        await masterApi.createItem(formData);
      }
      toast.success("Barang berhasil disimpan");
      navigate("/master/items");
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
      await masterApi.deleteItem(id!);
      toast.success("Barang berhasil dihapus");
      navigate("/master/items");
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
        title={isEdit ? `Edit Barang: ${formData.code}` : "Tambah Barang Baru"}
        module="Master > Produk / Barang"
        status="DRAFT"
        onSave={handleSave}
        onCancel={() => navigate("/master/items")}
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
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Kode Barang <span className="text-red-500 font-bold">*</span></Label>
                    <div className="relative">
                        <Tag className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                        <Input 
                            className="h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner" 
                            value={formData.code}
                            onChange={e => setFormData({...formData, code: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Nama Barang <span className="text-red-500 font-bold">*</span></Label>
                    <div className="relative">
                        <Package className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                        <Input 
                            className="h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Satuan Dasar <span className="text-red-500 font-bold">*</span></Label>
                    <div className="relative">
                        <Box className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                        <select 
                            className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner appearance-none"
                            value={formData.baseUomId}
                            onChange={e => setFormData({...formData, baseUomId: e.target.value})}
                        >
                            <option value="">- Pilih Satuan -</option>
                            {uoms.map(u => <option key={u.id} value={u.id}>{u.code} - {u.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Kategori</Label>
                    <div className="relative">
                        <LayoutGrid className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                        <select 
                            className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner appearance-none"
                            value={formData.categoryId || ""}
                            onChange={e => setFormData({...formData, categoryId: e.target.value || null})}
                        >
                            <option value="">- Pilih Kategori -</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                        </select>
                    </div>
                </div>
                
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Harga Beli</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                        <Input 
                            type="number"
                            className="h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner text-right" 
                            value={formData.buyPrice}
                            onChange={e => setFormData({...formData, buyPrice: Number(e.target.value)})}
                        />
                    </div>
                </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Harga Jual</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                        <Input 
                            type="number"
                            className="h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner text-right" 
                            value={formData.sellPrice}
                            onChange={e => setFormData({...formData, sellPrice: Number(e.target.value)})}
                        />
                    </div>
                </div>

                <div className="space-y-3 col-span-full">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Catatan</Label>
                    <div className="relative">
                        <FileText className="absolute left-6 top-6 w-5 h-5 text-indigo-300 pointer-events-none" />
                        <textarea 
                            className="w-full h-32 bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] p-8 pl-16 text-sm font-medium text-zinc-700 outline-none focus:bg-white focus:border-indigo-100 transition-all italic placeholder:text-zinc-200 shadow-inner resize-none"
                            placeholder="Contoh: Barang konsinyasi, dari supplier x..."
                            value={formData.notes || ""}
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
        title="Hapus Barang"
        description="Apakah Anda yakin ingin menghapus barang ini? Tindakan ini akan menghapus data barang secara permanen dari sistem."
        itemName={`${formData.code} - ${formData.name}`}
        isLoading={isDeleting}
      />
    </>
  );
}
