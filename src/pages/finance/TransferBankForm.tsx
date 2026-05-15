import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { useFullscreenForm } from "../../hooks/use-fullscreen-form";
import { Landmark, ArrowRightLeft, Calendar, FileText, Wallet, History, AlertCircle, Zap, ShieldCheck, ArrowRight, CreditCard, Bookmark } from "lucide-react";

export default function TransferBankForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const { isSaving, isAutoSaving, setIsSaving, isDirty, setIsDirty, handleCancel } = useFullscreenForm({
    onAutoSave: async () => {
      console.log("Auto-saving bank transfer draft...");
    }
  });
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sourceAccountId: "",
    targetAccountId: "",
    amount: 0,
    notes: "",
    status: "COMPLETED"
  });

  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/master/accounts", { 
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const allAccs = await res.json();
        const banks = allAccs.filter((a: any) => a.type === "ASSET" && (a.name.toLowerCase().includes("kas") || a.name.toLowerCase().includes("bank") || a.code.startsWith('111')));
        setAccounts(banks);

        if (isEdit) {
          const res = await fetch(`/api/finance/transfer/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          const data = await res.json();
          setFormData({
            date: data.date.split('T')[0],
            sourceAccountId: data.sourceAccountId || "",
            targetAccountId: data.targetAccountId || "",
            amount: data.amount,
            notes: data.notes || "",
            status: "COMPLETED"
          });
        } else {
          if (banks.length >= 2) {
            setFormData(prev => ({ 
                ...prev, 
                sourceAccountId: banks[0].id,
                targetAccountId: banks[1].id
            }));
          }
        }
      } catch (e) {}
    };
    loadData();
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!formData.sourceAccountId || !formData.targetAccountId || formData.amount <= 0) {
      return toast.error("Akun sumber/tujuan dan jumlah transfer wajib valid");
    }

    if (formData.sourceAccountId === formData.targetAccountId) {
      return toast.error("Akun sumber dan tujuan tidak boleh sama");
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/finance/transfer" + (isEdit ? `/${id}` : ""), {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(`Transfer berhasil ${isEdit ? 'diubah' : 'dicatat'}`);
        setIsDirty(false);
        navigate("/finance/bank-transfer");
      } else {
        throw new Error("Gagal menyimpan");
      }
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan ke server");
    } finally {
      setIsSaving(false);
    }
  };

  const sourceAccount = accounts.find(a => a.id === formData.sourceAccountId);
  const targetAccount = accounts.find(a => a.id === formData.targetAccountId);

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Transfer #${id}` : "Pemindahan Dana (Bank Transfer) Baru"}
      module="Finance > Bank Transfer"
      status={formData.status as any}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
      isAutoSaving={isAutoSaving}
      isEdit={isEdit}
    >
      <div className="max-w-5xl mx-auto space-y-12 pb-32">
        {/* Main Transfer Bridge */}
        <div className="bg-white p-12 rounded-[3.5rem] border border-zinc-200 shadow-2xl relative overflow-hidden ring-1 ring-zinc-50">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
            <div className="absolute -right-20 -top-20 opacity-[0.03]">
                <ArrowRightLeft className="w-96 h-96 -rotate-12 text-[#1e3a5f]" />
            </div>

            <div className="space-y-12 relative z-10">
                {/* Date Picker Header */}
                <div className="flex flex-col items-center justify-center space-y-4">
                     <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-zinc-300" />
                        <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] italic leading-none">Journal Entry Execution Date</Label>
                     </div>
                     <Input 
                        type="date"
                        className="w-56 h-14 bg-zinc-50 border-2 border-zinc-100 rounded-2xl text-center font-black text-[#1e3a5f] focus:bg-white focus:border-[#1e3a5f]/20 transition-all shadow-inner text-lg outline-none" 
                        value={formData.date}
                        onChange={e => { setFormData({...formData, date: e.target.value}); setIsDirty(true); }}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
                    {/* Source */}
                    <div className="md:col-span-5 group">
                        <div className="bg-rose-50/30 p-8 rounded-[2.5rem] border-2 border-rose-100/50 group-hover:bg-white group-hover:border-rose-300 transition-all duration-500 shadow-inner group-hover:shadow-2xl group-hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-4 bg-rose-500 rounded-2xl shadow-lg ring-4 ring-rose-500/10">
                                    <Wallet className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-black text-rose-500/40 uppercase tracking-widest pl-2 block">Source Account</span>
                                    {sourceAccount && (
                                        <span className="text-[10px] font-bold text-rose-900/40 italic">Balance: Rp {sourceAccount.balance.toLocaleString()}</span>
                                    )}
                                </div>
                            </div>
                            <Label className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1 italic block mb-3">Pindahkan Dana Dari</Label>
                            <div className="relative">
                                <Bookmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-200 pointer-events-none" />
                                <select 
                                    className="w-full h-16 bg-white border-2 border-rose-100 rounded-2xl pl-12 pr-6 text-base font-black text-[#1e3a5f] outline-none transition-all appearance-none italic"
                                    value={formData.sourceAccountId}
                                    onChange={e => { setFormData({...formData, sourceAccountId: e.target.value}); setIsDirty(true); }}
                                >
                                    <option value="">Pilih Kas Asal...</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bridge Icon */}
                    <div className="md:col-span-1 flex flex-col items-center justify-center -space-y-1 opacity-20 py-4">
                        <ArrowRight className="w-10 h-10 text-indigo-400 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-tighter italic">Liquid</span>
                    </div>

                    {/* Target */}
                    <div className="md:col-span-5 group">
                        <div className="bg-emerald-50/30 p-8 rounded-[2.5rem] border-2 border-emerald-100/50 group-hover:bg-white group-hover:border-emerald-300 transition-all duration-500 shadow-inner group-hover:shadow-2xl group-hover:-translate-y-1">
                            <div className="flex flex-row-reverse justify-between items-start mb-8">
                                <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg ring-4 ring-emerald-500/10">
                                    <CreditCard className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <span className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest pr-2 block">Recipient Account</span>
                                    {targetAccount && (
                                        <span className="text-[10px] font-bold text-emerald-900/40 italic">Balance: Rp {targetAccount.balance.toLocaleString()}</span>
                                    )}
                                </div>
                            </div>
                            <Label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-right pr-1 italic block mb-3">Diterima Di Rekening</Label>
                            <div className="relative">
                                <Bookmark className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-200 pointer-events-none" />
                                <select 
                                    className="w-full h-16 bg-white border-2 border-emerald-100 rounded-2xl px-6 pr-12 text-base font-black text-[#1e3a5f] text-right outline-none transition-all appearance-none italic"
                                    value={formData.targetAccountId}
                                    onChange={e => { setFormData({...formData, targetAccountId: e.target.value}); setIsDirty(true); }}
                                >
                                    <option value="">Pilih Kas Tujuan...</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Amount Input */}
                <div className="bg-zinc-950 p-12 rounded-[3.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)] space-y-6 relative overflow-hidden group border-b border-white/5 mx-auto max-w-2xl w-full">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                        <Zap className="w-32 h-32 text-indigo-400 group-hover:scale-125 transition-transform duration-1000" />
                    </div>
                    <div className="text-center relative z-10">
                        <Label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.6em] italic">Disbursement Amount (IDR)</Label>
                    </div>
                    <div className="relative flex items-center justify-center z-10">
                        <span className="absolute left-0 lg:left-6 text-4xl font-black text-zinc-700 italic">Rp</span>
                        <input 
                            type="number"
                            className="w-full h-24 bg-transparent text-center text-7xl font-black text-white italic tracking-tighter outline-none tabular-nums placeholder:text-zinc-900 focus:scale-105 transition-transform border-none ring-0"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={e => { setFormData({...formData, amount: Number(e.target.value)}); setIsDirty(true); }}
                        />
                    </div>
                    <div className="flex justify-center items-center gap-4 relative z-10">
                        <div className="h-px w-12 bg-zinc-800" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> Secure Transaction Enabled
                        </span>
                        <div className="h-px w-12 bg-zinc-800" />
                    </div>
                </div>

                {/* Notes Column */}
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] pl-6 italic flex items-center gap-3">
                         <FileText className="w-3.5 h-3.5 text-[#1e3a5f]/30" /> Reference Narrative
                    </Label>
                    <textarea 
                        className="w-full h-28 bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] p-8 text-sm font-medium text-zinc-500 outline-none focus:bg-white focus:border-indigo-100 transition-all italic placeholder:text-zinc-200 shadow-inner resize-none"
                        placeholder="Contoh: Rebalancing saldo Kas Kecil ke Rekening BCA Operasional..."
                        value={formData.notes}
                        onChange={e => { setFormData({...formData, notes: e.target.value}); setIsDirty(true); }}
                    />
                </div>
            </div>
        </div>

        {/* Informative Footer Recaps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-2xl flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                   <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1 leading-none">Status</h5>
                   <p className="text-sm font-black text-[#1e3a5f] italic tracking-tight uppercase">REAL-TIME JV SYNC</p>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-2xl flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                    <History className="w-8 h-8" />
                </div>
                <div>
                   <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1 leading-none">Security</h5>
                   <p className="text-sm font-black text-emerald-500 italic tracking-tight uppercase">Instant Posting</p>
                </div>
            </div>

            <div className="bg-[#1e3a5f] p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(30,58,95,0.4)] flex flex-col justify-center items-center text-center group cursor-default">
                 <span className="text-[10px] font-black text-blue-300 uppercase tracking-[0.4em] mb-1 opacity-40 group-hover:opacity-100 transition-opacity">Total Transfer Value</span>
                 <h4 className="text-3xl font-black text-white italic tracking-tighter tabular-nums drop-shadow-lg">
                    {formData.amount.toLocaleString('id-ID')}
                 </h4>
            </div>
        </div>
      </div>
    </FullscreenFormLayout>
  );
}
