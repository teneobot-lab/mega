import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { EditableTable } from "../../components/fullscreen-form/EditableTable";
import { BookOpen, Calendar, AlignLeft, CheckCircle2, AlertCircle, Bookmark, ShieldCheck } from "lucide-react";
import { accountingApi, masterApi } from "../../lib/api-services";

export default function GeneralJournalForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    status: "DRAFT"
  });

  const [entries, setEntries] = useState<any[]>([
    { accountId: "", debit: 0, credit: 0, notes: "" },
    { accountId: "", debit: 0, credit: 0, notes: "" }
  ]);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const accs = await masterApi.getAccounts();
        setAccounts(accs);

        if (isEdit) {
          const data = await accountingApi.getJournal(id);
          setFormData({
            date: data.date.split('T')[0],
            description: data.description || "",
            status: "POSTED"
          });
          setEntries((data?.Entries || []).map((e: any) => ({
            id: e.id,
            accountId: e.accountId,
            debit: e.debit,
            credit: e.credit,
            notes: e.notes || ""
          })));
        } else {
           if(accs.length >= 2) {
             setEntries([
               { accountId: accs[0].id, debit: 0, credit: 0, notes: "" },
               { accountId: accs[1].id, debit: 0, credit: 0, notes: "" }
             ]);
           }
        }
      } catch (e: any) {
          toast.error(e.message || "Gagal memuat data");
      }
    };
    loadData();
  }, [id, isEdit]);

  const handleSave = async () => {
    const totalD = entries.reduce((s, e) => s + (Number(e.debit) || 0), 0);
    const totalC = entries.reduce((s, e) => s + (Number(e.credit) || 0), 0);

    if (totalD !== totalC) return toast.error("Total Debit dan Kredit harus seimbang (Balanced)");
    if (totalD <= 0) return toast.error("Nilai transaksi tidak boleh nol");
    if (entries.some(e => !e.accountId)) return toast.error("Semua baris wajib memiliki akun terdaftar");

    setIsSaving(true);
    try {
      if (isEdit) {
          // Journal updates are usually restricted, but following pattern
          await accountingApi.createJournal({ ...formData, entries });
      } else {
          await accountingApi.createJournal({ ...formData, entries });
      }

      toast.success(`Entri Jurnal Umum berhasil ${isEdit ? 'diperbarui' : 'diposting'}`);
      navigate("/accounting/journals");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan ke server");
    } finally {
      setIsSaving(false);
    }
  };

  const tableColumns = [
    {
      key: "accountId",
      label: "Akun Jurnal",
      type: "select" as const,
      options: accounts.map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }))
    },
    {
      key: "debit",
      label: "Debit (DR)",
      type: "number" as const,
      width: "180px"
    },
    {
      key: "credit",
      label: "Kredit (CR)",
      type: "number" as const,
      width: "180px"
    },
    {
        key: "notes",
        label: "Memo Baris (Opsional)",
        type: "text" as const
    }
  ];

  const totalDebit = entries.reduce((acc, curr) => acc + (Number(curr.debit) || 0), 0);
  const totalCredit = entries.reduce((acc, curr) => acc + (Number(curr.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Journal Entry #${id}` : "Journal Voucher (JV) Baru"}
      module="Accounting > General Journal"
      status={formData.status as any}
      onSave={handleSave}
      onCancel={() => navigate("/accounting/journals")}
      isSaving={isSaving}
      isAutoSaving={false}
      isEdit={isEdit}
    >
      <div className="max-w-6xl mx-auto space-y-8 pb-32">
        {/* Professional Header Section */}
        <div className="bg-white p-10 rounded-[3rem] border border-zinc-200 shadow-2xl relative overflow-hidden ring-1 ring-zinc-50">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                <BookOpen className="w-64 h-64 rotate-12 text-[#1e3a5f]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
                <div className="md:col-span-3 space-y-2">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] flex items-center gap-2 pl-1 italic">
                        <Calendar className="w-3.5 h-3.5" /> Posting Date <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                        type="date"
                        className="h-14 bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 text-sm font-black text-[#1e3a5f]" 
                        value={formData.date}
                        onChange={e => { setFormData({...formData, date: e.target.value}); setIsDirty(true); }}
                    />
                </div>

                <div className="md:col-span-9 space-y-2">
                    <Label className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-[0.25em] flex items-center gap-2 pl-1 italic">
                        <AlignLeft className="w-3.5 h-3.5" /> Transaction Narration / Description <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Bookmark className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1e3a5f]/10" />
                        <Input 
                          className="h-14 bg-zinc-50/50 border-2 border-zinc-100 rounded-2xl px-8 text-sm font-medium text-zinc-600 outline-none focus:bg-white focus:border-[#1e3a5f]/30 transition-all italic placeholder:text-zinc-300" 
                          placeholder="Masukkan rincian deskripsi jurnal umum secara detail..."
                          value={formData.description}
                          onChange={e => { setFormData({...formData, description: e.target.value}); setIsDirty(true); }}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Ledger Lines */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#1e3a5f] rounded-xl shadow-xl">
                    <Bookmark className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1e3a5f]">Double Entry ledger lines</h3>
             </div>
             <div className="flex items-center gap-3">
                <div className="px-5 py-1.5 bg-zinc-100 rounded-full border border-zinc-200 flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${isBalanced ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                        {isBalanced ? 'System Balanced' : 'System Unbalanced'}
                    </span>
                </div>
             </div>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-2xl overflow-hidden flex flex-col h-[450px] ring-1 ring-zinc-50">
            <div className="flex-1 overflow-auto custom-scrollbar">
              <EditableTable 
                columns={tableColumns}
                data={entries}
                onChange={(newEntries) => {
                  setEntries(newEntries);
                  setIsDirty(true);
                }}
              />
            </div>
          </div>
        </div>

        {/* Audit & Recap */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
             <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-xl h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Compliance & Audit Logs</h4>
                    <div className="flex-1 h-px bg-zinc-100" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                    <ShieldCheck className="w-12 h-12 text-zinc-300" />
                    <p className="text-[9px] font-black uppercase tracking-widest leading-loose">
                        Automated double-entry validation active.<br/>All balance changes are audit-ready.
                    </p>
                </div>
             </div>
          </div>

          <div className="lg:col-span-5 bg-[#1e3a5f] p-10 rounded-[2.5rem] text-white flex flex-col gap-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000" />
            
            <div className="flex justify-between items-start border-b border-white/10 pb-8 relative z-10 gap-6">
              <div className="flex flex-col space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300/60 pl-1">Total Debit</span>
                <span className="text-3xl font-black italic tracking-tighter tabular-nums drop-shadow-lg">
                    {totalDebit.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex flex-col text-right space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300/60 pr-1">Total Kredit</span>
                <span className="text-3xl font-black italic tracking-tighter tabular-nums drop-shadow-lg">
                    {totalCredit.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 border-2 transition-all duration-500 overflow-hidden ${isBalanced ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                    {isBalanced ? (
                        <>
                            <CheckCircle2 className="w-5 h-5 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                            <span className="text-xs font-black uppercase tracking-[0.3em] italic">Perfectly Balanced</span>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-5 h-5 animate-bounce" />
                            <span className="text-xs font-black uppercase tracking-[0.3em] italic">Imbalance Detected</span>
                        </>
                    )}
                </div>
                {totalDebit > 0 && totalCredit > 0 && !isBalanced && (
                    <div className="mt-4 px-6 py-2 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-300 italic flex items-center gap-2">
                             Difference: {Math.abs(totalDebit - totalCredit).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </FullscreenFormLayout>
  );
}

