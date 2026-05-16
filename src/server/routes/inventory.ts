import express from "express";
import * as inventoryController from "../controllers/inventoryController";
import { authenticateToken } from "../middleware/auth";
import { prisma } from "../prisma";

const router = express.Router();

router.use(authenticateToken);

router.get("/summary", inventoryController.getInventorySummary);
router.get("/stocks", async (req, res) => {
   try {
     return await inventoryController.getInventorySummary(req, res);
   } catch(e) {
     res.status(500).json({message: "Error fetching stocks"});
   }
});
router.get("/stock-card/:itemId", inventoryController.getStockCard);
router.get("/adjustments", inventoryController.getStockAdjusments);
router.get("/adjustment", inventoryController.getStockAdjusments); // Added for audit compliance

// ... rest of logic for adjust/transfer could also stay or move to controller
// For now I'll just keep the existing router.post for convenience but use the new exports for the rest

router.post("/adjustment", async (req, res) => {
    try {
      const { date, warehouseId, itemId, adjustQty, notes } = req.body;
      const amount = Number(adjustQty);

      if (amount === 0) return res.status(400).json({ message: "Qty penyesuaian tidak boleh 0" });

      const count = await prisma.inventoryTransaction.count({ where: { type: "ADJUSTMENT" } }) + 1;
      const trNum = `ADJ-${count.toString().padStart(4, '0')}`;
  
      const result = await prisma.$transaction(async (tx) => {
         const transaction = await tx.inventoryTransaction.create({
           data: {
             transNumber: trNum,
             type: "ADJUSTMENT",
             date: new Date(date),
             notes: notes || "Penyesuaian Persediaan",
             warehouseToId: warehouseId,
             Lines: {
               create: [
                 { itemId, qty: amount }
               ]
             }
           }
         });
  
         // Update stock
         await tx.warehouseStock.upsert({
             where: { warehouseId_itemId: { warehouseId, itemId } },
             update: { qty: { increment: amount } },
             create: { warehouseId, itemId, qty: amount }
         });
  
         return transaction;
      });
  
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: "Gagal penyesuaian barang", error: error.message });
    }
});

router.post("/transfer", async (req, res) => {
    try {
      const { date, sourceWarehouseId, targetWarehouseId, itemId, qty, notes } = req.body;
      const amount = Number(qty);

       if (amount <= 0) return res.status(400).json({ message: "Qty pindah harus lebih dari 0" });
       if (sourceWarehouseId === targetWarehouseId) return res.status(400).json({ message: "Gudang sumber dan tujuan sama" });

      const count = await prisma.inventoryTransaction.count({ where: { type: "TRANSFER" } }) + 1;
      const trNum = `TRF-INV-${count.toString().padStart(4, '0')}`;
  
      const result = await prisma.$transaction(async (tx) => {
         const transaction = await tx.inventoryTransaction.create({
           data: {
             transNumber: trNum,
             type: "TRANSFER",
             date: new Date(date),
             notes,
             warehouseFromId: sourceWarehouseId,
             warehouseToId: targetWarehouseId,
             Lines: {
               create: [
                 { itemId, qty: amount }
               ]
             }
           }
         });
  
         // Deduct source
         await tx.warehouseStock.update({
             where: { warehouseId_itemId: { warehouseId: sourceWarehouseId, itemId } },
             data: { qty: { decrement: amount } }
         });

         // Add to target
         await tx.warehouseStock.upsert({
            where: { warehouseId_itemId: { warehouseId: targetWarehouseId, itemId } },
            update: { qty: { increment: amount } },
            create: { warehouseId: targetWarehouseId, itemId, qty: amount }
         });
  
         return transaction;
      });
  
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: "Gagal pindah barang", error: error.message });
    }
});

export default router;
