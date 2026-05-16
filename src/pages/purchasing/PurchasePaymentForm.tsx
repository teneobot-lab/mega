import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Wallet, Calendar, FileText, Landmark, Search, History, ShieldCheck, CreditCard, ChevronRight, Zap, Info, ArrowUpRight, Users } from "lucide-react";
import { purchasingApi, masterApi } from "../../lib/api-services";

export default function PurchasePaymentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const [isSaving, setIsSaving] = useState(false);
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
        const [allInvs, allAccs] = await Promise.all([
          purchasingApi.getInvoices(),
          masterApi.getAccounts(),
        ]);
        
        const unpaidInvs = allInvs.filter((i: any) => i.balance > 0 || i.id === formData.invoiceId);
        const cashBankAccs = allAccs.filter((a: any) => a.type === "ASSET" && (a.name.toLowerCase().includes("kas") || a.name.toLowerCase().includes("bank") || a.code.startsWith('111')));
        
        setInvoices(unpaidInvs);
        setAccounts(cashBankAccs);

        if (isEdit) {
          const data = await purchasingApi.getPayment(id!);
          setFormData({
            date: data.date.split('T')[0],
            contactId: data.contactId,
            invoiceId: data.Lines?.[0]?.invoiceId || "",
            accountId: data.Journals?.[0]?.Entries?.find((e: any) => e.credit > 0)?.accountId || "",
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
      } catch (e: any) {
          toast.error(e.message || "Gagal memuat data pendukung");
      }
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
    }
  };

  const handleSave = async () => {
    if (!formData.invoiceId || !formData.accountId || formData.amount <= 0) {
      return toast.error("Faktur pembelian target, Akun Kas sumber, dan Jumlah Pembayaran wajib diisi");
    }

    setIsSaving(true);
    try {
      if (isEdit) {
        await purchasingApi.updatePayment(id!, formData);
      } else {
        await purchasingApi.createPayment(formData);
      }

      toast.success(`Pembayaran hutang berhasil ${isEdit ? 'diperbarui' : 'finalized'}`);
      navigate("/purchasing/payment");
    } catch (e: any) {
      toast.error(e.message || "Gagal melakukan transmisi data ke server");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedInvoice = invoices.find(i => i.id === formData.invoiceId);

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Settlement Note #${id}` : "Pembayaran Hutang (AP Settlement) Baru"}
      module="Purchasing > Purchase Payment Entry"
      status={formData.status as any}
      onSave={handleSave}
      onCancel={() => navigate("/purchasing/payment")}
      isSaving={isSaving}
      isEdit={isEdit}
    >
      <div className="max-w-6xl mx-auto space-y-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Box: Debt Target & Account Sumber */}
            <div className="lg:col-span-12 xl:col-span-8 space-y-10">
                <div className="bg-white p-12 rounded-[3.5rem] border border-zinc-200 shadow-2xl relative overflow-hidden group ring-1 ring-zinc-50">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                        <FileText className="w-80 h-80 -rotate-12 text-[#1e3a5f]" />
                    </div>
                    
                    <div className="space-y-10 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-xl ring-4 ring-rose-600/10">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-rose-700 italic leading-none">Liability Settlement</h3>
                                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest pl-1">Targeting outstanding purchase invoices</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic text-rose-500">Target Unpaid Invoice <span className="text-red-500">*</span></Label>
                            <div className="relative group/sel">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300 pointer-events-none group-focus-within/sel:text-rose-600 transition-colors" />
                                <select 
                                    className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] pl-16 pr-8 text-base font-black text-[#1e3a5f] outline-none transition-all appearance-none italic focus:bg-white shadow-inner"
                                    value={formData.invoiceId}
                                    onChange={e => handleInvoiceChange(e.target.value)}
                                >
                                    <option value="">Cari Faktur Hutang Supplier...</option>
                                    {invoices.map(i => (
                                        <option key={i.id} value={i.id}>
                                            {i.invNumber} | {i.contact?.name.toUpperCase()} (OUTSTANDING: Rp {i.balance.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedInvoice && (
                            <div className="bg-rose-50/50 p-10 rounded-[2.5rem] border-2 border-rose-100 shadow-inner relative overflow-hidden group/card">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Users className="w-24 h-24 text-rose-600" />
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest block italic">Vendor / Partner</span>
                                        <span className="text-base font-black uppercase tracking-tight text-rose-900 block truncate">{selectedInvoice.contact?.name}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest block italic">Purchased Asset Value</span>
                                        <span className="text-base font-black tracking-tight text-zinc-600 block tabular-nums">Rp {selectedInvoice.total.toLocaleString()}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block italic">Debt Balance</span>
                                        <span className="text-base font-black tracking-tight text-rose-600 block tabular-nums leading-none">Rp {selectedInvoice.balance.toLocaleString()}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block italic">Liquidity Impact</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-black text-rose-400 italic leading-none">-{Math.round((formData.amount / selectedInvoice.total) * 100)}%</span>
                                            <ArrowUpRight className="w-4 h-4 text-rose-300" />
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
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl ring-4 ring-emerald-500/10">
                                <Landmark className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-emerald-600 italic leading-none">Disbursement Account</h3>
                                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest pl-1">Account used to fund this settlement</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic text-emerald-600">Funded from (CASH/BANK SOURCE) <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300 pointer-events-none" />
                                <select 
                                    className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] pl-16 pr-8 text-lg font-black text-[#1e3a5f] outline-none transition-all appearance-none italic focus:bg-white shadow-inner"
                                    value={formData.accountId}
                                    onChange={e => { setFormData({...formData, accountId: e.target.value}); }}
                                >
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name.toUpperCase()}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-6 italic flex items-center gap-3">
                                 <Zap className="w-3.5 h-3.5 text-emerald-400" /> Payment Narrative
                            </Label>
                            <textarea 
                                className="w-full h-28 bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] p-8 text-sm font-medium text-zinc-500 outline-none focus:bg-white focus:border-emerald-100 transition-all italic placeholder:text-zinc-200 shadow-inner resize-none"
                                placeholder="Contoh: Pembayaran pelunasan termin 2 via Transfer Bank Mandiri..."
                                value={formData.notes}
                                onChange={e => { setFormData({...formData, notes: e.target.value}); }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right column: amount & date */}
            <div className="lg:col-span-12 xl:col-span-4 space-y-10">
                <div className="bg-[#1e3a5f] p-12 rounded-[3.5rem] text-white shadow-[0_35px_60px_-15px_rgba(30,58,95,0.4)] space-y-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
                    
                    <div className="space-y-2 relative z-10 pb-8 border-b border-white/5 text-right">
                        <Label className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] flex items-center gap-3 pr-1 justify-end italic leading-none mb-2">
                             Execution Date <Calendar className="w-4 h-4 text-blue-300" />
                        </Label>
                        <Input 
                            type="date"
                            className="bg-white/10 border-2 border-white/5 h-16 text-xl font-black text-white focus:bg-white/20 transition-all rounded-[1.5rem] px-8 outline-none focus:ring-0 text-center" 
                            value={formData.date}
                            onChange={e => { setFormData({...formData, date: e.target.value}); }}
                        />
                    </div>

                    <div className="space-y-5 relative z-10">
                        <Label className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] flex items-center gap-3 pl-1 italic leading-none mb-1">
                            <Wallet className="w-4 h-4 text-rose-400" /> Disbursement Total (IDR)
                        </Label>
                        <div className="relative">
                            <span className="absolute left-0 bottom-2 text-4xl font-black text-rose-400/50 italic leading-none">Rp</span>
                            <input 
                                type="number"
                                className="w-full bg-transparent border-none p-0 pl-16 h-20 text-7xl font-black italic tracking-tighter focus:ring-0 text-white tabular-nums outline-none placeholder:text-white/10"
                                placeholder="0"
                                value={formData.amount}
                                onChange={e => { setFormData({...formData, amount: Number(e.target.value)}); }}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-10 border-t border-white/5 relative z-10">
                        <div className="flex justify-between items-center text-[10px] font-black opacity-40 uppercase tracking-[0.4em] italic leading-none">
                            <span>Remaining Outstanding</span>
                            <span className="text-emerald-400 drop-shadow-lg">Rp {(selectedInvoice ? (selectedInvoice.balance - formData.amount) : 0).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden shadow-inner ring-1 ring-white/5">
                            <div 
                                className="h-full bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all duration-1000 ease-out"
                                style={{ width: `${selectedInvoice ? Math.min(100, (formData.amount / selectedInvoice.balance) * 100) : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-rose-50/50 p-10 rounded-[3.5rem] border border-rose-100 shadow-xl space-y-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:bg-white transition-colors cursor-default">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100/50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white flex items-center justify-center text-rose-500 shadow-xl border border-rose-50 group-hover:rotate-12 transition-transform">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-800 italic">Automatic Journal Posting</h4>
                        <p className="text-[10px] font-bold text-rose-700/50 leading-relaxed uppercase italic max-w-[200px]">
                            Sistem akan mendebet akun Hutang Pembelian dan mengkredit akun Kas sumber secara instan.
                        </p>
                    </div>
                </div>

                <div className="bg-zinc-50 p-8 rounded-[2.5rem] border-2 border-dashed border-zinc-100 flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-300">
                        <Info className="w-6 h-6" />
                    </div>
                    <p className="text-[9px] font-black text-zinc-300 uppercase italic tracking-widest leading-relaxed">
                        Transaksi ini tunduk pada validasi audit keuangan internal perusahaan.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </FullscreenFormLayout>
  );
}
