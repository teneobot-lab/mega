import React, { useState, useEffect, useRef } from "react";
import Fuse from "fuse.js";
import { Search, Package, Box, Command } from "lucide-react";
import { cn } from "../../lib/utils";

interface Item {
  id: string;
  name: string;
  code: string;
  baseUom: { name: string } | string;
  sellPrice?: number;
}

interface ItemAutocompleteModalProps {
  items: Item[];
  query: string;
  onSelect: (item: Item) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}

export function ItemAutocompleteModal({ items, query, onSelect, onClose, anchorRef }: ItemAutocompleteModalProps) {
  const [results, setResults] = useState<Item[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fuse = new Fuse(items, {
      keys: ["name", "code"],
      threshold: 0.3,
    });

    const searchResults = query ? fuse.search(query).map(r => r.item) : items.slice(0, 5);
    setResults(searchResults);
    setSelectedIndex(0);
  }, [query, items]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        setSelectedIndex(prev => (prev + 1) % results.length);
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        e.preventDefault();
      } else if (e.key === "Enter" && results.length > 0) {
        onSelect(results[selectedIndex]);
        e.preventDefault();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [results, selectedIndex, onSelect, onClose]);

  // Positioning
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 400),
      });
    }
  }, [anchorRef]);

  if (results.length === 0 && !query) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed z-[9999] bg-white border border-zinc-200 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-150"
      style={{ top: position.top + 5, left: position.left, width: position.width }}
    >
      <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Command className="w-3 h-3 text-zinc-400" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Autocomplete</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-zinc-300 italic">Arrows to navigate • Enter to select</span>
        </div>
      </div>
      
      <div className="max-h-[300px] overflow-y-auto">
        {results.length > 0 ? (
          results.map((item, idx) => (
            <div
              key={item.id}
              className={cn(
                "px-4 py-3 cursor-pointer border-b border-zinc-50 last:border-0 transition-colors flex items-center justify-between",
                idx === selectedIndex ? "bg-blue-50/50" : "hover:bg-zinc-50"
              )}
              onClick={() => onSelect(item)}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-inner",
                    idx === selectedIndex ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-400"
                )}>
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                      "font-black italic uppercase tracking-tight text-sm",
                      idx === selectedIndex ? "text-blue-600" : "text-zinc-700"
                  )}>{item.name}</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.code}</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200">
                    <Box className="w-2.5 h-2.5 text-zinc-400" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                        {typeof item.baseUom === 'string' ? item.baseUom : item.baseUom?.name || 'Unit'}
                    </span>
                </div>
                {item.sellPrice && (
                    <span className="text-xs font-black text-[#1e3a5f] italic tabular-nums leading-none">Rp {item.sellPrice.toLocaleString()}</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center flex flex-col items-center gap-2">
            <Search className="w-8 h-8 text-zinc-200" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Barang tidak ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
