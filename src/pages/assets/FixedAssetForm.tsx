import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FullscreenFormLayout } from "../../components/fullscreen-form/FullscreenFormLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Wallet, Calendar, Calculator, Box, History, ShieldCheck, Bookmark, FileText, TrendingDown, Info, ArrowUpRight } from "lucide-react";
import { assetsApi, masterApi } from "../../lib/api-services";

export default function FixedAssetForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 0,
    salvageValue: 0,
    usefulLife: 12,
    depreciationMethod: "STRAIGHT_LINE",
    accountId: "",
    status: "ACTIVE"
  });

  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allAccs = await masterApi.getAccounts();
        const assetAccs = allAccs.filter((a: any) => a.type === 'ASSET' || a.type === 'FIXED_ASSET' || a.code.startsWith('12'));
        setAccounts(assetAccs);

        if (isEdit) {
          const data = await assetsApi.getAsset(id);
          setFormData({
            code: data.code,
            name: data.name,
            purchaseDate: data.purchaseDate.split('T')[0],
            purchasePrice: data.purchasePrice,
            salvageValue: data.salvageValue,
            usefulLife: data.usefulLife,
            depreciationMethod: data.depreciationMethod,
            accountId: data.accountId,
            status: data.status
          });
        } else {
           if(assetAccs.length > 0) setFormData(prev => ({...prev, accountId: assetAccs[0].id}));
        }
      } catch (e: any) {
          toast.error(e.message || "Gagal memuat data");
      }
    };
    loadData();
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!formData.code || !formData.name || !formData.accountId) {
      return toast.error("Kode, Nama, dan Akun Aset wajib diisi dengan valid");
    }

    setIsSaving(true);
    try {
      if (isEdit) {
        await assetsApi.updateAsset(id, formData);
      } else {
        await assetsApi.createAsset(formData);
      }

      toast.success(`Entitas aset tetap berhasil ${isEdit ? 'diperbarui' : 'didaftarkan di Ledger'}`);
      navigate("/assets");
    } catch (e: any) {
      toast.error(e.message || "Gagal melakukan transmisi data ke server");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FullscreenFormLayout
      title={isEdit ? `Edit Fixed Asset Registry: ${formData.code}` : "Pendaftaran Aset Tetap Baru (Capital Expenditures)"}
      module="Assets > Fixed Asset Management"
      status={formData.status as any}
      onSave={handleSave}
      onCancel={() => navigate("/assets")}
      isSaving={isSaving}
      isAutoSaving={false}
      isEdit={isEdit}
    >
      <div className="max-w-6xl mx-auto space-y-10 pb-32">
        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Asset Detail */}
            <div className="lg:col-span-8 space-y-10">
                <div className="bg-white p-10 rounded-[3rem] border border-zinc-200 shadow-2xl relative overflow-hidden group ring-1 ring-zinc-50">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                        <Box className="w-64 h-64 -rotate-12 text-[#1e3a5f]" />
                    </div>
                    
                    <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#1e3a5f] flex items-center justify-center text-white shadow-xl ring-4 ring-[#1e3a5f]/10">
                                <Bookmark className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#1e3a5f] italic leading-none">Asset Identification</h3>
                                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest pl-1">Primary identity in general ledger</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Asset Control Code <span className="text-red-500">*</span></Label>
                                <Input 
                                    className="h-14 bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-8 text-base font-black text-[#1e3a5f] uppercase tracking-tighter placeholder:text-zinc-200 focus:bg-white outline-none transition-all shadow-inner" 
                                    placeholder="Misal: AST-2024-VEH-001"
                                    value={formData.code}
                                    onChange={e => { setFormData({...formData, code: e.target.value}); setIsDirty(true); }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">Asset Name / Label <span className="text-red-500">*</span></Label>
                                <Input 
                                    className="h-14 bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-8 text-base font-black text-[#1e3a5f] placeholder:text-zinc-200 focus:bg-white outline-none transition-all shadow-inner" 
                                    placeholder="Misal: Kendaraan Operasional Kurir"
                                    value={formData.name}
                                    onChange={e => { setFormData({...formData, name: e.target.value}); setIsDirty(true); }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic">ledger classification (FIXED ASSET ACCOUNT) <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                                <select 
                                    className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] pl-16 pr-8 text-base font-black text-[#1e3a5f] outline-none transition-all appearance-none italic focus:bg-white shadow-inner"
                                    value={formData.accountId}
                                    onChange={e => { setFormData({...formData, accountId: e.target.value}); setIsDirty(true); }}
                                >
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-zinc-200 shadow-2xl relative overflow-hidden group ring-1 ring-zinc-50">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl ring-4 ring-emerald-500/10">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#1e3a5f] italic leading-none text-emerald-600">Depreciation Logic</h3>
                                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest pl-1">Accounting amortisation settings</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 group/field">
                                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic group-focus-within/field:text-emerald-500 transition-colors">Economic Life (Months)</Label>
                                <div className="relative">
                                    <TrendingDown className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-200" />
                                    <Input 
                                        type="number"
                                        className="h-14 bg-zinc-50 border-2 border-zinc-100 rounded-2xl pl-16 pr-6 text-base font-black text-[#1e3a5f] focus:bg-white outline-none transition-all shadow-inner" 
                                        value={formData.usefulLife}
                                        onChange={e => { setFormData({...formData, usefulLife: Number(e.target.value)}); setIsDirty(true); }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 group/field">
                                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] pl-1 italic group-focus-within/field:text-emerald-500 transition-colors">Formula / Method</Label>
                                <select 
                                    className="w-full h-14 bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-8 text-sm font-black text-[#1e3a5f] focus:bg-white outline-none transition-all appearance-none italic shadow-inner"
                                    value={formData.depreciationMethod}
                                    onChange={e => { setFormData({...formData, depreciationMethod: e.target.value}); setIsDirty(true); }}
                                >
                                    <option value="STRAIGHT_LINE">Metode Garis Lurus (Straight Line)</option>
                                    <option value="DOUBLE_DECLINING">Metode Saldo Menurun Ganda</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border-2 border-emerald-100 flex items-start gap-6 shadow-sm ring-1 ring-emerald-50">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0 shadow-inner">
                                <Info className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[11px] font-black text-emerald-800 uppercase tracking-[0.2em] italic">Automated Fiscal Posting</h4>
                                <p className="text-[10px] font-bold text-emerald-700/60 leading-relaxed uppercase italic">
                                    Sistem akan melakukan eksekusi jurnal penyusutan otomatis (Accumulated Depreciation) setiap akhir periode akuntansi berdasarkan parameter di atas. Perubahan parameter akan berdampak pada laporan audit tahun berjalan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Financial summary */}
            <div className="lg:col-span-4 space-y-10">
                <div className="bg-[#1e3a5f] p-10 rounded-[3rem] text-white shadow-2xl space-y-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
                    
                    <div className="space-y-2 relative z-10 pb-8 border-b border-white/5">
                        <Label className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] flex items-center gap-3 pl-1 italic leading-none mb-2">
                             <Calendar className="w-4 h-4 text-blue-300" /> Acquisition Date
                        </Label>
                        <Input 
                            type="date"
                            className="bg-white/10 border-2 border-white/5 h-16 text-xl font-black text-white focus:bg-white/20 transition-all rounded-[1.5rem] px-8 outline-none focus:ring-0" 
                            value={formData.purchaseDate}
                            onChange={e => { setFormData({...formData, purchaseDate: e.target.value}); setIsDirty(true); }}
                        />
                    </div>

                    <div className="space-y-3 relative z-10">
                        <Label className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] flex items-center gap-3 pl-1 italic leading-none mb-1">
                            <Wallet className="w-4 h-4 text-emerald-400" /> Acquisition Cost
                        </Label>
                        <div className="relative">
                            <span className="absolute left-0 bottom-2 text-3xl font-black text-emerald-400/50 italic leading-none">Rp</span>
                            <input 
                                type="number"
                                className="w-full bg-transparent border-none p-0 pl-16 h-20 text-6xl font-black italic tracking-tighter focus:ring-0 text-white tabular-nums outline-none placeholder:text-white/10"
                                placeholder="0"
                                value={formData.purchasePrice}
                                onChange={e => { setFormData({...formData, purchasePrice: Number(e.target.value)}); setIsDirty(true); }}
                            />
                        </div>
                    </div>

                    <div className="space-y-3 relative z-10 pt-8 border-t border-white/5">
                        <Label className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] italic leading-none">Residual Value (Salvage)</Label>
                        <div className="relative flex items-center">
                            <span className="text-xl font-black text-zinc-500 italic mr-3 leading-none">Rp</span>
                            <input 
                                type="number"
                                className="bg-white/5 border-none h-12 text-2xl font-black text-white/80 rounded-xl px-4 outline-none focus:bg-white/10 transition-all w-full tabular-nums" 
                                value={formData.salvageValue}
                                onChange={e => { setFormData({...formData, salvageValue: Number(e.target.value)}); setIsDirty(true); }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-zinc-200 shadow-xl space-y-6 flex flex-col relative overflow-hidden group hover:border-[#1e3a5f]/20 transition-colors">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-[#1e3a5f]/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                     
                     <div className="space-y-2 relative z-10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center gap-2 italic">
                            Book Value Index <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                        </h4>
                        <div className="flex flex-col gap-1">
                            <span className="text-4xl font-black text-[#1e3a5f] tabular-nums tracking-tighter italic">
                                Rp {formData.purchasePrice.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 w-fit px-4 py-1.5 rounded-full uppercase tracking-widest italic border border-emerald-500/10">
                                Fresh Asset (No Amortis.)
                            </span>
                        </div>
                     </div>
                </div>

                <div className="bg-zinc-50 p-8 rounded-[2.5rem] border-2 border-zinc-100 border-dashed space-y-4">
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                        <FileText className="w-3 h-3" /> System Audit Trail
                    </h5>
                    <p className="text-[9px] font-bold text-zinc-400 leading-relaxed uppercase italic">
                        Setiap perubahan pada parameter aset ini akan dicatat dalam audit log permanen. Pastikan input data sesuai dengan invoice perolehan asli.
                    </p>
                </div>
            </div>
        </div>

        <Tabs defaultValue="history" className="w-full">
            <div className="flex items-center justify-between mb-6 px-4">
                <TabsList className="bg-zinc-100/50 p-1.5 rounded-2xl border border-zinc-200 h-14">
                    <TabsTrigger value="history" className="text-[10px] font-black uppercase py-2 px-8 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all tracking-widest">General Ledger History</TabsTrigger>
                    <TabsTrigger value="docs" className="text-[10px] font-black uppercase py-2 px-8 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all tracking-widest">Document Storage</TabsTrigger>
                </TabsList>
            </div>
            
            <TabsContent value="history" className="mt-0 border border-zinc-200 rounded-[3rem] bg-white p-20 shadow-2xl flex flex-col items-center justify-center text-zinc-300 gap-6 min-h-[300px]">
                <div className="w-20 h-20 rounded-[2rem] bg-zinc-50 flex items-center justify-center border-2 border-zinc-100 shadow-inner">
                    <History className="w-10 h-10 opacity-10" />
                </div>
                <div className="text-center space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400 italic">No Operational History</h4>
                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest max-w-xs">Data transaksi untuk aset ini belum tersedia di General Ledger.</p>
                </div>
            </TabsContent>
            
            <TabsContent value="docs" className="mt-0 border border-zinc-200 rounded-[3rem] bg-white p-20 shadow-2xl flex flex-col items-center justify-center text-zinc-300 gap-6 min-h-[300px]">
                <div className="w-20 h-20 rounded-[2rem] bg-zinc-50 flex items-center justify-center border-2 border-zinc-100 shadow-inner">
                    <FileText className="w-10 h-10 opacity-10" />
                </div>
                <div className="text-center space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400 italic">No Attachments Found</h4>
                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest max-w-xs">Scan faktur, sertifikat, atau dokumen pendukung belum diupload.</p>
                </div>
            </TabsContent>
        </Tabs>
      </div>
    </FullscreenFormLayout>
  );
}
