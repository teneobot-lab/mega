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

export const getTrialBalance = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const entries = await prisma.journalEntry.groupBy({
      by: ["accountId"],
      where: {
        journal: {
          date: {
            gte: startDate ? new Date(startDate as string) : undefined,
            lte: endDate ? new Date(endDate as string) : undefined
          }
        }
      },
      _sum: { debit: true, credit: true }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate trial balance" });
  }
};

export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await prisma.invoice.findMany({
      where: {
        type: "SALES",
        date: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined
        }
      },
      include: { Lines: true, contact: true }, // Used invoice/contact because SalesInvoice doesn't exist, it's Invoice with type="SALES"
      orderBy: { date: "asc" }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate sales report" });
  }
};

export const getPurchaseReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await prisma.invoice.findMany({
      where: {
        type: "PURCHASE",
        date: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined
        }
      },
      include: { Lines: true, contact: true },
      orderBy: { date: "asc" }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate purchase report" });
  }
};

export const getTaxReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const sales = await prisma.invoice.findMany({
      where: {
        type: "SALES",
        date: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined
        }
      },
      select: { date: true, taxAmount: true, subTotal: true, contact: true }
    });
    const purchases = await prisma.invoice.findMany({
      where: {
        type: "PURCHASE",
        date: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined
        }
      },
      select: { date: true, taxAmount: true, subTotal: true, contact: true }
    });
    res.json({ sales, purchases });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate tax report" });
  }
};

export const getStockCard = async (req: Request, res: Response) => {
  try {
    const { itemId, startDate, endDate } = req.query;
    if (!itemId) return res.status(400).json({ message: "itemId is required" });
    const movements = await prisma.stockCard.findMany({
      where: {
        itemId: String(itemId),
        date: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined
        }
      },
      orderBy: { date: "asc" }
    });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate stock card" });
  }
};
