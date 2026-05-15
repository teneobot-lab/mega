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

router.get("/summary", async (req, res) => {
  try {
     // Piutang
     const piutangInvs = await prisma.invoice.findMany({ where: { type: "SALES", status: { in: ["UNPAID", "PARTIAL"]}, isDeleted: false } });
     let totalPiutang = 0;
     piutangInvs.forEach(i => totalPiutang += i.balance);

     // Hutang
     const hutangInvs = await prisma.invoice.findMany({ where: { type: "PURCHASE", status: { in: ["UNPAID", "PARTIAL"]}, isDeleted: false } });
     let totalHutang = 0;
     hutangInvs.forEach(i => totalHutang += i.balance);

     // Kas & Bank
     const accounts = await prisma.account.findMany({ where: { OR: [{ type: "CASH" }, { type: "BANK" }] } });
     let totalKas = 0;
     accounts.forEach(a => totalKas += a.balance);

     // Inventory under minStock
     const lowStocks = await prisma.warehouseStock.findMany({
        where: {
           qty: { lt: 0 } // Placeholder for custom logic
        },
        include: { item: true }
     });

     // Better way: get all stocks and items, then filter
     const allStocks = await prisma.warehouseStock.findMany({
        include: { item: true }
     });
     const alertStocks = allStocks.filter(s => s.qty <= s.item.minStock).length;

     res.json({
        totalPiutang, countPiutang: piutangInvs.length,
        totalHutang, countHutang: hutangInvs.length,
        totalKas,
        minimumStocks: alertStocks
     })

  } catch(e) {
      res.status(500).json({ message: "Server error" });
  }
});

export default router;
