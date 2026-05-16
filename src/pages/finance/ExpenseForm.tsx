import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { 
  Save, 
  Plus, 
  Trash2, 
  Printer, 
  X, 
  ChevronRight, 
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { terbilang } from "../../lib/invoice-utils";
import { financeApi, masterApi } from "../../lib/api-services";
import { useNavigate } from "react-router-dom";

const expenseSchema = z.object({
  paymentNumber: z.string().min(1, "No. Bukti wajib diisi"),
  paymentDate: z.string().min(1, "Tanggal wajib diisi"),
  bankAccountId: z.string().min(1, "Akun Kas/Bank wajib diisi"),
  memo: z.string().optional(),
  items: z.array(z.object({
    accountId: z.string().min(1, "Akun wajib diisi"),
    amount: z.number().min(0.01, "Jumlah minimal 1"),
    notes: z.string().optional()
  })).min(1, "Minimal harus ada 1 detail")
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function ExpenseForm() {
  const [status, setStatus] = useState<"Draft" | "Posted" | "Cancelled">("Draft");
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const navigate = useNavigate();

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      paymentNumber: "PV." + format(new Date(), "yyyyMMdd") + ".001",
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      bankAccountId: "",
      memo: "",
      items: [{ accountId: "", amount: 0, notes: "" }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const watchedBankId = watch("bankAccountId");

  const loadAccounts = async () => {
    try {
      const allAccs = await masterApi.getAccounts();
      setAccounts(allAccs);
    } catch (e: any) {
      toast.error("Gagal memuat daftar akun: " + (e.message || ""));
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const total = watchedItems.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const onSubmit = async (data: ExpenseFormValues) => {
    setLoading(true);
    try {
      await financeApi.createExpense({
          date: data.paymentDate,
          bankAccountId: data.bankAccountId,
          targetAccountId: data.items[0].accountId,
          amount: total,
          notes: data.memo || data.items[0].notes
      });
      toast.success("Pembayaran Berhasil Disimpan!");
      setStatus("Posted");
      setTimeout(() => navigate("/cash-bank/expense"), 1500);
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan transaksi");
    } finally {
      setLoading(false);
    }
  };

  const selectedBank = accounts.find(a => a.id === watchedBankId);

  return (
    <div className="flex flex-col h-screen bg-[#f3f4f6] text-[#333] font-sans overflow-hidden">
      {/* HEADER ACTION BAR */}
      <div className="bg-[#b91c1c] text-white px-4 py-2 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center space-x-2">
          <div className="flex flex-col">
            <div className="flex items-center text-[10px] opacity-70">
              <span>Kas & Bank</span>
              <ChevronRight className="w-3 h-3 mx-1" />
              <span>Pembayaran</span>
              <ChevronRight className="w-3 h-3 mx-1" />
              <span className="font-semibold text-white">Baru</span>
            </div>
            <h1 className="text-sm font-bold uppercase tracking-wider">Pembayaran Kas & Bank</h1>
          </div>
          <div className={cn(
            "ml-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase",
            status === "Draft" ? "bg-amber-500 text-white" :
            status === "Posted" ? "bg-green-600 text-white" : "bg-zinc-600 text-white"
          )}>
            {status}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={handleSubmit(onSubmit)} disabled={loading} size="sm" className="bg-white text-red-700 hover:bg-zinc-100 h-8 text-xs font-bold">
            {loading ? <span className="animate-spin mr-1">○</span> : <Save className="w-3.5 h-3.5 mr-1.5" />}
            SIMPAN
          </Button>
          <Button size="sm" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 h-8 text-xs">
            SIMPAN & BARU
          </Button>
          <Button size="sm" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 h-8 text-xs">
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            PRINT
          </Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 h-8" onClick={() => navigate("/cash-bank/expense")}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* SECTION 1 - MAIN INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded shadow-sm border border-zinc-200">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Label className="w-32 text-xs font-semibold text-zinc-600">No. Bukti</Label>
              <Input {...register("paymentNumber")} className={cn("h-8 text-xs border-zinc-300", errors.paymentNumber && "border-red-500")} />
            </div>
            <div className="flex items-center gap-3">
              <Label className="w-32 text-xs font-semibold text-zinc-600">Tanggal</Label>
              <Input type="date" {...register("paymentDate")} className="h-8 text-xs border-zinc-300" />
            </div>
            <div className="flex items-start gap-3">
              <Label className="w-32 text-xs font-semibold text-zinc-600 mt-2">Keterangan</Label>
              <textarea {...register("memo")} className="flex-1 min-h-[50px] rounded-sm border border-zinc-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-600" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Label className="w-32 text-xs font-semibold text-zinc-600">Bayar Dari (Kas/Bank)</Label>
              <div className="flex-1 space-y-1">
                <select {...register("bankAccountId")} className={cn("w-full h-8 text-xs border rounded px-2 outline-none", errors.bankAccountId ? "border-red-500" : "border-zinc-300")}>
                  <option value="">Pilih Akun Kas/Bank...</option>
                  {accounts.filter(a => a.type === 'ASSET' && (a.name.toLowerCase().includes('kas') || a.name.toLowerCase().includes('bank'))).map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
                {selectedBank && <p className="text-[10px] text-zinc-500 pl-1">Saldo Saat Ini: Rp {selectedBank.balance?.toLocaleString()}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 - DETAIL TABLE */}
        <div className="bg-white rounded shadow-sm border border-zinc-200 flex flex-col overflow-hidden min-h-[300px]">
          <div className="flex-1 overflow-x-auto">
            <Table className="table-fixed w-full min-w-full">
              <TableHeader className="bg-[#f8fafc]">
                <TableRow className="h-8">
                  <TableHead className="w-[40px] text-[10px] font-bold text-center border-r">No</TableHead>
                  <TableHead className="text-[10px] font-bold border-r">Akun (Alokasi Biaya/Lainnya)</TableHead>
                  <TableHead className="w-[150px] text-[10px] font-bold text-right border-r">Jumlah (Rp)</TableHead>
                  <TableHead className="text-[10px] font-bold border-r">Keterangan</TableHead>
                  <TableHead className="w-[50px] text-[10px] font-bold text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id} className="h-8 hover:bg-zinc-100">
                    <TableCell className="p-0 text-center text-[10px] border-r">{index + 1}</TableCell>
                    <TableCell className="p-0 border-r">
                       <select {...register(`items.${index}.accountId`)} className="w-full h-8 text-[11px] bg-transparent outline-none px-2">
                        <option value="">Pilih Akun...</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                      </select>
                    </TableCell>
                    <TableCell className="p-0 border-r">
                      <Input type="number" {...register(`items.${index}.amount`, { valueAsNumber: true })} className="h-8 text-[11px] border-none focus-visible:ring-0 rounded-none bg-transparent text-right pr-2" />
                    </TableCell>
                    <TableCell className="p-0 border-r">
                      <Input {...register(`items.${index}.notes`)} className="h-8 text-[11px] border-none focus-visible:ring-0 rounded-none bg-transparent px-2" />
                    </TableCell>
                    <TableCell className="p-0 text-center">
                      <button type="button" className="text-zinc-400 hover:text-red-500" onClick={() => fields.length > 1 && remove(index)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="h-8 cursor-pointer hover:bg-zinc-50 border-t border-dashed" onClick={() => append({ accountId: "", amount: 0, notes: "" })}>
                  <TableCell colSpan={5} className="text-center text-[10px] text-zinc-400 italic">
                    <Plus className="w-3 h-3 inline mr-1" /> Klik di sini untuk tambah detail alokasi biaya
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* SECTION 3 - FOOTER SUMMARY */}
        <div className="flex justify-end pb-10">
          <div className="w-full lg:w-1/2 bg-white p-4 rounded shadow-sm border border-red-600/20 flex flex-col space-y-2">
            <div className="flex justify-between items-center py-1">
              <span className="text-red-700 font-bold text-sm uppercase">Total Pembayaran</span>
              <span className="text-xl font-black text-red-700">Rp {total.toLocaleString()}</span>
            </div>
            <div className="bg-zinc-50 p-2 rounded border border-zinc-100">
              <span className="text-[9px] text-zinc-400 block uppercase font-bold mb-0.5">Terbilang</span>
              <span className="text-[10px] font-medium text-zinc-600 italic">"# {terbilang(total)} #"</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm border border-zinc-200 mb-10 overflow-hidden">
          <Tabs defaultValue="journal" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b h-9 bg-zinc-50 px-2">
              <TabsTrigger value="journal" className="text-[10px] font-bold uppercase tracking-tighter">Jurnal Otomatis</TabsTrigger>
              <TabsTrigger value="audit" className="text-[10px] font-bold uppercase tracking-tighter">Audit Trail</TabsTrigger>
            </TabsList>
            <TabsContent value="journal" className="p-0">
               <Table className="text-[10px]">
                 <TableHeader className="bg-zinc-50"><TableRow className="h-7"><TableHead>Kode Akun</TableHead><TableHead>Nama Akun</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Kredit</TableHead></TableRow></TableHeader>
                 <TableBody>
                   {watchedItems.map((item, idx) => {
                     const acc = accounts.find(a => a.id === item.accountId);
                     return (
                       <TableRow key={idx} className="h-7">
                         <TableCell className="font-mono text-blue-600">{acc?.code || '-'}</TableCell>
                         <TableCell>{acc?.name || 'Alokasi'}</TableCell>
                         <TableCell className="text-right">Rp {(item.amount || 0).toLocaleString()}</TableCell>
                         <TableCell className="text-right">0</TableCell>
                       </TableRow>
                     );
                   })}
                   <TableRow className="h-7 text-zinc-500">
                      <TableCell className="font-mono pl-4">{selectedBank?.code || '-'}</TableCell>
                      <TableCell className="pl-4">{selectedBank?.name || 'Kas/Bank'}</TableCell>
                      <TableCell className="text-right">0</TableCell>
                      <TableCell className="text-right">Rp {total.toLocaleString()}</TableCell>
                   </TableRow>
                 </TableBody>
               </Table>
            </TabsContent>
          </Tabs>
        </div>
      </form>
    </div>
  );
}
