import { Request, Response } from "express";
import { prisma } from "../prisma";
import { format } from "date-fns";

export const getBalanceSheet = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const endDate = date ? new Date(date as string) : new Date();

    const accounts = await prisma.account.findMany({
      where: { isDeleted: false },
      include: {
        JournalEntries: {
          where: { journal: { date: { lte: endDate }, isDeleted: false } }
        }
      }
    });

    const report = accounts.reduce((acc: any, curr) => {
      const balance = curr.JournalEntries.reduce((sum, entry) => sum + (entry.debit - entry.credit), 0);
      const type = curr.type; // ASSET, LIABILITY, EQUITY

      if (["ASSET", "LIABILITY", "EQUITY"].includes(type)) {
        if (!acc[type]) acc[type] = [];
        acc[type].push({ code: curr.code, name: curr.name, balance });
      }
      return acc;
    }, {});

    res.json(report);
  } catch (e) {
    res.status(500).json({ message: "Gagal memproses Neraca" });
  }
};

export const getIncomeStatement = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    const accounts = await prisma.account.findMany({
      where: { type: { in: ["REVENUE", "EXPENSE"] }, isDeleted: false },
      include: {
        JournalEntries: {
          where: { journal: { date: { gte: start, lte: end }, isDeleted: false } }
        }
      }
    });

    const report = accounts.reduce((acc: any, curr) => {
      const balance = curr.JournalEntries.reduce((sum, entry) => sum + (entry.debit - entry.credit), 0);
      const type = curr.type;

      if (!acc[type]) acc[type] = [];
      const multiplier = type === "REVENUE" ? -1 : 1; // Revenue is normally credit
      acc[type].push({ code: curr.code, name: curr.name, amount: balance * multiplier });
      return acc;
    }, {});

    res.json(report);
  } catch (e) {
    res.status(500).json({ message: "Gagal memproses Laba Rugi" });
  }
};

export const getCashFlow = async (req: Request, res: Response) => {
    // Basic Cash Flow using Direct Method (simplified)
    // Actually typically we do indirect but for simplicity just show cash in/out from Payments
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate as string) : new Date();

        const payments = await prisma.payment.findMany({
            where: { date: { gte: start, lte: end }, isDeleted: false },
            orderBy: { date: 'asc' }
        });

        const report = {
            inflow: payments.filter(p => ["AR_RECEIPT", "CASH_IN"].includes(p.type)).reduce((sum, p) => sum + p.amount, 0),
            outflow: payments.filter(p => ["AP_PAYMENT", "CASH_OUT"].includes(p.type)).reduce((sum, p) => sum + p.amount, 0),
        };

        res.json(report);
    } catch(e) {
        res.status(500).json({ message: "Server error" });
    }
}
