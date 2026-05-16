import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { accountingApi, masterApi } from "../../lib/api-services";

export default function Ledger() {
  const [data, setData] = useState<{account: any, entries: any[]}>({ account: null, entries: []});
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<{id: string, name: string, code: string}[]>([]);
  const [accountId, setAccountId] = useState("");
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const loadAccounts = async () => {
    try {
      const body = await masterApi.getAccounts();
      setAccounts(body);
      if(body.length > 0) {
        setAccountId(body[0].id);
      }
    } catch (e: any) {
        toast.error(e.message || "Gagal mengambil daftar akun");
    }
  };

  const fetchLedger = async () => {
    if(!accountId) return;
    setLoading(true);
    try {
      const resData = await accountingApi.getLedger({ accountId, startDate, endDate });
      setData(resData);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengambil buku besar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if(accountId) fetchLedger();
  }, [accountId]);

  let runningBalance = 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Laporan Buku Besar</h1>
      </div>

      <div className="bg-white p-4 border rounded-lg flex gap-4 items-end">
         <div className="space-y-2 flex-grow">
            <Label>Pilih Akun</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={accountId} onChange={e => setAccountId(e.target.value)} required
            >
              {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
            </select>
         </div>
         <div className="space-y-2">
            <Label>Periode Dari</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
         </div>
         <div className="space-y-2">
            <Label>Periode Sampai</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
         </div>
         <Button onClick={fetchLedger}>Filter</Button>
      </div>

      <div className="rounded-md border bg-white">
        <div className="p-4 border-b flex justify-between bg-zinc-50">
           <div>
               <h2 className="font-bold">{data.account?.code} - {data.account?.name}</h2>
               <p className="text-xs text-zinc-500">Tipe Akun: {data.account?.type}</p>
           </div>
           <div className="text-right">
               <h2 className="font-bold text-xl">Rp {data.account?.balance.toLocaleString()}</h2>
               <p className="text-xs text-zinc-500">Saldo Akhir Aktual</p>
           </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>No. Bukti / Jurnal</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Kredit</TableHead>
              <TableHead className="text-right font-bold">Saldo Berjalan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : data.entries.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center">Belum ada transaksi</TableCell></TableRow>
            ) : (
              (data?.entries || []).map((e) => {
                const isDebitIncrease = ['ASSET', 'EXPENSE'].includes(data.account.type);
                if (isDebitIncrease) {
                    runningBalance += (e.debit - e.credit);
                } else {
                    runningBalance += (e.credit - e.debit);
                }
                
                return (
                 <TableRow key={e.id}>
                    <TableCell>{new Date(e.journal.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{e.journal.journalNumber}</TableCell>
                    <TableCell>{e.description || e.journal.description}</TableCell>
                    <TableCell className="text-right">{e.debit > 0 ? e.debit.toLocaleString() : '-'}</TableCell>
                    <TableCell className="text-right">{e.credit > 0 ? e.credit.toLocaleString() : '-'}</TableCell>
                    <TableCell className="text-right font-bold bg-zinc-50/50">Rp {runningBalance.toLocaleString()}</TableCell>
                 </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
