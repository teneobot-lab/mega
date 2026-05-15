import { Box } from "lucide-react";

export default function WorkInProgress() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Box className="w-24 h-24 text-zinc-300" />
      <h1 className="text-2xl font-bold tracking-tight">Dalam Pengembangan</h1>
      <p className="text-zinc-500 max-w-md text-center">
        Modul / Fitur ini belum diimplementasikan sepenuhnya. Kami menggunakan Invoice (Faktur) untuk mencatat penjualan/pembelian dan mutasi stok secara langsung.
      </p>
    </div>
  );
}
