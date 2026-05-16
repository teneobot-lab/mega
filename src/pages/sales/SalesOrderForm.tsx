import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { TransactionCart, CartItem } from "../../components/transaction/TransactionCart";
import { ShoppingCart, Calendar, User, FileText, BadgeCheck } from "lucide-react";
import { salesApi, masterApi } from "../../lib/api-services";

export default function SalesOrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString()?.split('T')[0],
    customerId: "",
    notes: "",
    status: "DRAFT"
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  useEffect(() => {
    // Load dependencies
    const loadData = async () => {
      try {
        const [custs, itms] = await Promise.all([
          masterApi.getContacts("CUSTOMER"),
          masterApi.getItems()
        ]);
        setCustomers(custs);
        setAvailableItems(itms);

        if (isEdit) {
          const data = await salesApi.getOrder(id!);
          setFormData({
            date: data.date?.split('T')[0],
            customerId: data.customerId,
            notes: data.notes || "",
            status: data.status
          });
          setCartItems((data.Lines || []).map((l: any) => ({
            id: l.id,
            itemId: l.itemId,
            name: l.item?.name || 'Item',
            code: l.item?.code || '',
            uom: l.item?.baseUom?.name || 'Unit',
            qty: l.qty,
            price: l.price,
            total: l.qty * l.price
          })));
        } else {
           if(custs.length > 0) setFormData(prev => ({...prev, customerId: custs[0].id}));
        }
      } catch (e: any) {
          toast.error(e.message || "Gagal memuat data pendukung");
      }
    };
    loadData();
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!formData.customerId) return toast.error("Pelanggan wajib diisi");
    if (cartItems.length === 0) return toast.error("Minimal 1 barang pesanan");

    setIsSaving(true);
    try {
      const payload = {
          ...formData,
          lines: cartItems.map(it => ({
              itemId: it.itemId,
              qty: it.qty,
              price: it.price
          }))
      };

      if (isEdit) {
        await salesApi.updateOrder(id!, payload);
      } else {
        await salesApi.createOrder(payload);
      }

      toast.success(`Pesanan Penjualan berhasil disimpan`);
      navigate("/sales/so");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan ke server");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Pesanan #${id}` : "Pesanan Penjualan Baru"}
      module="Penjualan > Sales Order"
      status={formData.status as any}
      onSave={handleSave}
      onCancel={() => navigate("/sales/so")}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      <div className="p-2 space-y-2">
        <div className="ac-form-header grid grid-cols-4 gap-4">
            <div className="ac-field-group">
                <Label className="ac-label">Pelanggan <span className="text-red-500">*</span></Label>
                <select 
                    className="ac-input"
                    value={formData.customerId}
                    onChange={e => { setFormData({...formData, customerId: e.target.value}); setIsDirty(true); }}
                >
                    <option value="">Pilih Pelanggan...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.category || 'Personal'}</option>)}
                </select>
            </div>

            <div className="ac-field-group">
                <Label className="ac-label">Tanggal Pesanan</Label>
                <Input 
                  type="date"
                  className="ac-input" 
                  value={formData.date}
                  onChange={e => { setFormData({...formData, date: e.target.value}); setIsDirty(true); }}
                />
            </div>

            <div className="ac-field-group col-span-2">
                <Label className="ac-label">Memo Transaksi</Label>
                <Input 
                  className="ac-input" 
                  placeholder="Keterangan..."
                  value={formData.notes}
                  onChange={e => { setFormData({...formData, notes: e.target.value}); setIsDirty(true); }}
                />
            </div>
        </div>

        <div className="ac-table-container">
            <TransactionCart 
                items={cartItems}
                availableItems={availableItems}
                showPrice={true}
                onChange={(items) => {
                    setCartItems(items);
                    setIsDirty(true);
                }}
            />
        </div>
      </div>
    </FullscreenFormLayout>
  );
}

