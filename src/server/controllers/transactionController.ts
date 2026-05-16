import { Request, Response } from "express";
import { prisma } from "../prisma";

export const getDelivery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await prisma.inventoryTransaction.findUnique({
      where: { id },
      include: { Lines: true }
    });
    if (!data) return res.status(404).json({ message: "Delivery not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch delivery" });
  }
};

export const updateDelivery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, warehouseFromId, notes } = req.body;
    const updated = await prisma.inventoryTransaction.update({
      where: { id },
      // only update allowed fields
      data: { date: date ? new Date(date) : undefined, warehouseFromId, notes }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update delivery" });
  }
};

export const getGoodsReceipt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await prisma.inventoryTransaction.findUnique({
      where: { id },
      include: { Lines: true }
    });
    if (!data) return res.status(404).json({ message: "Goods Receipt not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch goods receipt" });
  }
};

export const updateGoodsReceipt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, warehouseToId, notes } = req.body;
    const updated = await prisma.inventoryTransaction.update({
      where: { id },
      data: { date: date ? new Date(date) : undefined, warehouseToId, notes }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update goods receipt" });
  }
};
