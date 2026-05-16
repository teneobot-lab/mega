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
  const [formData, setFormData] = useState({
    date: new Date().toISOString()?.split('T')[0],
    customerId: "",
    notes: "",
    status: "DRAFT"
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
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
      } finally {
          setLoading(false);
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
      <div className="max-w-6xl mx-auto p-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
            <div className="space-y-3">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Pelanggan <span className="text-red-500 font-bold">*</span></Label>
                <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                    <select 
                        className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner appearance-none"
                        value={formData.customerId}
                        onChange={e => setFormData({...formData, customerId: e.target.value})}
                    >
                        <option value="">Pilih Pelanggan...</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.category || 'Personal'}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Tanggal Pesanan <span className="text-red-500 font-bold">*</span></Label>
                <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                    <Input 
                      type="date"
                      className="h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner" 
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                </div>
            </div>

            <div className="space-y-3 col-span-full">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Memo Transaksi</Label>
                <div className="relative">
                    <FileText className="absolute left-6 top-6 w-5 h-5 text-indigo-300 pointer-events-none" />
                    <textarea 
                        className="w-full h-32 bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] p-8 pl-16 text-sm font-medium text-zinc-700 outline-none focus:bg-white focus:border-indigo-100 transition-all italic placeholder:text-zinc-200 shadow-inner resize-none"
                        placeholder="Contoh: Pesanan untuk dikirim ke cabang utama..."
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                </div>
            </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
            <TransactionCart 
                items={cartItems}
                availableItems={availableItems}
                showPrice={true}
                onChange={setCartItems}
            />
        </div>
      </div>
    </FullscreenFormLayout>
  );
}


