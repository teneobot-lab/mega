import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { useFullscreenForm } from "../../hooks/use-fullscreen-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Wallet, Calendar, FileText, Landmark, Search, History, Users, ArrowRight, ShieldCheck, CreditCard, ChevronRight, Zap, Info, ArrowUpRight } from "lucide-react";

export default function SalesPaymentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const { isSaving, isAutoSaving, setIsSaving, isDirty, setIsDirty, handleCancel } = useFullscreenForm({
    onAutoSave: async () => {
      console.log("Auto-saving sales payment transaction...");
    }
  });
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    contactId: "",
    invoiceId: "",
    accountId: "",
    amount: 0,
    notes: "",
    status: "PAID"
  });

  const [invoices, setInvoices] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [invRes, accRes] = await Promise.all([
          fetch("/api/sales/invoices", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}),
          fetch("/api/master/accounts", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}),
        ]);
        const allInvs = await invRes.json();
        const allAccs = await accRes.json();
        
        const unpaidInvs = allInvs.filter((i: any) => i.balance > 0 || i.id === formData.invoiceId);
        const cashBankAccs = allAccs.filter((a: any) => a.type === "ASSET" && (a.name.toLowerCase().includes("kas") || a.name.toLowerCase().includes("bank") || a.code.startsWith('111')));
        
        setInvoices(unpaidInvs);
        setAccounts(cashBankAccs);

        if (isEdit) {
          const res = await fetch(`/api/sales/payments/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          const data = await res.json();
          setFormData({
            date: data.date.split('T')[0],
            contactId: data.contactId,
            invoiceId: data.Lines?.[0]?.invoiceId || "",
            accountId: data.Journals?.[0]?.Entries?.find((e: any) => e.debit > 0)?.accountId || "",
            amount: data.amount,
            notes: data.notes || "",
            status: "PAID"
          });
        } else {
          if (unpaidInvs.length > 0) {
            setFormData(prev => ({ 
                ...prev, 
                invoiceId: unpaidInvs[0].id,
                contactId: unpaidInvs[0].contactId,
                amount: unpaidInvs[0].balance 
            }));
          }
          if (cashBankAccs.length > 0) setFormData(prev => ({ ...prev, accountId: cashBankAccs[0].id }));
        }
      } catch (e) {}
    };
    loadData();
  }, [id, isEdit]);

  const handleInvoiceChange = (invId: string) => {
    const selected = invoices.find(i => i.id === invId);
    if (selected) {
      setFormData({
        ...formData,
        invoiceId: invId,
        contactId: selected.contactId,
        amount: selected.balance
      });
      setIsDirty(true);
    }
  };

  const handleSave = async () => {
    if (!formData.invoiceId || !formData.accountId || formData.amount <= 0) {
      return toast.error("Invoice target, Akun Kas, dan Jumlah Pembayaran wajib diisi");
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/sales/payments" + (isEdit ? `/${id}` : ""), {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(`Penerimaan piutang berhasil ${isEdit ? 'diperbarui' : 'finalized'}`);
        setIsDirty(false);
        navigate("/sales/payment");
      } else {
        throw new Error("Gagal menyimpan transaksi pembayaran");
      }
    } catch (e: any) {
      toast.error(e.message || "Kesalahan transmisi jaringan ke server");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedInvoice = invoices.find(i => i.id === formData.invoiceId);

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Receipt Note #${id}` : "Penerimaan Pembayaran Piutang (AR Settlement) Baru"}
      module="Sales > Sales Payment Entry"
      status={formData.status as any}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
      isAutoSaving={isAutoSaving}
      isEdit={isEdit}
    >
      <div className="max-w-6xl mx-auto space-y-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Settlement Target & Account */}
            <div className="lg:col-span-12 xl:col-span-8 space-y-10">
                <div className="bg-white p-12 rounded-[3.5rem] border border-zinc-200 shadow-2xl relative overflow-hidden group ring-1 ring-zinc-50">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                        <FileText className="w-80 h-80 -rotate-12 text-[#1e3a5f]" />
                    </div>
                    
                    <div className="space-y-10 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#1e3a5f] flex items-center justify-center text-white shadow-xl ring-4 ring-[#1e3a5f]/10">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-[#1e3a5f] italic leading-none">Receivable Liquidation</h3>
                                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest pl-1">Matching payments to open invoices</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Target Open Invoice <span className="text-red-500">*</span></Label>
                            <div className="relative group/sel">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none group-focus-within/sel:text-[#1e3a5f] transition-colors" />
                                <select 
                                    className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] pl-16 pr-8 text-base font-black text-[#1e3a5f] outline-none transition-all appearance-none italic focus:bg-white shadow-inner"
                                    value={formData.invoiceId}
                                    onChange={e => handleInvoiceChange(e.target.value)}
                                >
                                    <option value="">Cari & Pilih Faktur Piutang...</option>
                                    {invoices.map(i => (
                                        <option key={i.id} value={i.id}>
                                            {i.invNumber} | {i.contact?.name.toUpperCase()} (SISA: Rp {i.balance.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedInvoice && (
                            <div className="bg-zinc-950 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group/card border-b border-white/5">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Users className="w-24 h-24" />
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block italic">Account Partner</span>
                                        <span className="text-base font-black uppercase tracking-tight text-white block truncate">{selectedInvoice.contact?.name}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block italic">Invoice Value</span>
                                        <span className="text-base font-black tracking-tight text-white block tabular-nums">Rp {selectedInvoice.total.toLocaleString()}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block italic">Current Balance</span>
                                        <span className="text-base font-black tracking-tight text-rose-400 block tabular-nums">Rp {selectedInvoice.balance.toLocaleString()}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block italic">Payment Ratio</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-black text-emerald-400 italic leading-none">{Math.round((formData.amount / selectedInvoice.total) * 100)}%</span>
                                            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-12 rounded-[3.5rem] border border-zinc-200 shadow-2xl relative overflow-hidden group ring-1 ring-zinc-50">
                    <div className="space-y-10 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-xl ring-4 ring-indigo-500/10">
                                <Landmark className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-indigo-600 italic leading-none">Destination Account</h3>
                                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest pl-1">Where the funds will be deposited</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Received to (CASH/BANK ACCOUNT) <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                                <select 
                                    className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] pl-16 pr-8 text-lg font-black text-[#1e3a5f] outline-none transition-all appearance-none italic focus:bg-white shadow-inner"
                                    value={formData.accountId}
                                    onChange={e => { setFormData({...formData, accountId: e.target.value}); setIsDirty(true); }}
                                >
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name.toUpperCase()}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-6 italic flex items-center gap-3">
                                 <Zap className="w-3.5 h-3.5 text-indigo-400" /> Transaction Memo
                            </Label>
                            <textarea 
                                className="w-full h-28 bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] p-8 text-sm font-medium text-zinc-500 outline-none focus:bg-white focus:border-indigo-100 transition-all italic placeholder:text-zinc-200 shadow-inner resize-none"
                                placeholder="Misal: Pelunasan sisa bayar (70%) via Transfer BCA operasional..."
                                value={formData.notes}
                                onChange={e => { setFormData({...formData, notes: e.target.value}); setIsDirty(true); }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Execution & Summary */}
            <div className="lg:col-span-12 xl:col-span-4 space-y-10">
                <div className="bg-[#1e3a5f] p-12 rounded-[3.5rem] text-white shadow-[0_35px_60px_-15px_rgba(30,58,95,0.4)] space-y-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
                    
                    <div className="space-y-2 relative z-10 pb-8 border-b border-white/5">
                        <Label className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] flex items-center gap-3 pl-1 italic leading-none mb-2">
                             <Calendar className="w-4 h-4 text-blue-300" /> Receipt Date
                        </Label>
                        <Input 
                            type="date"
                            className="bg-white/10 border-2 border-white/5 h-16 text-xl font-black text-white focus:bg-white/20 transition-all rounded-[1.5rem] px-8 outline-none focus:ring-0" 
                            value={formData.date}
                            onChange={e => { setFormData({...formData, date: e.target.value}); setIsDirty(true); }}
                        />
                    </div>

                    <div className="space-y-5 relative z-10">
                        <Label className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] flex items-center gap-3 pl-1 italic leading-none mb-1">
                            <Wallet className="w-4 h-4 text-emerald-400" /> Settlement Value (IDR)
                        </Label>
                        <div className="relative">
                            <span className="absolute left-0 bottom-2 text-4xl font-black text-emerald-400/50 italic leading-none">Rp</span>
                            <input 
                                type="number"
                                className="w-full bg-transparent border-none p-0 pl-16 h-20 text-7xl font-black italic tracking-tighter focus:ring-0 text-white tabular-nums outline-none placeholder:text-white/10"
                                placeholder="0"
                                value={formData.amount}
                                onChange={e => { setFormData({...formData, amount: Number(e.target.value)}); setIsDirty(true); }}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-10 border-t border-white/5 relative z-10">
                        <div className="flex justify-between items-center text-[10px] font-black opacity-40 uppercase tracking-[0.4em] italic leading-none">
                            <span>Remaining AR Balance</span>
                            <span className="text-rose-400 drop-shadow-lg">Rp {(selectedInvoice ? (selectedInvoice.balance - formData.amount) : 0).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden shadow-inner ring-1 ring-white/5">
                            <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
                                style={{ width: `${selectedInvoice ? Math.min(100, (formData.amount / selectedInvoice.balance) * 100) : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-emerald-50/50 p-10 rounded-[3.5rem] border border-emerald-100 shadow-xl space-y-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:bg-white transition-colors cursor-default">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white flex items-center justify-center text-emerald-500 shadow-xl border border-emerald-50 group-hover:rotate-12 transition-transform">
                        <Zap className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-800 italic">Real-Time Jurnal Sync</h4>
                        <p className="text-[10px] font-bold text-emerald-700/50 leading-relaxed uppercase italic max-w-[200px]">
                            Post-processing akan mendebet akun tujuan dan mengkredit akun piutang pelanggan secara instan.
                        </p>
                    </div>
                </div>

                <div className="bg-zinc-50 p-8 rounded-[2.5rem] border-2 border-dashed border-zinc-100 flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-300">
                        <Info className="w-6 h-6" />
                    </div>
                    <p className="text-[9px] font-black text-zinc-300 uppercase italic tracking-widest leading-relaxed">
                        Data ini diproteksi oleh protokol audit trail. Setiap perubahan akan dicatat ke dalam database log histori.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </FullscreenFormLayout>
  );
}
