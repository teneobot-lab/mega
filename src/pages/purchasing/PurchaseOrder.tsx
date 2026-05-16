import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Printer, ShoppingCart, CheckCircle, ChevronDown, ChevronUp, FileText, Package, Receipt as ReceiptIcon } from "lucide-react";
import { PrintInvoice } from "../../components/PrintInvoice";
import { PrintPreviewDialog } from "../../components/PrintPreviewDialog";
import { purchasingApi } from "../../lib/api-services";
import { formatCurrency, formatDate, cn } from "../../lib/utils";
import { TableSkeleton } from "../../components/ui/table-skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { ErrorMessage } from "../../components/ui/error-message";
import { StatusBadge } from "../../components/ui/status-badge";

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
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [printData, setPrintData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await purchasingApi.getOrders();
      setData(resData);
    } catch (e: any) {
      setError(e.message || "Gagal mengambil data PO");
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tighter text-[#1e3a5f] uppercase italic italic">
            Pesanan Pembelian
          </h1>
          <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase italic opacity-70 leading-none">
            Manajemen procurement dan vendor order
          </p>
        </div>
        <Button
          onClick={() => navigate("/purchasing/po/new")}
          className="bg-[#1e3a5f] hover:bg-[#2a5286] text-white font-black uppercase italic tracking-widest gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 px-8 h-12 rounded-full"
        >
          <Plus className="w-5 h-5" /> Buat PO Baru
        </Button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden text-sm">
        {error ? (
          <ErrorMessage message={error} onRetry={fetchData} className="py-20" />
        ) : loading ? (
          <div className="p-8">
            <TableSkeleton rowCount={8} columnCount={6} />
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            title="Belum ada pesanan pembelian"
            description="Lacak semua pesanan barang atau jasa kepada pemasok Anda di sini."
            actionLabel="Buat PO Pertama"
            onAction={() => navigate("/purchasing/po/new")}
            icon={<ShoppingCart className="h-10 w-10 text-zinc-300" />}
            className="py-24"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow className="h-14 text-zinc-500 uppercase font-black text-[10px] tracking-widest italic italic border-b border-zinc-100">
                  <TableHead className="pl-10 w-32">Status</TableHead>
                  <TableHead>Nomor PO</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Nilai Total</TableHead>
                  <TableHead className="text-center w-32 pr-10">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((po) => (
                  <React.Fragment key={po.id}>
                    <TableRow
                      className={cn(
                        "h-20 group hover:bg-zinc-50 transition-all cursor-pointer border-b border-zinc-50 last:border-0",
                        expandedId === po.id && "bg-zinc-50/50 border-b-0"
                      )}
                      onClick={(e) => toggleExpand(po.id, e)}
                    >
                      <TableCell className="pl-10">
                        <StatusBadge status={po.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[#1e3a5f] uppercase tracking-tighter text-base group-hover:underline decoration-2 underline-offset-4">
                            {po.number}
                          </span>
                          {expandedId === po.id ? (
                            <ChevronUp className="w-4 h-4 text-[#1e3a5f] animate-bounce" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-zinc-300 group-hover:text-[#1e3a5f] transition-colors" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-zinc-500 italic">
                          {formatDate(po.date)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-black text-zinc-700 uppercase italic italic group-hover:text-[#1e3a5f] transition-colors text-sm">
                          {po.supplier?.name || "Unspecified Supplier"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-black text-[#1e3a5f] tabular-nums text-xl italic italic leading-none">
                        {formatCurrency(po.total)}
                      </TableCell>
                      <TableCell className="text-center pr-10">
                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 text-zinc-300 hover:text-red-600 hover:bg-white hover:shadow-md rounded-full transition-all"
                            onClick={(e) => handlePrint(po, e)}
                          >
                            <Printer className="h-5 w-5" />
                          </Button>
                          {po.status === "DRAFT" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 p-0 text-green-600 hover:bg-white hover:shadow-md rounded-full transition-all"
                              onClick={(e) => handleApprove(po.id, e)}
                            >
                              <CheckCircle className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedId === po.id && (
                      <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50 border-t-0">
                        <TableCell colSpan={6} className="p-10 pt-0">
                          <div className="space-y-10 animate-in slide-in-from-top-4 duration-500 flex flex-col">
                            {/* PO LINES */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#1e3a5f] flex items-center gap-3 italic">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                                  Detail Item Pesanan
                                </h3>
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{po.Lines?.length || 0} Line Items</span>
                              </div>
                              <div className="rounded-[2rem] border border-zinc-200 bg-white overflow-hidden shadow-xl ring-1 ring-zinc-50">
                                <Table>
                                  <TableHeader className="bg-zinc-50/50 border-b border-zinc-100">
                                    <TableRow className="h-12">
                                      <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Item</TableHead>
                                      <TableHead className="text-center w-32 text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Quantity</TableHead>
                                      <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Harga Satuan</TableHead>
                                      <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Subtotal</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {po.Lines?.map((line: any) => (
                                      <TableRow key={line.id} className="h-16 hover:bg-zinc-50/50 border-b border-zinc-50 last:border-0 transition-colors">
                                        <TableCell className="pl-8">
                                          <div className="flex flex-col">
                                            <span className="font-black text-[#1e3a5f] text-sm italic uppercase tracking-tight">{line.item?.name}</span>
                                            <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">{line.item?.code}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-center font-black text-zinc-700 text-base">{line.qty}</TableCell>
                                        <TableCell className="text-right text-sm font-bold text-zinc-500 tabular-nums">{formatCurrency(line.price)}</TableCell>
                                        <TableCell className="text-right font-black text-[#1e3a5f] pr-8 tabular-nums text-lg italic">{formatCurrency(line.total)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              {/* ASSOCIATED RECEIPTS */}
                              <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 flex items-center gap-3 italic">
                                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                                  Penerimaan Barang
                                </h3>
                                <div className="rounded-[2rem] border border-zinc-200 bg-white overflow-hidden shadow-lg ring-1 ring-zinc-50">
                                  <Table>
                                    <TableHeader className="bg-zinc-50/50 border-b border-zinc-100">
                                      <TableRow className="h-10">
                                        <TableHead className="pl-6 text-[9px] font-black uppercase tracking-widest text-zinc-400">ID Receipt</TableHead>
                                        <TableHead className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Tanggal</TableHead>
                                        <TableHead className="text-right pr-6 text-[9px] font-black uppercase tracking-widest text-zinc-400">Total Items</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {(po as any).Receipts?.length > 0 ? (po as any).Receipts.map((rec: any) => (
                                        <TableRow key={rec.id} className="cursor-pointer hover:bg-amber-50/30 h-14" onClick={() => navigate(`/inventory/receipt`)}>
                                          <TableCell className="pl-6 font-black text-[#1e3a5f] text-xs underline decoration-amber-200 underline-offset-4">{rec.transNumber}</TableCell>
                                          <TableCell className="text-xs font-bold text-zinc-400 italic">{formatDate(rec.date)}</TableCell>
                                          <TableCell className="text-right font-black text-[#1e3a5f] pr-6 italic">{rec.Lines?.length || 0} Units</TableCell>
                                        </TableRow>
                                      )) : (
                                        <TableRow>
                                          <TableCell colSpan={3} className="text-center py-10">
                                            <div className="flex flex-col items-center gap-2 opacity-30">
                                              <Package className="w-6 h-6" />
                                              <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">No delivery records found</span>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>

                              {/* ASSOCIATED INVOICES */}
                              <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 flex items-center gap-3 italic">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                                  Faktur Terkait
                                </h3>
                                <div className="rounded-[2rem] border border-zinc-200 bg-white overflow-hidden shadow-lg ring-1 ring-zinc-50">
                                  <Table>
                                    <TableHeader className="bg-zinc-50/50 border-b border-zinc-100">
                                      <TableRow className="h-10">
                                        <TableHead className="pl-6 text-[9px] font-black uppercase tracking-widest text-zinc-400">No. Faktur</TableHead>
                                        <TableHead className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Status</TableHead>
                                        <TableHead className="text-right pr-6 text-[9px] font-black uppercase tracking-widest text-zinc-400">Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {(po as any).Invoices?.length > 0 ? (po as any).Invoices.map((inv: any) => (
                                        <TableRow key={inv.id} className="cursor-pointer hover:bg-emerald-50/30 h-14" onClick={() => navigate(`/purchasing/invoice`)}>
                                          <TableCell className="pl-6 font-black text-[#1e3a5f] text-xs underline decoration-emerald-200 underline-offset-4">{inv.invNumber}</TableCell>
                                          <TableCell>
                                            <StatusBadge status={inv.status} className="scale-75 origin-left" />
                                          </TableCell>
                                          <TableCell className="text-right font-black text-[#1e3a5f] pr-6 tabular-nums italic">{formatCurrency(inv.total)}</TableCell>
                                        </TableRow>
                                      )) : (
                                        <TableRow>
                                          <TableCell colSpan={3} className="text-center py-10">
                                            <div className="flex flex-col items-center gap-2 opacity-30">
                                              <ReceiptIcon className="w-6 h-6" />
                                              <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">No invoice records found</span>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
