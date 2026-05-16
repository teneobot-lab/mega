import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { User, Receipt, Calendar, CreditCard, FileText } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { TransactionCart, CartItem } from "../../components/transaction/TransactionCart";
import { salesApi, masterApi } from "../../lib/api-services";
import { Skeleton } from "../../components/ui/skeleton";
import { ErrorMessage } from "../../components/ui/error-message";

export default function SalesInvoiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<"DRAFT" | "POSTED" | "CANCELLED">("DRAFT");
  const [invoiceNumber, setInvoiceNumber] = useState("SI." + format(new Date(), "yyyyMMdd") + ".AUTO");
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [contactId, setContactId] = useState("");
  const [memo, setMemo] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [custData, itmData] = await Promise.all([
        masterApi.getContacts("CUSTOMER"),
        masterApi.getItems()
      ]);
      setCustomers(custData);
      if (custData.length > 0 && !contactId) setContactId(custData[0].id);
      setAvailableItems(itmData);

      if (isEdit) {
          const data = await salesApi.getInvoice(id!);
          setInvoiceNumber(data.number);
          setInvoiceDate(data.date?.split('T')[0]);
          setDueDate(data.dueDate?.split('T')[0] || data.date?.split('T')[0]);
          setContactId(data.contactId);
          setMemo(data.notes || "");
          setStatus(data.status);
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
      }
    } catch (e: any) {
        setError(e.message || "Gagal memuat data");
        toast.error(e.message || "Gagal memuat data");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!contactId) return toast.error("Silakan pilih pelanggan!");
    if (cartItems.length === 0) return toast.error("Minimal harus ada 1 item!");

    setIsSaving(true);
    try {
      const payload = {
          date: invoiceDate,
          dueDate,
          contactId: contactId,
          notes: memo,
          lines: cartItems.map(it => ({
            itemId: it.itemId,
            qty: it.qty,
            price: it.price
          }))
      };

      if (isEdit) {
          toast.info("Update invoice belum diimplementasikan di API service");
      } else {
          await salesApi.createInvoice(payload);
      }

      toast.success("Faktur Penjualan berhasil disimpan");
      navigate("/sales/invoice");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan ke server");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Faktur: ${invoiceNumber}` : "Buat Faktur Penjualan Baru"}
      module="Penjualan > Sales Invoice"
      status={status}
      onSave={handleSave}
      onCancel={() => navigate("/sales/invoice")}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      {error ? (
        <div className="max-w-2xl mx-auto py-20 p-12 bg-white rounded-[3rem] shadow-xl border border-zinc-100">
          <ErrorMessage message={error} onRetry={fetchData} />
        </div>
      ) : loading ? (
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
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Pelanggan <span className="text-red-500 font-bold">*</span></Label>
                <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                    <select 
                        className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner appearance-none"
                        value={contactId}
                        onChange={e => setContactId(e.target.value)}
                    >
                        <option value="">Pilih Pelanggan...</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">No. Invoice</Label>
                <div className="relative">
                    <Receipt className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                    <Input readOnly className="h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none shadow-inner" value={invoiceNumber} />
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Tgl Faktur <span className="text-red-500 font-bold">*</span></Label>
                <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                    <Input 
                        type="date" 
                        className="h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner" 
                        value={invoiceDate} 
                        onChange={e => setInvoiceDate(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="space-y-3">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Jatuh Tempo <span className="text-red-500 font-bold">*</span></Label>
                <div className="relative">
                    <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                    <Input 
                        type="date" 
                        className="h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-16 text-sm font-bold text-zinc-700 outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner" 
                        value={dueDate} 
                        onChange={e => setDueDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-3 col-span-full">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Catatan</Label>
                <div className="relative">
                    <FileText className="absolute left-6 top-6 w-5 h-5 text-indigo-300 pointer-events-none" />
                    <textarea 
                        className="w-full h-32 bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] p-8 pl-16 text-sm font-medium text-zinc-700 outline-none focus:bg-white focus:border-indigo-100 transition-all italic placeholder:text-zinc-200 shadow-inner resize-none"
                        placeholder="Contoh: Pembayaran akan dilakukan via transfer bank..."
                        value={memo}
                        onChange={e => setMemo(e.target.value)}
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
      )}
    </FullscreenFormLayout>
  );
}


