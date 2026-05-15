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
// PENERIMAAN BARANG DARI PO
// ========================
router.get("/receipt", async (req, res) => {
  try {
    const data = await prisma.inventoryTransaction.findMany({
      where: { type: "RECEIPT" },
      include: { warehouseTo: true, Lines: { include: { item: true } } },
      orderBy: { date: 'desc' }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/receipt", async (req, res) => {
   try {
     const { date, poId, warehouseToId, notes, lines } = req.body;
     
     const count = await prisma.inventoryTransaction.count({ where: { type: "RECEIPT" } }) + 1;
     const trNum = `RCV-${count.toString().padStart(4, '0')}`;
     
     const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } });
     if (!po) throw new Error("PO tidak ditemukan");

     const result = await prisma.$transaction(async (tx) => {
       const transaction = await tx.inventoryTransaction.create({
         data: {
           transNumber: trNum,
           type: "RECEIPT",
           date: new Date(date),
           warehouseToId,
           reference: po.poNumber,
           notes,
           Lines: {
             create: lines.map((l: any) => ({
               itemId: l.itemId,
               qty: Number(l.qty)
             }))
           }
         }
       });

       for (let l of lines) {
         await tx.warehouseStock.upsert({
             where: { warehouseId_itemId: { warehouseId: warehouseToId, itemId: l.itemId } },
             update: { qty: { increment: Number(l.qty) } },
             create: { warehouseId: warehouseToId, itemId: l.itemId, qty: Number(l.qty) }
         });
       }

       await tx.purchaseOrder.update({ where: { id: poId }, data: { status: "RECEIVED" }});

       return transaction;
     });

     res.json(result);
   } catch(error: any) {
     res.status(400).json({ message: "Gagal mencatat penerimaan", error: error.message });
   }
});

// ========================
// PENGIRIMAN BARANG DARI SO
// ========================
router.get("/delivery", async (req, res) => {
  try {
    const data = await prisma.inventoryTransaction.findMany({
      where: { type: "SHIPMENT" },
      include: { warehouseFrom: true, Lines: { include: { item: true } } },
      orderBy: { date: 'desc' }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/delivery", async (req, res) => {
   try {
     const { date, soId, warehouseFromId, notes, lines } = req.body;
     
     const count = await prisma.inventoryTransaction.count({ where: { type: "SHIPMENT" } }) + 1;
     const trNum = `DO-${count.toString().padStart(4, '0')}`;
     
     const so = await prisma.salesOrder.findUnique({ where: { id: soId } });
     if (!so) throw new Error("SO tidak ditemukan");

     const result = await prisma.$transaction(async (tx) => {
       const transaction = await tx.inventoryTransaction.create({
         data: {
           transNumber: trNum,
           type: "SHIPMENT",
           date: new Date(date),
           warehouseFromId,
           reference: so.soNumber,
           notes,
           Lines: {
             create: lines.map((l: any) => ({
               itemId: l.itemId,
               qty: -Number(l.qty)
             }))
           }
         }
       });

       for (let l of lines) {
         await tx.warehouseStock.update({
             where: { warehouseId_itemId: { warehouseId: warehouseFromId, itemId: l.itemId } },
             data: { qty: { decrement: Number(l.qty) } },
         });
       }

       await tx.salesOrder.update({ where: { id: soId }, data: { status: "SHIPPED" }});

       return transaction;
     });

     res.json(result);
   } catch(error: any) {
     res.status(400).json({ message: "Gagal mencatat pengiriman", error: error.message });
   }
});

export default router;
