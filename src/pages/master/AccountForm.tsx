import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { useFullscreenForm } from "../../hooks/use-fullscreen-form";
import { Fingerprint, Bookmark, Layers, AlertCircle, Info, Calculator, Tags, ShieldCheck, AlignLeft, ArrowRight, History } from "lucide-react";

export default function AccountForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const { isSaving, isAutoSaving, setIsSaving, isDirty, setIsDirty, handleCancel } = useFullscreenForm({
    onAutoSave: async () => {
      console.log("Auto-saving chart of account draft...");
    }
  });
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "ASSET",
    description: "",
  });

  useEffect(() => {
    const loadData = async () => {
      if (isEdit) {
        try {
          const res = await fetch(`/api/master/accounts/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          const data = await res.json();
          setFormData({
            code: data.code,
            name: data.name,
            type: data.type,
            description: data.description || "",
          });
        } catch (e) {}
      }
    };
    loadData();
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      return toast.error("Account Code and Name are mandatory for financial structure");
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/master/accounts" + (isEdit ? `/${id}` : ""), {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(`Akun ledger berhasil ${isEdit ? 'diperbarui' : 'didaftarkan'}`);
        setIsDirty(false);
        navigate("/master/coa");
      } else {
        throw new Error("Failed to commit account changes safely");
      }
    } catch (e: any) {
      toast.error(e.message || "Network transmission error during save operation");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FullscreenFormLayout
      title={isEdit ? `Account Profile: ${formData.code} - ${formData.name}` : "General Ledger Architecture: New Account Entry"}
      module="Master Data > Chart of Accounts (COA)"
      status={"POSTED" as any}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
      isAutoSaving={isAutoSaving}
      isEdit={isEdit}
    >
      <div className="max-w-6xl mx-auto space-y-12 pb-32">
        {/* Core Architecture Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Account Details */}
            <div className="lg:col-span-7 space-y-10">
                <div className="bg-white p-12 rounded-[3.5rem] border border-zinc-200 shadow-2xl relative overflow-hidden group ring-1 ring-zinc-50">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                        <Fingerprint className="w-80 h-80 text-[#1e3a5f]" />
                    </div>

                    <div className="space-y-10 relative z-10">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#1e3a5f] rounded-2xl shadow-xl ring-4 ring-[#1e3a5f]/10">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-[#1e3a5f] italic leading-none">Account Identity</h3>
                                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest pl-1">The core building block of financial reporting</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Account Code / Index <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input 
                                        className="h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] px-8 text-2xl font-black text-[#1e3a5f] tracking-tighter placeholder:text-zinc-200 focus:bg-white focus:border-[#1e3a5f]/20 outline-none transition-all shadow-inner" 
                                        placeholder="110-001"
                                        value={formData.code}
                                        onChange={e => { setFormData({...formData, code: e.target.value}); setIsDirty(true); }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Reporting Category <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Layers className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                                    <select 
                                        className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] pl-16 pr-8 text-base font-black text-[#1e3a5f] outline-none transition-all appearance-none italic focus:bg-white shadow-inner"
                                        value={formData.type}
                                        onChange={e => { setFormData({...formData, type: e.target.value}); setIsDirty(true); }}
                                    >
                                        <option value="ASSET">Harta (Asset)</option>
                                        <option value="LIABILITY">Kewajiban (Liability)</option>
                                        <option value="EQUITY">Modal (Equity)</option>
                                        <option value="REVENUE">Pendapatan (Revenue)</option>
                                        <option value="EXPENSE">Beban (Expense)</option>
                                        <option value="OTHER_REVENUE">Lain-lain (Income)</option>
                                        <option value="OTHER_EXPENSE">Lain-lain (Expense)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Legal Account Name <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Bookmark className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                                <Input 
                                    className="h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] pl-16 pr-8 text-lg font-black text-[#1e3a5f] outline-none focus:bg-white focus:border-[#1e3a5f]/20 transition-all italic shadow-inner" 
                                    placeholder="Contoh: Saldo Bank Utama (IDR)"
                                    value={formData.name}
                                    onChange={e => { setFormData({...formData, name: e.target.value}); setIsDirty(true); }}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-6 italic flex items-center gap-3">
                                <AlignLeft className="w-3.5 h-3.5 text-[#1e3a5f]/30" /> Reference Narrative
                            </Label>
                            <textarea 
                                className="w-full h-32 bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] p-8 text-sm font-medium text-zinc-500 outline-none focus:bg-white focus:border-indigo-100 transition-all italic placeholder:text-zinc-200 shadow-inner resize-none"
                                placeholder="Deskripsikan kegunaan spesifik akun ini..."
                                value={formData.description}
                                onChange={e => { setFormData({...formData, description: e.target.value}); setIsDirty(true); }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview & Rules */}
            <div className="lg:col-span-5 space-y-10">
                <div className="bg-[#1e3a5f] p-12 rounded-[3.5rem] text-white shadow-[0_35px_60px_-15px_rgba(30,58,95,0.4)] space-y-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
                    
                    <div className="space-y-3 relative z-10">
                        <div className="flex items-center gap-3 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                             <Calculator className="w-5 h-5 text-blue-300" />
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">Financial Statement Preview</span>
                        </div>
                        <div className="pt-8 border-t border-white/5">
                            <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-4xl font-black italic tracking-tighter leading-none text-blue-400 drop-shadow-xl group-hover:translate-x-2 transition-transform duration-500">
                                    {formData.name || 'Account Label'}
                                </h4>
                                <ArrowRight className="w-6 h-6 text-white/10 group-hover:text-white/40 transition-colors" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 italic">
                                INDEX: {formData.code || 'UNSPECIFIED'} • CATEGORY: {formData.type}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex items-start gap-6 shadow-inner relative z-10 hover:bg-white/10 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                            <Info className="w-5 h-5 text-indigo-300" />
                        </div>
                        <p className="text-[10px] font-black leading-relaxed text-blue-100/60 uppercase tracking-[0.15em] italic">
                            This account will be mapped directly to the <span className="text-white opacity-100 font-black underline decoration-indigo-400 decoration-2 underline-offset-4">{formData.type === 'REVENUE' || formData.type === 'EXPENSE' ? 'Profit & Loss Statement' : 'Balance Sheet'}</span> during monthly closing operations.
                        </p>
                    </div>
                </div>

                <div className="bg-amber-50/50 p-10 rounded-[3rem] border border-amber-100 shadow-xl space-y-6 ring-1 ring-amber-50">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-amber-100 rounded-xl shadow-inner border border-amber-200">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-800 italic leading-none">Architecture Constraints</h4>
                    </div>
                    <ul className="space-y-4 pt-2">
                        <li className="flex gap-4 group">
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 group-hover:scale-150 transition-transform shadow-xl" />
                            <p className="text-[10px] font-bold text-amber-900/40 uppercase italic tracking-widest leading-relaxed">Account codes must be unique to prevent indexing collisions within the trial balance.</p>
                        </li>
                        <li className="flex gap-4 group">
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 group-hover:scale-150 transition-transform shadow-xl" />
                            <p className="text-[10px] font-bold text-amber-900/40 uppercase italic tracking-widest leading-relaxed">Normal balance behavior (Debit vs Credit) is determined strictly by the category selection.</p>
                        </li>
                    </ul>
                </div>

                <div className="flex items-center gap-6 p-10 bg-zinc-50 border border-zinc-100 rounded-[3rem] opacity-40 hover:opacity-100 hover:bg-white hover:shadow-2xl transition-all duration-700 group border-dashed border-2">
                    <div className="p-4 bg-zinc-100 rounded-2xl group-hover:bg-[#1e3a5f] group-hover:text-white transition-all duration-500 shadow-inner">
                        <History className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 italic mb-1">Entity Lifecycle</span>
                        <span className="text-[10px] font-bold text-zinc-300 uppercase italic tracking-widest">Awaiting First Transaction entry</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </FullscreenFormLayout>
  );
}
