import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Search, Plus, User, Receipt, Calendar, CreditCard, ChevronDown, History, MessageSquare, Tag } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { TransactionCart, CartItem } from "../../components/transaction/TransactionCart";
import { useFullscreenForm } from "../../hooks/use-fullscreen-form";

export default function SalesInvoiceForm() {
  const navigate = useNavigate();
  const { isSaving, isAutoSaving, setIsSaving, isDirty, setIsDirty, handleCancel } = useFullscreenForm({
    onAutoSave: async () => {
      console.log("Auto-saving sales invoice draft...");
    }
  });
  
  const [status, setStatus] = useState<"DRAFT" | "POSTED" | "CANCELLED">("DRAFT");
  const [invoiceNumber, setInvoiceNumber] = useState("SI." + format(new Date(), "yyyyMMdd") + ".AUTO");
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [contactId, setContactId] = useState("");
  const [memo, setMemo] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, itmRes] = await Promise.all([
          fetch("/api/master/contacts?type=CUSTOMER", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}),
          fetch("/api/master/items", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }})
        ]);
        if(custRes.ok) {
            const data = await custRes.json();
            setCustomers(data);
            if (data.length > 0) setContactId(data[0].id);
        }
        if(itmRes.ok) setAvailableItems(await itmRes.json());
      } catch (e) {}
    };
    fetchData();
  }, []);

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, curr) => acc + (curr.total || 0), 0);
  };

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

      const res = await fetch("/api/sales/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Faktur Penjualan berhasil disimpan");
        setIsDirty(false);
        navigate("/sales/invoice");
      } else {
        throw new Error("Gagal menyimpan");
      }
    } catch (e) {
      toast.error("Gagal menyimpan ke server");
    } finally {
      setIsSaving(false);
    }
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  return (
    <FullscreenFormLayout
      title={invoiceNumber}
      module="Penjualan > Sales Invoice"
      status={status}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
      isAutoSaving={isAutoSaving}
      isEdit={false}
    >
      <div className="p-2 space-y-2">
        <div className="ac-form-header grid grid-cols-4 gap-4">
            <div className="ac-field-group">
                <Label className="ac-label">Pelanggan <span className="text-red-500">*</span></Label>
                <select 
                    className="ac-input"
                    value={contactId}
                    onChange={e => { setContactId(e.target.value); setIsDirty(true); }}
                >
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
            </div>
            
            <div className="ac-field-group">
                <Label className="ac-label">No. Invoice</Label>
                <Input readOnly className="ac-input" value={invoiceNumber} />
            </div>

            <div className="ac-field-group">
                <Label className="ac-label">Tgl Faktur</Label>
                <Input 
                    type="date" 
                    className="ac-input" 
                    value={invoiceDate} 
                    onChange={e => { setInvoiceDate(e.target.value); setIsDirty(true); }}
                />
            </div>
            
            <div className="ac-field-group">
                <Label className="ac-label">Jatuh Tempo</Label>
                <Input 
                    type="date" 
                    className="ac-input" 
                    value={dueDate} 
                    onChange={e => { setDueDate(e.target.value); setIsDirty(true); }}
                />
            </div>

            <div className="ac-field-group col-span-4">
                <Label className="ac-label">Catatan</Label>
                <Input 
                    className="ac-input"
                    placeholder="Catatan..."
                    value={memo}
                    onChange={e => { setMemo(e.target.value); setIsDirty(true); }}
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


