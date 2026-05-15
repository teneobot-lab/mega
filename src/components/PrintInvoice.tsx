import React from "react";
import { format } from "date-fns";

type InvoicePrintProps = {
  data: any;
  title?: string;
};

export const PrintInvoice: React.FC<InvoicePrintProps> = ({ data, title }) => {
  if (!data) return null;

  const displayTitle = title || (data.type === "SALES" ? "FAKTUR PENJUALAN" : "FAKTUR PEMBELIAN");
  const isPurchase = data.type === "PURCHASE";

  return (
    <div className="p-10 text-zinc-900 bg-white" id="printable-invoice">
      {/* Header */}
      <div className="flex justify-between border-b-2 border-zinc-800 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-red-700">ACCURATE</h1>
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">Local Replica Enterprise</p>
          <div className="mt-4 text-xs font-medium">
            <p>PT. SOLUSI BISNIS MODERN</p>
            <p>Jl. Perkantoran Akuntansi No. 123</p>
            <p>Jakarta, Indonesia</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase">{displayTitle}</h2>
          <p className="text-lg font-mono font-bold text-zinc-600">{data.invNumber}</p>
          <div className="mt-4 text-xs space-y-1">
            <p><span className="font-bold">Tanggal:</span> {format(new Date(data.date), "dd/MM/yyyy")}</p>
            <p><span className="font-bold">Jatuh Tempo:</span> {data.dueDate ? format(new Date(data.dueDate), "dd/MM/yyyy") : "-"}</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-10 mb-8">
        <div>
          <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">{isPurchase ? "Pemasok:" : "Tagihan Kepada:"}</p>
          <p className="font-bold text-lg">{data.contact?.name}</p>
          <p className="text-xs text-zinc-600 font-medium">{data.contact?.address || "Alamat tidak tersedia"}</p>
        </div>
        <div className="text-right border-l-2 border-zinc-100 pl-4">
          <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Keterangan:</p>
          <p className="text-xs text-zinc-600 italic leading-relaxed">{data.notes || "-"}</p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full mb-10 text-sm border-collapse">
        <thead>
          <tr className="border-y-2 border-zinc-800">
            <th className="py-2 text-left w-12">No</th>
            <th className="py-2 text-left">Deskripsi Barang</th>
            <th className="py-2 text-center w-24">QTY</th>
            <th className="py-2 text-right w-40">Harga (Rp)</th>
            <th className="py-2 text-right w-40">Total (Rp)</th>
          </tr>
        </thead>
        <tbody>
          {data.Lines?.map((line: any, idx: number) => (
            <tr key={idx} className="border-b border-zinc-200">
              <td className="py-3 text-left">{idx + 1}</td>
              <td className="py-3 text-left">
                <p className="font-bold">{line.item?.name}</p>
                <p className="text-[10px] text-zinc-500 font-mono">{line.item?.code}</p>
              </td>
              <td className="py-3 text-center">{line.qty} {line.item?.unit}</td>
              <td className="py-3 text-right">{line.price.toLocaleString()}</td>
              <td className="py-3 text-right font-bold">{line.total.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex justify-between">
        <div className="w-1/2">
          <div className="border border-zinc-200 p-4 rounded text-[10px] text-zinc-500 italic">
            <p className="font-bold mb-1 underline">Syarat & Ketentuan:</p>
            <p>1. Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.</p>
            <p>2. Pembayaran harap ditujukan ke rekening Perusahaan.</p>
            <p>3. Faktur ini sah jika sudah divalidasi oleh sistem.</p>
          </div>
        </div>
        <div className="w-1/3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-bold">Rp {data.subTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Pajak (0%):</span>
            <span className="font-bold">Rp 0</span>
          </div>
          <div className="flex justify-between border-t-2 border-zinc-800 pt-2 text-lg">
            <span className="font-bold uppercase tracking-tighter">Total Akhir:</span>
            <span className="font-bold text-red-700">Rp {data.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="grid grid-cols-3 mt-20 text-center text-xs gap-10">
        <div className="space-y-16">
          <p>Diterima Oleh,</p>
          <div className="border-t border-zinc-400 mx-8"></div>
        </div>
        <div></div>
        <div className="space-y-16">
          <p>Hormat Kami,</p>
          <div className="border-t border-zinc-400 mx-8"></div>
        </div>
      </div>
    </div>
  );
};
