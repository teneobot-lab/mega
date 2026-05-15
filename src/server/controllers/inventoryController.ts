import { Request, Response } from "express";
import { prisma } from "../prisma";

export const getInventorySummary = async (req: Request, res: Response) => {
  try {
    const summary = await prisma.item.findMany({
      where: { isDeleted: false },
      include: {
        Stock: {
          include: { warehouse: true }
        }
      }
    });

    const result = summary.map(item => ({
      id: item.id,
      code: item.code,
      name: item.name,
      categoryId: item.categoryId,
      unit: "pcs",
      minStock: item.minStock,
      totalQty: (item as any).Stock.reduce((sum: number, s: any) => sum + s.qty, 0),
      warehouses: (item as any).Stock.map((s: any) => ({
        name: s.warehouse.name,
        qty: s.qty
      }))
    }));

    res.json(result);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getStockCard = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { startDate, endDate } = req.query;

    const cards = await prisma.stockCard.findMany({
      where: {
        itemId,
        date: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        }
      },
      include: { warehouse: true },
      orderBy: { date: 'asc' }
    });

    // Calculate running balance
    let balance = 0;
    const result = cards.map(c => {
      balance += (c.qtyIn - c.qtyOut);
      return {
        ...c,
        balance
      };
    });

    res.json(result);
  } catch (e) {
    res.status(500).json({ message: "Gagal mengambil Kartu Stok" });
  }
};

export const getStockAdjusments = async (req: Request, res: Response) => {
    try {
        const adjs = await prisma.inventoryTransaction.findMany({
            where: { type: "ADJUSTMENT" },
            include: { Lines: { include: { item: true } }, warehouseTo: true },
            orderBy: { date: 'desc' }
        });
        res.json(adjs);
    } catch(e) {
        res.status(500).json({ message: "Server error" });
    }
}
