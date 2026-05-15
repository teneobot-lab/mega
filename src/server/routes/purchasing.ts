import express from "express";
import { prisma } from "../prisma";
import * as purchasingController from "../controllers/purchasingController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.use(authenticateToken);

router.get("/orders", purchasingController.getOrders);
router.post("/orders", purchasingController.createOrder);

router.get("/invoices", purchasingController.getInvoices);
router.post("/invoices", purchasingController.createInvoice);

router.get("/aging-ap", purchasingController.getAgingAP);

// Re-add other endpoints if needed, but these are the main ones requested in audit
// For now, keeping it clean as per requirement

// ========================
// PEMBAYARAN HUTANG
// ========================
router.get("/payments", async (req, res) => {
  try {
    const data = await prisma.payment.findMany({
      where: { type: "AP_PAYMENT", isDeleted: false },
      include: { 
        contact: true, 
        Lines: { include: { invoice: true } },
        Journals: {
          include: {
            Entries: {
              include: { account: true }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(data);
  } catch(e) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/payments", async (req, res) => {
  try {
    const { date, contactId, amount, notes, invoiceId, accountId } = req.body;
    
    // Auto-generate Pay Number
    const count = await prisma.payment.count({ where: { type: "AP_PAYMENT" } }) + 1;
    const payNumber = `AP-${count.toString().padStart(4, '0')}`;

    const accHutang = await prisma.account.findFirst({ where: { name: { contains: "Hutang" } }});
    // The source of fund account is selected by user
    const accBank = await prisma.account.findUnique({ where: { id: accountId } });

    if (!accHutang || !accBank) {
      return res.status(400).json({ message: "Data akun tidak ditemukan." });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment
      const payment = await tx.payment.create({
        data: {
          payNumber,
          type: "AP_PAYMENT",
          date: new Date(date),
          contactId,
          amount: Number(amount),
          notes,
          Lines: {
            create: [
               { invoiceId, amount: Number(amount) }
            ]
          }
        }
      });

      // 2. Update Invoice
      const inv = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if(!inv) throw new Error("Invoice tidak ditemukan");

      const newPaid = inv.paidAmount + Number(amount);
      const newBalance = inv.total - newPaid;
      const status = newBalance <= 0 ? "PAID" : "PARTIAL";

      await tx.invoice.update({
        where: { id: invoiceId },
        data: { paidAmount: newPaid, balance: newBalance > 0 ? newBalance : 0, status }
      });

      // 3. Catat Jurnal
      const jvNumber = `JV-AP-${count.toString().padStart(4, '0')}`;
      await tx.journal.create({
        data: {
          journalNumber: jvNumber,
          date: new Date(date),
          reference: payNumber,
          description: "Pembayaran Hutang " + payNumber,
          isAuto: true,
          paymentId: payment.id,
          Entries: {
            create: [
              { accountId: accHutang.id, debit: Number(amount), credit: 0, description: "Pelunasan Hutang" },
              { accountId: accBank.id, debit: 0, credit: Number(amount), description: "Kurangi Kas/Bank" }
            ]
          }
        }
      });
      
      // Update balance rekening akun secara denormalized 
      await tx.account.update({ where: { id: accBank.id }, data: { balance: { decrement: Number(amount) } } });
      await tx.account.update({ where: { id: accHutang.id }, data: { balance: { decrement: Number(amount) } } });

      return payment;
    });

    res.json(result);
  } catch(e: any) {
    res.status(400).json({ message: "Gagal memproses pembayaran.", error: e.message });
  }
});

// ========================
// RETUR PEMBELIAN (PURCHASE RETURN)
// ========================
router.get("/returns", async (req, res) => {
  try {
    const returns = await prisma.invoice.findMany({
      where: { type: "PURCHASE_RETURN", isDeleted: false },
      include: { contact: true, Lines: { include: { item: true } } },
      orderBy: { date: 'desc' }
    });
    res.json(returns);
  } catch(e) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/returns", async (req, res) => {
  try {
    const { date, contactId, notes, lines, warehouseId } = req.body;
    
    // Auto-generate Return Number
    const count = await prisma.invoice.count({ where: { type: "PURCHASE_RETURN" } }) + 1;
    const retNumber = `PR-${count.toString().padStart(4, '0')}`;

    let subTotal = 0;
    lines.forEach((l: any) => subTotal += (l.qty * l.price));
    const total = subTotal;

    // Accounts for Journal
    const accHutang = await prisma.account.findFirst({ where: { name: { contains: "Hutang" } }});
    const accPersediaan = await prisma.account.findFirst({ where: { type: "ASSET", name: { contains: "Persediaan" } }});

    if (!accHutang || !accPersediaan) {
      return res.status(400).json({ message: "Data akun Hutang/Persediaan tidak ditemukan. Periksa Master Akun." });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Return (Credit Note Invoice)
      const ret = await tx.invoice.create({
        data: {
          invNumber: retNumber,
          type: "PURCHASE_RETURN",
          date: new Date(date),
          contactId,
          status: "PAID", // Consider returned value as closed logic for simple system
          subTotal, taxAmount: 0, total, balance: 0, notes,
          Lines: {
            create: lines.map((l: any) => ({
              itemId: l.itemId, qty: Number(l.qty), price: Number(l.price), total: Number(l.qty) * Number(l.price)
            }))
          }
        }
      });

      // 2. Generate Jurnal Otomatis
      // Debit: Hutang Usaha, Kredit: Persediaan / Harga Pokok (Mengembalikan Hutang)
      const jvNumber = `JV-PR-${count.toString().padStart(4, '0')}`;
      await tx.journal.create({
        data: {
          journalNumber: jvNumber,
          date: new Date(date),
          reference: retNumber,
          description: "Jurnal Retur Pembelian " + retNumber,
          isAuto: true,
          invoiceId: ret.id,
          Entries: {
            create: [
              { accountId: accHutang.id, debit: total, credit: 0, description: "Pengurangan Hutang" },
              { accountId: accPersediaan.id, debit: 0, credit: total, description: "Nilai Persediaan Keluar" }
            ]
          }
        }
      });

      // 3. Update Akun
      await tx.account.update({ where: { id: accHutang.id }, data: { balance: { decrement: total } }});
      await tx.account.update({ where: { id: accPersediaan.id }, data: { balance: { decrement: total } }});

      // 4. Inventory Deduction
      if (warehouseId) {
        for(let l of lines) {
           await tx.warehouseStock.update({
             where: { warehouseId_itemId: { warehouseId, itemId: l.itemId } },
             data: { qty: { decrement: Number(l.qty) } }
           });
        }
      }

      return ret;
    });

    res.json(result);
  } catch(error: any) {
    res.status(400).json({ message: "Gagal mencatat retur pembelian", error: error.message });
  }
});

export default router;
