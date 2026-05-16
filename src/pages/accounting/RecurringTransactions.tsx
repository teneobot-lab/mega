import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table";
import { Play, Plus } from "lucide-react";
import { format } from "date-fns";
import { recurringApi } from "../../lib/api-services";

export default function RecurringTransactions() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const resData = await recurringApi.getRecurring();
      setData(resData);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExecute = async (id: string) => {
    try {
      await recurringApi.executeRecurring(id);
      toast.success("Transaksi berhasil diproses");
      fetchData();
    } catch(e: any) {
      toast.error(e.message || "Gagal menjalankan transaksi");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transaksi Berulang (Recurring)</h1>
          <p className="text-zinc-500">Otomatisasi pencatatan jurnal atau biaya rutin.</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" /> Buat Penjadwalan
        </Button>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead>Nama Transaksi</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Frekuensi</TableHead>
              <TableHead>Jatuh Tempo Berikutnya</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-zinc-500 italic">Belum ada transaksi berulang yang dijadwalkan</TableCell></TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold">{item.name}</TableCell>
                  <TableCell className="text-xs">{item.type}</TableCell>
                  <TableCell className="text-xs">{item.frequency}</TableCell>
                  <TableCell className="text-xs">{format(new Date(item.nextDate), "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-right font-medium">Rp {item.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => handleExecute(item.id)}
                    >
                      <Play className="w-3.5 h-3.5 mr-1" /> Jalankan
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
