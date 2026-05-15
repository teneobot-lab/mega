import React from "react";
import { format } from "date-fns";

type VoucherPrintProps = {
  data: any;
  title?: string;
};

export const PrintVoucher: React.FC<VoucherPrintProps> = ({ data, title }) => {
  if (!data) return null;

  const displayTitle = title || (data.type === "RECEIVE" ? "BUKTI PENERIMAAN" : "BUKTI PEMBAYARAN");

  return (
    <div className="p-10 text-zinc-900 bg-white" id="printable-voucher">
      {/* Header */}
      <div className="flex justify-between border-b-2 border-zinc-800 pb-4 mb-8">
        <div>
           <h1 className="text-2xl font-black italic tracking-tighter text-red-700">ACCURATE</h1>
           <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Transaction Voucher</p>
        </div>
        <div className="text-right">
           <h2 className="text-xl font-bold uppercase">{displayTitle}</h2>
           <p className="text-sm font-mono font-bold text-zinc-500">{data.payNumber}</p>
        </div>
      </div>

      {/* Main Info */}
      <div className="space-y-4 mb-10">
        <div className="flex border-b border-zinc-200 pb-2">
            <span className="w-40 text-xs font-bold uppercase text-zinc-400">Tanggal:</span>
            <span className="text-sm">{format(new Date(data.date), "dd MMMM yyyy")}</span>
        </div>
        <div className="flex border-b border-zinc-200 pb-2">
            <span className="w-40 text-xs font-bold uppercase text-zinc-400">{data.type === "PAY" ? "Dibayar Kepada:" : "Diterima Dari:"}</span>
            <span className="text-sm font-bold">{data.contact?.name || "-"}</span>
        </div>
        <div className="flex border-b border-zinc-200 pb-2">
            <span className="w-40 text-xs font-bold uppercase text-zinc-400">Akun Kas/Bank:</span>
            <span className="text-sm font-medium">{data.account?.name || "Kas/Bank"}</span>
        </div>
        <div className="flex border-b border-zinc-200 pb-2">
            <span className="w-40 text-xs font-bold uppercase text-zinc-400">Keterangan:</span>
            <span className="text-sm italic">{data.notes || "-"}</span>
        </div>
      </div>

      {/* Details Table */}
      <table className="w-full mb-12 text-sm border-collapse">
        <thead>
          <tr className="bg-zinc-50 border-y border-zinc-300">
            <th className="py-2 text-left px-2">No. Referensi (Invoice)</th>
            <th className="py-2 text-right px-2">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-zinc-100">
            <td className="py-4 px-2">{data.invoice?.invNumber || "N/A"}</td>
            <td className="py-4 px-2 text-right font-bold">Rp {data.amount.toLocaleString()}</td>
          </tr>
          <tr className="bg-zinc-50 font-bold border-t border-zinc-800">
             <td className="py-3 px-2 uppercase tracking-tighter">TOTAL {data.type === 'PAY' ? 'PENGELUARAN' : 'PENERIMAAN'}</td>
             <td className="py-3 px-2 text-right text-lg underline underline-offset-4">Rp {data.amount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {/* Terbilang */}
      <div className="mb-10 p-4 border border-zinc-200 rounded italic text-xs bg-zinc-50">
        <span className="font-bold">Terbilang:</span> 
        <span className="ml-2 font-medium"># (Dua Juta Lima Ratus Ribu Rupiah) #</span> 
        <p className="mt-1 text-[10px] text-zinc-400">*Placeholder terbilang logic needed for full accuracy</p>
      </div>

      {/* Approvals */}
      <div className="grid grid-cols-4 gap-4 text-center text-[10px] uppercase font-bold">
        <div className="space-y-12">
            <p className="border-b border-zinc-200 pb-1">Dibuat Oleh</p>
            <p>( .................... )</p>
        </div>
        <div className="space-y-12">
            <p className="border-b border-zinc-200 pb-1">Diperiksa Oleh</p>
            <p>( .................... )</p>
        </div>
        <div className="space-y-12">
            <p className="border-b border-zinc-200 pb-1">Disetujui Oleh</p>
            <p>( .................... )</p>
        </div>
        <div className="space-y-12">
            <p className="border-b border-zinc-200 pb-1">Penerima</p>
            <p>( .................... )</p>
        </div>
      </div>
    </div>
  );
};
