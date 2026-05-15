import React, { useState, useRef, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Trash2, Package, Hash, Layers, ShoppingCart, PlusCircle } from "lucide-react";
import { ItemAutocompleteModal } from "./ItemAutocompleteModal";

export interface CartItem {
  id: string; // Internal unique ID for the row
  itemId: string;
  name: string;
  code: string;
  uom: string;
  qty: number;
  price?: number;
  total?: number;
  [key: string]: any;
}

interface TransactionCartProps {
  items: CartItem[];
  availableItems: any[];
  onChange: (items: CartItem[]) => void;
  showPrice?: boolean;
}

export function TransactionCart({ items, availableItems, onChange, showPrice = false }: TransactionCartProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [tempQty, setTempQty] = useState<number>(0);
  const [activeItem, setActiveItem] = useState<any | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);

  const handleSelectItem = (item: any) => {
    setActiveItem(item);
    setShowModal(false);
    setSearchQuery(item.name);
    // Move focus to qty
    setTimeout(() => qtyInputRef.current?.focus(), 50);
  };

  const handleAddLine = () => {
    if (!activeItem || tempQty === 0) return;

    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      itemId: activeItem.id,
      name: activeItem.name,
      code: activeItem.code,
      uom: typeof activeItem.baseUom === 'string' ? activeItem.baseUom : activeItem.baseUom?.name || 'Unit',
      qty: tempQty,
      price: activeItem.sellPrice || 0,
      total: (activeItem.sellPrice || 0) * tempQty
    };

    onChange([...items, newItem]);
    
    // Reset inputs
    setActiveItem(null);
    setSearchQuery("");
    setTempQty(0);
    searchInputRef.current?.focus();
  };

  const handleUpdateQty = (id: string, newQty: number) => {
    const updated = items.map(line => 
      line.id === id ? { ...line, qty: newQty, total: (line.price || 0) * newQty } : line
    );
    onChange(updated);
  };

  const handleRemoveLine = (id: string) => {
    onChange(items.filter(line => line.id !== id));
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Table Toolbar / Input Section */}
      <div className="bg-[#F0F4F8] border-b border-[#C8D0DA] p-2 flex items-center gap-2">
          <div className="flex items-center gap-3">
              <PlusCircle className="w-5 h-5 text-[#2B5BA8]" />
              <h3 className="text-[11px] font-bold uppercase text-[#1B3A6B]">Input Baris Transaksi</h3>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <input 
              ref={searchInputRef}
              placeholder="Cari item..."
              className="ac-input w-64"
              value={searchQuery}
              onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowModal(true);
              }}
              onFocus={() => setShowModal(true)}
            />
            <input 
              ref={qtyInputRef}
              type="number"
              placeholder="Qty"
              className="ac-input w-20"
              value={tempQty || ''}
              onChange={(e) => setTempQty(Number(e.target.value))}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddLine(); }}
            />
            <button
               onClick={handleAddLine}
               className="ac-toolbar-btn ac-btn-save-new !h-[24px]"
            >
              Tambah
            </button>
          </div>
      </div>

      <div className="ac-table-container flex-1 overflow-auto">
        <table className="ac-table">
          <thead>
            <tr>
              <th className="w-[30px] text-center">#</th>
              <th>Nama Barang</th>
              <th className="w-20 text-center">Qty</th>
              <th className="w-20">Satuan</th>
              {showPrice && <th className="w-32 text-right">Harga</th>}
              {showPrice && <th className="w-32 text-right">Total</th>}
              <th className="w-16 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 40 }).map((_, idx) => {
              const line = items[idx];
              if (!line) {
                return (
                  <tr key={`empty-${idx}`}>
                    <td className="text-center text-[#C8D0DA]">{idx + 1}</td>
                    <td colSpan={showPrice ? 6 : 4} />
                  </tr>
                );
              }
              return (
                <tr key={line.id} className={idx % 2 === 0 ? '' : 'ac-table-row-alt'}>
                  <td className="text-center text-[#5A6A7E]">{idx + 1}</td>
                  <td className="font-bold text-[#1A1A2E]">{line.name}</td>
                  <td>
                    <input 
                      type="number" 
                      className="ac-table-input text-center"
                      value={line.qty}
                      onChange={(e) => handleUpdateQty(line.id, Number(e.target.value))}
                    />
                  </td>
                  <td>{line.uom}</td>
                  {showPrice && <td className="text-right">Rp {line.price?.toLocaleString('id-ID')}</td>}
                  {showPrice && <td className="text-right font-bold text-[#1B3A6B]">Rp {line.total?.toLocaleString('id-ID')}</td>}
                  <td className="text-center">
                    <button 
                      className="text-[#C0392B] hover:text-[#A93226]"
                      onClick={() => handleRemoveLine(line.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {items.length > 0 && (
         <div className="bg-[#F5F7FA] border-t border-[#C8D0DA] px-4 py-1 flex justify-between items-center text-[11px] font-bold">
             <div className="flex gap-4 opacity-60">
                <span>{items.length} Baris</span>
                <span>{items.reduce((acc, curr) => acc + curr.qty, 0)} Total Qty</span>
             </div>
             {showPrice && (
                <div className="flex gap-2">
                    <span className="text-[#5A6A7E]">Sub Total:</span>
                    <span className="text-[#1B3A6B]">Rp {items.reduce((acc, curr) => acc + (curr.total || 0), 0).toLocaleString('id-ID')}</span>
                </div>
             )}
         </div>
      )}
    </div>
  );
}
