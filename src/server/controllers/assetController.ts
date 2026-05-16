import { Request, Response } from "express";
import { prisma } from "../prisma";

export const getAssets = async (req: Request, res: Response) => {
  try {
    const assets = await prisma.fixedAsset.findMany({
      where: { isDeleted: false },
      include: { department: true }
    });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await prisma.fixedAsset.findUnique({
      where: { id }
    });
    if (!data) return res.status(404).json({ message: "Asset not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch asset" });
  }
};

export const updateAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await prisma.fixedAsset.update({
      where: { id },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update asset" });
  }
};

export const createAsset = async (req: Request, res: Response) => {
    try {
        const { code, name, purchaseDate, purchasePrice, salvageValue, usefulLife, depreciationMethod, departmentId } = req.body;
        const asset = await prisma.fixedAsset.create({
            data: {
                code, name, 
                purchaseDate: new Date(purchaseDate), 
                purchasePrice: Number(purchasePrice),
                salvageValue: Number(salvageValue),
                usefulLife: Number(usefulLife),
                depreciationMethod,
                departmentId,
                status: "ACTIVE"
            }
        });
        res.json(asset);
    } catch(e) {
        res.status(400).json({ message: "Gagal membuat aset" });
    }
}

export const disposeAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, amount, notes } = req.body;

    const asset = await prisma.fixedAsset.findUnique({ where: { id } });
    if (!asset) return res.status(404).json({ message: "Aset tidak ditemukan" });

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark as Disposed
      await tx.fixedAsset.update({
        where: { id },
        data: { status: "DISPOSED" }
      });

      // 2. Journal Entry for Disposal
      // Debit: Cash, Accum Depreciation; Kredit: Asset Cost, Gain/Loss (simplified)
      const accCash = await tx.account.findFirst({ where: { name: { contains: "Kas" } } });
      const accAsset = await tx.account.findFirst({ where: { name: { contains: asset.name } } }); // Usually more specific

      if (accCash) {
        await tx.journal.create({
          data: {
             journalNumber: "DISP-" + asset.code,
             date: new Date(date),
             description: "Disposal Aset: " + asset.name,
             isAuto: true,
             assetId: asset.id,
             Entries: {
               create: [
                 { accountId: accCash.id, debit: Number(amount), credit: 0, description: "Hasil Penjualan Aset" }
               ]
             }
          }
        });
      }
      return asset;
    });

    res.json(result);
  } catch (e) {
    res.status(400).json({ message: "Gagal disposal aset" });
  }
};
