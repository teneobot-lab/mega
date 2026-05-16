import express from "express";
import { prisma } from "../prisma";
import jwt from "jsonwebtoken";

import * as accountingController from "../controllers/accountingController";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_only";

const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Silakan login terlebih dahulu" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });
    (req as any).user = user;
    next();
  });
};

router.use(authenticateToken);

// ========================
// JURNAL UMUM
// ========================
router.get("/journals", async (req, res) => {
  try {
    const journals = await prisma.journal.findMany({
      where: { isDeleted: false },
      include: {
        Entries: {
           include: {
               account: true
           }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/journals/:id", accountingController.getJournal);
router.put("/journals/:id", accountingController.updateJournal);

// MEMBUAT JURNAL MANUAL
router.post("/journals", async (req, res) => {
    try {
      const { date, description, entries } = req.body;
      if (!entries || !Array.isArray(entries)) return res.status(400).json({ message: "Invalid entries array" });
      
      let totalDebit = 0;
      let totalCredit = 0;
      entries.forEach((e: any) => {
          totalDebit += Number(e.debit);
          totalCredit += Number(e.credit);
      });

      if(totalDebit !== totalCredit) {
          return res.status(400).json({ message: "Jurnal tidak balance (Debit != Kredit)" });
      }

      const count = await prisma.journal.count({ where: { journalNumber: { startsWith: "JV-" } } }) + 1;
      const jvNumber = `JV-${count.toString().padStart(4, '0')}`;
  
      const result = await prisma.$transaction(async (tx) => {
         const journal = await tx.journal.create({
           data: {
             journalNumber: jvNumber,
             date: new Date(date),
             description,
             isAuto: false,
             Entries: {
               create: entries.map((e: any) => ({
                   accountId: e.accountId,
                   debit: Number(e.debit),
                   credit: Number(e.credit),
                   description: e.description || description
               }))
             }
           }
         });
  
         // Update balances
         for(let e of entries) {
             const debit = Number(e.debit);
             const credit = Number(e.credit);
             const acc = await tx.account.findUnique({ where: { id: e.accountId } });
             if(!acc) continue;
             
             let balanceChange = 0;
             // Jika Asset/Expense -> Debit menambah, Credit mengurangi
             if(['ASSET', 'EXPENSE'].includes(acc.type)) {
                 balanceChange = debit - credit;
             } else {
                 // Liability/Equity/Revenue -> Credit menambah, Debit mengurangi
                 balanceChange = credit - debit;
             }

             await tx.account.update({ where: { id: acc.id }, data: { balance: { increment: balanceChange } }});
         }
  
         return journal;
      });
  
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: "Gagal membuat jurnal manual", error: error.message });
    }
  });

// ========================
// BUKU BESAR (LEDGER)
// ========================
router.get("/ledger", async (req, res) => {
    try {
      const { accountId, startDate, endDate } = req.query;
      
      if(!accountId) return res.status(400).json({ message: "accountId di butuhkan" });

      const account = await prisma.account.findUnique({ where: { id: String(accountId) } });
      if(!account) return res.status(404).json({ message: "Akun tidak ditemukan" });

      // We only fetch entries within the date range
      const sDate = startDate ? new Date(String(startDate)) : new Date(0);
      const eDate = endDate ? new Date(String(endDate)) : new Date();
      // adjust end date to include the entire day
      eDate.setHours(23, 59, 59, 999);

      const entries = await prisma.journalEntry.findMany({
        where: { 
            accountId: String(accountId),
            journal: {
                date: {
                    gte: sDate,
                    lte: eDate
                }
            }
        },
        include: { journal: true },
        orderBy: { journal: { date: 'asc' } }
      });
      res.json({ account, entries, balance: account.balance });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
});

// ========================
// LAPORAN KEUANGAN
// ========================
// Neraca (Balance Sheet)
router.get("/balance-sheet", async (req, res) => {
    try {
        const accounts = await prisma.account.findMany({
             orderBy: { code: 'asc' }
        });

        const assets = accounts.filter(a => a.type === 'ASSET');
        const liabilities = accounts.filter(a => a.type === 'LIABILITY');
        const equity = accounts.filter(a => a.type === 'EQUITY');

        const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
        const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
        const totalEquity = equity.reduce((sum, a) => sum + a.balance, 0);

        // Menambahkan Laba Ditahan Periode Berjalan 
        // Laba = Revenue - Expense
        const revenues = accounts.filter(a => a.type === 'REVENUE').reduce((sum, a) => sum + a.balance, 0);
        const expenses = accounts.filter(a => a.type === 'EXPENSE').reduce((sum, a) => sum + a.balance, 0);
        const currentEarnings = revenues - expenses;

        res.json({
            assets, totalAssets,
            liabilities, totalLiabilities,
            equity, totalEquity: totalEquity + currentEarnings,
            currentEarnings
        });
    } catch(e) {
        res.status(500).json({ message: "Server error" });
    }
});

// Laba/Rugi (Income Statement)
router.get("/income-statement", async (req, res) => {
    try {
        const accounts = await prisma.account.findMany({
             orderBy: { code: 'asc' }
        });

        const revenues = accounts.filter(a => a.type === 'REVENUE');
        const expenses = accounts.filter(a => a.type === 'EXPENSE');

        const totalRevenues = revenues.reduce((sum, a) => sum + a.balance, 0);
        const totalExpenses = expenses.reduce((sum, a) => sum + a.balance, 0);
        const netIncome = totalRevenues - totalExpenses;

        res.json({
            revenues, totalRevenues,
            expenses, totalExpenses,
            netIncome
        });

    } catch(e) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
