import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Search, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { EditableTable } from "../../components/fullscreen-form/EditableTable";
import { useFullscreenForm } from "../../hooks/use-fullscreen-form";

export default function SalesInvoiceForm() {
  const navigate = useNavigate();
  const { isSaving, isAutoSaving, setIsSaving, isDirty, setIsDirty, handleCancel } = useFullscreenForm({
    onAutoSave: async () => {
      // Simulate auto-save
      console.log("Auto-saving draft...");
      await new Promise(r => setTimeout(r, 1000));
    }
  });
  
  const [status, setStatus] = useState<"DRAFT" | "POSTED" | "CANCELLED">("DRAFT");
  const [invoiceNumber, setInvoiceNumber] = useState("SI." + format(new Date(), "yyyyMMdd") + ".AUTO");
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customer, setCustomer] = useState<{id: string, name: string} | null>(null);
  const [memo, setMemo] = useState("");
  const [lines, setLines] = useState<any[]>([]);
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [isItemSearchOpen, setIsItemSearchOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, itmRes] = await Promise.all([
          fetch("/api/master/contacts?type=CUSTOMER", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}),
          fetch("/api/master/items", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }})
        ]);
        if(custRes.ok) setCustomers(await custRes.json());
        if(itmRes.ok) setItems(await itmRes.json());
      } catch (e) {}
    };
    fetchData();
  }, []);

  const columns = [
    { key: 'itemCode', label: 'Item Code', width: '150px', type: 'text' as const },
    { key: 'itemName', label: 'Item Name', width: '300px', type: 'text' as const },
    { key: 'qty', label: 'Qty', width: '80px', type: 'number' as const, align: 'center' as const },
    { key: 'unit', label: 'Unit', width: '80px', type: 'text' as const, align: 'center' as const },
    { key: 'price', label: 'Price', width: '150px', type: 'number' as const, align: 'right' as const },
    { key: 'total', label: 'Total', width: '150px', type: 'readonly' as const, align: 'right' as const },
  ];

  const handleTableChange = (newData: any[]) => {
    const updated = newData.map(row => ({
      ...row,
      total: (row.qty || 0) * (row.price || 0)
    }));
    setLines(updated);
    setIsDirty(true);
  };

  const calculateTotal = () => {
    return lines.reduce((acc, curr) => acc + (curr.total || 0), 0);
  };

  const handleSave = async () => {
    if (!customer) return toast.error("Silakan pilih pelanggan!");
    if (lines.length === 0) return toast.error("Minimal harus ada 1 item!");

    setIsSaving(true);
    try {
      const res = await fetch("/api/sales/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          date: invoiceDate,
          dueDate,
          contactId: customer.id,
          notes: memo,
          lines: lines.map(l => ({
            itemId: l.itemId || items.find(i => i.code === l.itemCode)?.id,
            qty: l.qty,
            price: l.price
          }))
        })
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

  return (
    <FullscreenFormLayout
      title={invoiceNumber}
      module="Penjualan > Faktur Penjualan"
      status={status}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
      isAutoSaving={isAutoSaving}
      isEdit={false}
    >
      <div className="space-y-6">
        {/* HEADER SECTION */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm grid grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pelanggan <span className="text-red-500">*</span></Label>
            <div className="flex gap-1">
              <div 
                className="flex-1 h-8 bg-zinc-50 border border-zinc-300 rounded px-3 flex items-center text-xs font-medium cursor-pointer hover:bg-zinc-100 transition-colors"
                onClick={() => setIsCustomerSearchOpen(true)}
              >
                {customer?.name || "Pilih Pelanggan..."}
              </div>
              <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0 border-zinc-300" onClick={() => setIsCustomerSearchOpen(true)}>
                <Search className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tgl. Faktur <span className="text-red-500">*</span></Label>
            <Input 
              type="date" 
              className="h-8 text-xs border-zinc-300" 
              value={invoiceDate} 
              onChange={e => { setInvoiceDate(e.target.value); setIsDirty(true); }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tgl. Jatuh Tempo</Label>
            <Input 
              type="date" 
              className="h-8 text-xs border-zinc-300" 
              value={dueDate} 
              onChange={e => { setDueDate(e.target.value); setIsDirty(true); }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No. Invoice</Label>
            <Input 
              readOnly 
              className="h-8 text-xs border-zinc-300 bg-zinc-50 font-bold text-[#1e3a5f]" 
              value={invoiceNumber} 
            />
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest">Daftar Barang & Jasa</h3>
          </div>
          <EditableTable 
            columns={columns}
            data={lines}
            onChange={handleTableChange}
          />
        </div>

        {/* FOOTER SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Keterangan</Label>
              <textarea 
                className="w-full h-24 bg-white border border-zinc-200 rounded-xl p-4 text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                placeholder="Tambahkan catatan untuk faktur ini..."
                value={memo}
                onChange={e => { setMemo(e.target.value); setIsDirty(true); }}
              />
            </div>
            
            <Tabs defaultValue="jurnal" className="w-full">
              <TabsList className="bg-zinc-100 p-1 rounded-lg w-fit">
                <TabsTrigger value="jurnal" className="text-[10px] font-bold uppercase py-1.5 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Jurnal</TabsTrigger>
                <TabsTrigger value="history" className="text-[10px] font-bold uppercase py-1.5 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">History</TabsTrigger>
                <TabsTrigger value="related" className="text-[10px] font-bold uppercase py-1.5 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Related</TabsTrigger>
              </TabsList>
              <TabsContent value="jurnal" className="mt-4 border rounded-xl overflow-hidden bg-white min-h-[150px]">
                <table className="w-full text-xs">
                  <thead className="bg-zinc-50 border-b">
                    <tr className="h-8 text-[10px] font-bold uppercase text-zinc-400">
                      <th className="px-4 text-left">Akun</th>
                      <th className="px-4 text-right">Debit</th>
                      <th className="px-4 text-right">Kredit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="h-12 border-b border-zinc-50">
                      <td className="px-4 font-medium">Piutang Usaha (1-10001)</td>
                      <td className="px-4 text-right text-blue-600 font-bold">Rp {calculateTotal().toLocaleString()}</td>
                      <td className="px-4 text-right">0</td>
                    </tr>
                    <tr className="h-12 border-b border-zinc-50">
                      <td className="px-4 font-medium">Pendapatan Penjualan (4-10001)</td>
                      <td className="px-4 text-right">0</td>
                      <td className="px-4 text-right text-green-600 font-bold">Rp {calculateTotal().toLocaleString()}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-zinc-50 font-black">
                     <tr className="h-10">
                        <td className="px-4 uppercase">Total</td>
                        <td className="px-4 text-right">Rp {calculateTotal().toLocaleString()}</td>
                        <td className="px-4 text-right">Rp {calculateTotal().toLocaleString()}</td>
                     </tr>
                  </tfoot>
                </table>
              </TabsContent>
              <TabsContent value="history" className="mt-4 border rounded-xl overflow-hidden bg-white min-h-[150px]">
                <div className="p-4 space-y-4">
                  <div className="flex items-start gap-4 border-l-2 border-blue-500 pl-4 relative">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1e3a5f]">Dokumen Dibuat</p>
                      <p className="text-xs text-zinc-500">Oleh <span className="font-bold text-zinc-700">Admin</span> pada 15 Mei 2026, 10:00</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 border-l-2 border-zinc-200 pl-4 relative">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-zinc-400" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-medium">Perubahan Terakhir</p>
                      <p className="text-xs text-zinc-500 font-medium italic">Belum ada perubahan data</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="related" className="mt-4 border rounded-xl overflow-hidden bg-white min-h-[150px]">
                <div className="p-8 text-center flex flex-col items-center gap-2">
                  <Search className="w-8 h-8 text-zinc-200" />
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Tidak ada dokumen terkait</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 p-8 rounded-3xl space-y-4">
               <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-xs font-bold uppercase tracking-widest leading-none">Subtotal</span>
                  <span className="text-sm font-medium">Rp {calculateTotal().toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-xs font-bold uppercase tracking-widest leading-none">Pajak (11%)</span>
                  <span className="text-sm font-medium">Rp 0</span>
               </div>
               <div className="pt-4 border-t border-[#1e3a5f]/10 flex justify-between items-center">
                  <span className="text-sm font-black text-[#1e3a5f] uppercase tracking-widest">Total Faktur</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-[#1e3a5f] tracking-tighter tabular-nums underline underline-offset-8 decoration-red-500">
                      Rp {calculateTotal().toLocaleString()}
                    </span>
                  </div>
               </div>
            </div>
            
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl italic text-[10px] text-zinc-500 flex gap-2">
               <span className="font-bold text-zinc-400 min-w-fit uppercase">Terbilang:</span>
               <span className="font-medium text-zinc-700"># Dua Juta Lima Ratus Ribu Rupiah #</span>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER SEARCH */}
      <Dialog open={isCustomerSearchOpen} onOpenChange={setIsCustomerSearchOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Cari Pelanggan</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Cari Kode atau Nama Pelanggan..." autoFocus />
            <div className="border rounded-lg max-h-[300px] overflow-auto">
              <table className="w-full text-xs">
                <thead className="bg-zinc-50 sticky top-0">
                  <tr className="h-8 text-left uppercase text-zinc-400 text-[10px] font-bold">
                    <th className="px-4">Kode</th>
                    <th className="px-4">Nama</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr 
                      key={c.id} 
                      className="h-10 border-b cursor-pointer hover:bg-blue-50"
                      onClick={() => { setCustomer(c); setIsCustomerSearchOpen(false); setIsDirty(true); }}
                    >
                      <td className="px-4 font-bold text-blue-600">{c.code}</td>
                      <td className="px-4 font-medium">{c.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </FullscreenFormLayout>
  );
}

