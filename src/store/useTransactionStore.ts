import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export interface InvoiceItem {
  id: string;
  itemCode: string;
  itemName: string;
  warehouse: string;
  qty: number;
  unit: string;
  price: number;
  discountPercent: number;
  discountAmount: number;
  tax: string;
  subtotal: number;
}

interface TransactionState {
  items: InvoiceItem[];
  addItem: () => void;
  updateItem: (id: string, updates: Partial<InvoiceItem>) => void;
  removeItem: (id: string) => void;
  resetItems: () => void;
  setItems: (items: InvoiceItem[]) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  items: [
    {
      id: uuidv4(),
      itemCode: "",
      itemName: "",
      warehouse: "Gudang Utama",
      qty: 1,
      unit: "Pcs",
      price: 0,
      discountPercent: 0,
      discountAmount: 0,
      tax: "PPN 11%",
      subtotal: 0,
    },
  ],
  addItem: () =>
    set((state) => ({
      items: [
        ...state.items,
        {
          id: uuidv4(),
          itemCode: "",
          itemName: "",
          warehouse: "Gudang Utama",
          qty: 1,
          unit: "Pcs",
          price: 0,
          discountPercent: 0,
          discountAmount: 0,
          tax: "PPN 11%",
          subtotal: 0,
        },
      ],
    })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === id) {
          const newItem = { ...item, ...updates };
          // Recalculate subtotal
          const qty = newItem.qty || 0;
          const price = newItem.price || 0;
          const discPct = newItem.discountPercent || 0;
          const discAmt = newItem.discountAmount || 0;
          
          let total = qty * price;
          if (discPct > 0) {
            total = total * (1 - discPct / 100);
          } else {
            total = total - discAmt;
          }
          newItem.subtotal = total;
          return newItem;
        }
        return item;
      }),
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  resetItems: () =>
    set({
      items: [
        {
          id: uuidv4(),
          itemCode: "",
          itemName: "",
          warehouse: "Gudang Utama",
          qty: 1,
          unit: "Pcs",
          price: 0,
          discountPercent: 0,
          discountAmount: 0,
          tax: "PPN 11%",
          subtotal: 0,
        },
      ],
    }),
  setItems: (items) => set({ items }),
}));
