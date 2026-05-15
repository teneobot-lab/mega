import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Truck, Plus, Calendar, ArrowRightSquare, Warehouse, FileText } from "lucide-react";

export default function SalesDelivery() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await fetch("/api/transactions/delivery", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Gagal mengambil data pengiriman");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic italic">Pengiriman Barang</h1>
            <p className="text-xs text-zinc-500 font-medium tracking-tight uppercase italic opacity-70 tracking-widest leading-none tracking-widest">Manajemen pengeluaran barang pesanan (Delivery Order)</p>
        </div>
        <Button 
            onClick={() => navigate("/sales/delivery/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
            <Truck className="w-4 h-4" /> Kirim Barang
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden text-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic tracking-widest italic">
              <TableHead className="pl-6">Status</TableHead>
              <TableHead>No. Dokumen</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Ref Sales Order</TableHead>
              <TableHead>Gudang Asal</TableHead>
              <TableHead className="text-center w-24 pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-20 text-zinc-400 font-medium uppercase tracking-widest italic">Memuat data pengiriman...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-24 text-zinc-300 font-black uppercase tracking-[0.2em] italic opacity-40">Belum ada pengiriman (DO)</TableCell></TableRow>
            ) : (
              data.map((d) => (
                <TableRow 
                    key={d.id} 
                    className="h-16 group hover:bg-zinc-50 transition-all active:bg-zinc-100 cursor-pointer"
                    onClick={() => navigate(`/sales/delivery/${d.id}`)}
                >
                  <TableCell className="pl-6">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
                      DELIVERED
                    </span>
                  </TableCell>
                  <TableCell className="font-black text-[#1e3a5f]">
                    <div className="flex flex-col">
                        <span>{d.transNumber}</span>
                        <span className="text-[9px] font-bold text-zinc-400 tracking-widest">#{d.id.slice(-6)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-zinc-500 italic">
                      <div className="flex items-center gap-1.5 uppercase leading-none">
                        <Calendar className="w-3 h-3 text-zinc-300" />
                        {new Date(d.date).toLocaleDateString()}
                      </div>
                  </TableCell>
                  <TableCell className="font-bold text-zinc-700 uppercase italic">
                    <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3 text-zinc-300" />
                        {d.reference || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-[#1e3a5f] uppercase italic">
                    <div className="flex items-center gap-2">
                         <Warehouse className="w-3 h-3 text-zinc-300" />
                         {d.warehouseFrom?.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center pr-6">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-zinc-300 group-hover:text-[#1e3a5f] rounded-full"
                    >
                        <ArrowRightSquare className="h-5 w-5" />
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
