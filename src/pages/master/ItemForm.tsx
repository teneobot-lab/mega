import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { masterApi } from "../../lib/api-services";
import { ConfirmDeleteDialog } from "../../components/ui/confirm-delete-dialog";

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
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

  useEffect(() => {
    const loadInitial = async () => {
        try {
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
            toast.error(e.message || "Gagal memuat data");
        } finally {
            setIsLoading(false);
        }
    };
    loadInitial();
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
        title={isEdit ? "Edit Barang" : "Tambah Barang"}
        module="MASTER-ITEM"
        status="DRAFT"
        onSave={handleSave}
        onCancel={() => navigate("/master/items")}
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
                      <Label className="ac-label">Kode Barang <span className="text-red-500">*</span></Label>
                      <Input 
                          className="ac-input font-bold" 
                          value={formData.code}
                          onChange={e => setFormData({...formData, code: e.target.value})}
                      />
                  </div>
                  <div className="ac-field-group col-span-3">
                      <Label className="ac-label">Nama Barang <span className="text-red-500">*</span></Label>
                      <Input 
                          className="ac-input" 
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                  </div>
                  <div className="ac-field-group">
                      <Label className="ac-label">Satuan Dasar <span className="text-red-500">*</span></Label>
                      <select 
                          className="ac-input"
                          value={formData.baseUomId}
                          onChange={e => setFormData({...formData, baseUomId: e.target.value})}
                      >
                          <option value="">- Pilih Satuan -</option>
                          {uoms.map(u => <option key={u.id} value={u.id}>{u.code} - {u.name}</option>)}
                      </select>
                  </div>
                  <div className="ac-field-group col-span-2">
                      <Label className="ac-label">Kategori</Label>
                      <select 
                          className="ac-input"
                          value={formData.categoryId || ""}
                          onChange={e => setFormData({...formData, categoryId: e.target.value || null})}
                      >
                          <option value="">- Pilih Kategori -</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                      </select>
                  </div>

                  <div className="ac-field-group">
                      <Label className="ac-label">Harga Beli</Label>
                      <Input 
                          type="number"
                          className="ac-input text-right" 
                          value={formData.buyPrice}
                          onChange={e => setFormData({...formData, buyPrice: Number(e.target.value)})}
                      />
                  </div>
                  <div className="ac-field-group">
                      <Label className="ac-label">Harga Jual</Label>
                      <Input 
                          type="number"
                          className="ac-input text-right" 
                          value={formData.sellPrice}
                          onChange={e => setFormData({...formData, sellPrice: Number(e.target.value)})}
                      />
                  </div>
                  <div className="ac-field-group">
                      <Label className="ac-label">Stok Minimum</Label>
                      <Input 
                          type="number"
                          className="ac-input text-right" 
                          value={formData.minStock}
                          onChange={e => setFormData({...formData, minStock: Number(e.target.value)})}
                      />
                  </div>
                  <div className="ac-field-group col-span-4">
                      <Label className="ac-label">Catatan</Label>
                      <Input 
                          className="ac-input" 
                          value={formData.notes || ""}
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
        title="Hapus Barang"
        description="Apakah Anda yakin ingin menghapus barang ini? Tindakan ini akan menghapus data barang secara permanen dari sistem."
        itemName={`${formData.code} - ${formData.name}`}
        isLoading={isDeleting}
      />
    </>
  );
}
