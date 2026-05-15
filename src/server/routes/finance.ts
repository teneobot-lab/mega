import express from "express";
import { prisma } from "../prisma";
import jwt from "jsonwebtoken";

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
// TRANSFER KAS / BANK
// ========================
router.post("/transfer", async (req, res) => {
  try {
    const { date, sourceAccountId, targetAccountId, amount, notes } = req.body;
    
    if (sourceAccountId === targetAccountId) {
       return res.status(400).json({ message: "Akun sumber dan tujuan tidak boleh sama" });
    }

    const count = await prisma.journal.count({ where: { journalNumber: { startsWith: "TRF-" } } }) + 1;
    const jvNumber = `TRF-${count.toString().padStart(4, '0')}`;

    const result = await prisma.$transaction(async (tx) => {
       const journal = await tx.journal.create({
         data: {
           journalNumber: jvNumber,
           date: new Date(date),
           description: notes || `Transfer dari Kas/Bank`,
           isAuto: false, // Or true, since it's a generated form
           Entries: {
             create: [
               { accountId: targetAccountId, debit: Number(amount), credit: 0, description: "Transfer Masuk" }, // Debit Tujuan
               { accountId: sourceAccountId, debit: 0, credit: Number(amount), description: "Transfer Keluar" }  // Kredit Sumber
             ]
           }
         }
       });

       // Update balances
       await tx.account.update({ where: { id: targetAccountId }, data: { balance: { increment: Number(amount) } }});
       await tx.account.update({ where: { id: sourceAccountId }, data: { balance: { decrement: Number(amount) } }});

       return journal;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: "Gagal transfer kas/bank", error: error.message });
  }
});

// ========================
// PENERIMAAN / PENGELUARAN KAS LAINNYA
// ========================
router.post("/expense", async (req, res) => {
    try {
        // Pengeluaran Kas
        const { date, bankAccountId, targetAccountId, amount, notes } = req.body;
        const count = await prisma.journal.count({ where: { journalNumber: { startsWith: "EXP-" } } }) + 1;
        const jvNumber = `EXP-${count.toString().padStart(4, '0')}`;

        const result = await prisma.$transaction(async (tx) => {
           const journal = await tx.journal.create({
             data: {
               journalNumber: jvNumber,
               date: new Date(date),
               description: notes || `Pengeluaran Kas/Bank`,
               isAuto: false,
               Entries: {
                 create: [
                   { accountId: targetAccountId, debit: Number(amount), credit: 0, description: "Beban/Biaya" }, // Debit Beban
                   { accountId: bankAccountId, debit: 0, credit: Number(amount), description: "Keluar dari Kas/Bank" }  // Kredit Kas
                 ]
               }
             }
           });
           await tx.account.update({ where: { id: targetAccountId }, data: { balance: { increment: Number(amount) } }});
           await tx.account.update({ where: { id: bankAccountId }, data: { balance: { decrement: Number(amount) } }});
           return journal;
        });
        res.json(result);
      } catch (error: any) {
        res.status(400).json({ message: "Gagal mencatat pengeluaran", error: error.message });
      }
});

router.post("/receipt", async (req, res) => {
    try {
        // Penerimaan Kas
        const { date, bankAccountId, sourceAccountId, amount, notes } = req.body;
        const count = await prisma.journal.count({ where: { journalNumber: { startsWith: "REC-" } } }) + 1;
        const jvNumber = `REC-${count.toString().padStart(4, '0')}`;

        const result = await prisma.$transaction(async (tx) => {
           const journal = await tx.journal.create({
             data: {
               journalNumber: jvNumber,
               date: new Date(date),
               description: notes || `Penerimaan Kas/Bank`,
               isAuto: false,
               Entries: {
                 create: [
                   { accountId: bankAccountId, debit: Number(amount), credit: 0, description: "Masuk ke Kas/Bank" }, 
                   { accountId: sourceAccountId, debit: 0, credit: Number(amount), description: "Pendapatan/Lainnya" }
                 ]
               }
             }
           });
           
           // Kas Bertambah
           await tx.account.update({ where: { id: bankAccountId }, data: { balance: { increment: Number(amount) } }});
           
           // Cek Akun Sumber (Kredit)
           const srcAcc = await tx.account.findUnique({ where: { id: sourceAccountId }});
           if(srcAcc) {
               if(['ASSET', 'EXPENSE'].includes(srcAcc.type)) {
                   await tx.account.update({ where: { id: sourceAccountId }, data: { balance: { decrement: Number(amount) } }});
               } else {
                   await tx.account.update({ where: { id: sourceAccountId }, data: { balance: { increment: Number(amount) } }});
               }
           }

           return journal;
        });
        res.json(result);
      } catch (error: any) {
        res.status(400).json({ message: "Gagal mencatat penerimaan", error: error.message });
      }
});

export default router;
