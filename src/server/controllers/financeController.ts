import { Request, Response } from "express";
import { prisma } from "../prisma";

export const getReceipts = async (req: Request, res: Response) => {
  try {
    const data = await prisma.journal.findMany({
      where: { journalNumber: { startsWith: "REC-" } },
      include: { Entries: true },
      orderBy: { date: "desc" }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch receipts" });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const data = await prisma.journal.findMany({
      where: { journalNumber: { startsWith: "EXP-" } },
      include: { Entries: true },
      orderBy: { date: "desc" }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

export const getTransfers = async (req: Request, res: Response) => {
  try {
    const data = await prisma.journal.findMany({
      where: { journalNumber: { startsWith: "TRF-" } },
      include: { Entries: true },
      orderBy: { date: "desc" }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transfers" });
  }
};
