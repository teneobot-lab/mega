import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Printer, ShoppingCart, CheckCircle } from "lucide-react";
import { PrintInvoice } from "../../components/PrintInvoice";
import { PrintPreviewDialog } from "../../components/PrintPreviewDialog";
import { purchasingApi } from "../../lib/api-services";

type PO = {
  id: string;
  number: string;
  date: string;
  supplier: { name: string, address?: string };
  status: string;
  total: number;
  Notes?: string;
  Lines?: any[];
};

export default function PurchaseOrder() {
  const [data, setData] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [printData, setPrintData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  const fetchData = async () => {
    try {
      const resData = await purchasingApi.getOrders();
      setData(resData);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengambil data PO");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await purchasingApi.approveOrder(id);
      toast.success("PO berhasil disetujui");
      fetchData();
    } catch(e: any) {
      toast.error(e.message || "Gagal menyetujui PO");
    }
  };

  const handlePrint = (po: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const printObj = {
        ...po,
        invNumber: po.number,
        contact: po.supplier,
        type: "PURCHASE",
    };
    setPrintData(printObj);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        <PrintInvoice data={printData} title="PESANAN PEMBELIAN" />
      </div>

      <PrintPreviewDialog 
        open={showPreview}
        onOpenChange={setShowPreview}
        title="Pesanan Pembelian"
        data={printData}
        Component={(props) => <PrintInvoice {...props} title="PESANAN PEMBELIAN" />}
      />

      <div className="flex items-center justify-between print:hidden">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tighter text-[#1e3a5f] uppercase italic">Daftar Pesanan Pembelian</h1>
            <p className="text-xs text-zinc-500 font-medium">Lacak pesanan kepada pemasok / vendor anda</p>
        </div>
        <Button 
            onClick={() => navigate("/purchasing/po/new")}
            className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-bold gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Buat PO Baru
        </Button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-12 text-zinc-500 uppercase font-black text-[10px] tracking-widest text-center">
              <TableHead className="pl-6 text-left">Status</TableHead>
              <TableHead className="text-left">Nomor PO</TableHead>
              <TableHead className="text-left">Tanggal</TableHead>
              <TableHead className="text-left">Supplier</TableHead>
              <TableHead className="text-right">Nilai Total</TableHead>
              <TableHead className="pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                        <ShoppingCart className="h-12 w-12" />
                        <p className="text-sm font-bold uppercase tracking-widest">Belum ada data PO</p>
                    </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((po) => (
                <React.Fragment key={po.id}>
                  <TableRow 
                      className={`group hover:bg-zinc-50 transition-colors h-14 cursor-pointer ${expandedId === po.id ? 'bg-zinc-50 border-b-0' : ''}`}
                      onClick={(e) => toggleExpand(po.id, e)}
                  >
                    <TableCell className="pl-6">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${po.status === 'DRAFT' ? 'bg-zinc-100' : po.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'} shadow-sm`}>
                        {po.status}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-[#1e3a5f] group-hover:underline ">{po.number}</TableCell>
                    <TableCell className="text-xs font-medium text-zinc-500">{new Date(po.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell className="text-sm font-bold text-zinc-700">{po.supplier?.name}</TableCell>
                    <TableCell className="text-right font-black text-[#1e3a5f] tabular-nums">Rp {po.total?.toLocaleString()}</TableCell>
                    <TableCell className="text-center pr-6">
                      <div className="flex items-center justify-center gap-1">
                          <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                              onClick={(e) => handlePrint(po, e)}
                          >
                              <Printer className="h-4 w-4" />
                          </Button>
                          {po.status === "DRAFT" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => handleApprove(po.id, e)} 
                              className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-zinc-400"
                              onClick={() => navigate(`/purchasing/po/${po.id}`)}
                          >
                              <Plus className="h-4 w-4 rotate-45" />
                          </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedId === po.id && (
                    <TableRow className="bg-zinc-50/50 border-t-0 hover:bg-zinc-50/50">
                      <TableCell colSpan={6} className="p-0 border-t-0">
                        <div className="px-6 py-4 space-y-6 animate-in slide-in-from-top-2 duration-300">
                          {/* PO LINES */}
                          <div className="space-y-2">
                             <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2 flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Detail Item Pesanan
                             </h3>
                             <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                               <Table>
                                 <TableHeader className="bg-zinc-50/50">
                                   <TableRow>
                                     <TableHead className="pl-4">Item</TableHead>
                                     <TableHead className="text-center w-24">Qty</TableHead>
                                     <TableHead className="text-right">Harga</TableHead>
                                     <TableHead className="text-right pr-4">Total</TableHead>
                                   </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                   {po.Lines?.map((line: any) => (
                                     <TableRow key={line.id}>
                                       <TableCell className="pl-4 font-bold text-[#1e3a5f] text-xs">
                                         {line.item?.name}
                                         <div className="text-[10px] font-medium text-zinc-400 tracking-tight">{line.item?.code}</div>
                                       </TableCell>
                                       <TableCell className="text-center font-bold text-sm">{line.qty}</TableCell>
                                       <TableCell className="text-right text-xs">Rp {line.price.toLocaleString()}</TableCell>
                                       <TableCell className="text-right font-black text-[#1e3a5f] pr-4">Rp {line.total.toLocaleString()}</TableCell>
                                     </TableRow>
                                   ))}
                                 </TableBody>
                               </Table>
                             </div>
                          </div>

                          {/* ASSOCIATED RECEIPTS */}
                          <div className="space-y-2">
                             <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2 flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Penerimaan Barang (Receipts)
                             </h3>
                             <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                               <Table>
                                 <TableHeader className="bg-zinc-50/50">
                                   <TableRow>
                                     <TableHead className="pl-4">Nomor Penerimaan</TableHead>
                                     <TableHead>Tanggal</TableHead>
                                     <TableHead>Gudang</TableHead>
                                     <TableHead className="text-right pr-4">Total Items</TableHead>
                                   </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                   {(po as any).Receipts?.length > 0 ? (po as any).Receipts.map((rec: any) => (
                                     <TableRow key={rec.id} className="cursor-pointer hover:bg-zinc-50" onClick={() => navigate(`/inventory/receipt`)}>
                                       <TableCell className="pl-4 font-bold text-[#1e3a5f] text-xs underline">{rec.transNumber}</TableCell>
                                       <TableCell className="text-xs font-medium text-zinc-500">{new Date(rec.date).toLocaleDateString('id-ID')}</TableCell>
                                       <TableCell className="text-sm font-semibold">{rec.warehouseTo?.name || "N/A"}</TableCell>
                                       <TableCell className="text-right font-black text-[#1e3a5f] pr-4">{rec.Lines?.length || 0} Items</TableCell>
                                     </TableRow>
                                   )) : (
                                      <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4 text-xs font-bold text-zinc-300 uppercase italic">Belum ada penerimaan barang</TableCell>
                                      </TableRow>
                                   )}
                                 </TableBody>
                               </Table>
                             </div>
                          </div>

                          {/* ASSOCIATED INVOICES */}
                          <div className="space-y-2">
                             <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2 flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Faktur Terkait (Invoices)
                             </h3>
                             <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                               <Table>
                                 <TableHeader className="bg-zinc-50/50">
                                   <TableRow>
                                     <TableHead className="pl-4">Nomor Faktur</TableHead>
                                     <TableHead>Tanggal</TableHead>
                                     <TableHead>Status</TableHead>
                                     <TableHead className="text-right pr-4">Total</TableHead>
                                   </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                   {(po as any).Invoices?.length > 0 ? (po as any).Invoices.map((inv: any) => (
                                     <TableRow key={inv.id} className="cursor-pointer hover:bg-zinc-50" onClick={() => navigate(`/purchasing/invoice`)}>
                                       <TableCell className="pl-4 font-bold text-[#1e3a5f] text-xs underline">{inv.invNumber}</TableCell>
                                       <TableCell className="text-xs font-medium text-zinc-500">{new Date(inv.date).toLocaleDateString('id-ID')}</TableCell>
                                       <TableCell>
                                         <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                           {inv.status}
                                         </span>
                                       </TableCell>
                                       <TableCell className="text-right font-black text-[#1e3a5f] pr-4">Rp {inv.total.toLocaleString()}</TableCell>
                                     </TableRow>
                                   )) : (
                                      <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4 text-xs font-bold text-zinc-300 uppercase italic">Belum ada faktur yang terbit</TableCell>
                                      </TableRow>
                                   )}
                                 </TableBody>
                               </Table>
                             </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
