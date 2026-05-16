import { Request, Response } from "express";
import { prisma } from "../prisma";
import { format, differenceInDays } from "date-fns";

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      where: { isDeleted: false },
      include: { 
        supplier: true, 
        Lines: {
          include: { item: true }
        },
        Invoices: {
          where: { isDeleted: false },
          include: { Lines: { include: { item: true } } }
        }
      },
      orderBy: { date: 'desc' }
    });

    // Fetch receipts for these orders
    const poNumbers = orders.map(o => o.poNumber);
    const receipts = await prisma.inventoryTransaction.findMany({
      where: { 
        type: "RECEIPT", 
        reference: { in: poNumbers },
        isDeleted: false 
      },
      include: { 
        warehouseTo: true,
        Lines: { include: { item: true } }
      }
    });

    const data = orders.map(order => ({
      ...order,
      Receipts: receipts.filter(r => r.reference === order.poNumber)
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { date, supplierId, taxId, notes, lines } = req.body;
    if (!lines || !Array.isArray(lines)) return res.status(400).json({ message: "Invalid lines array" });
    const count = await prisma.purchaseOrder.count() + 1;
    const poNumber = `PO-${count.toString().padStart(4, '0')}`;

    let subTotal = 0;
    lines.forEach((line: any) => subTotal += (line.qty * line.price));
    const taxAmount = taxId ? (subTotal * 0.11) : 0;
    const total = subTotal + taxAmount;

    const result = await prisma.$transaction(async (tx) => {
      return await tx.purchaseOrder.create({
        data: {
          poNumber,
          date: new Date(date),
          supplierId,
          status: "DRAFT",
          subTotal, taxAmount, total, notes, taxId: taxId || null,
          Lines: {
            create: lines.map((l: any) => ({
              itemId: l.itemId, qty: Number(l.qty), price: Number(l.price), total: Number(l.qty) * Number(l.price)
            }))
          }
        }
      });
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: "Gagal membuat Purchase Order", error: error.message });
  }
};

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { type: "PURCHASE", isDeleted: false },
      include: { 
        contact: true, 
        po: true,
        Lines: {
          include: { item: true }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(invoices);
  } catch(e) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { date, dueDate, poId, contactId, notes, lines } = req.body;
    if (!lines || !Array.isArray(lines)) return res.status(400).json({ message: "Invalid lines array" });
    const count = await prisma.invoice.count({ where: { type: "PURCHASE" } }) + 1;
    const invNumber = `PI-${count.toString().padStart(4, '0')}`;

    let subTotal = 0;
    lines.forEach((l: any) => subTotal += (l.qty * l.price));
    const total = subTotal; // simplified

    const accHutang = await prisma.account.findFirst({ where: { code: "2100" } }); // Hutang Usaha
    const accPembelian = await prisma.account.findFirst({ where: { code: "5100" } }); // HPP / Pembelian

    if (!accHutang || !accPembelian) return res.status(400).json({ message: "Konfigurasi Akun Hutang/Pembelian tidak ditemukan" });

    const result = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          invNumber, type: "PURCHASE", date: new Date(date), dueDate: new Date(dueDate),
          contactId, poId: poId || null, status: "UNPAID",
          subTotal, taxAmount: 0, total, balance: total, notes,
          Lines: {
            create: lines.map((l: any) => ({
              itemId: l.itemId, qty: Number(l.qty), price: Number(l.price), total: Number(l.qty) * Number(l.price)
            }))
          }
        }
      });

      await tx.journal.create({
        data: {
          journalNumber: `JV-${invNumber}`, date: new Date(date), reference: invNumber,
          description: "Invoice Pembelian " + invNumber, isAuto: true, invoiceId: inv.id,
          Entries: {
            create: [
              { accountId: accPembelian.id, debit: total, credit: 0, description: "Catat Pembelian" },
              { accountId: accHutang.id, debit: 0, credit: total, description: "Hutang Usaha" }
            ]
          }
        }
      });

      // Stock Card Log
      for(let l of lines) {
        const whs = await tx.warehouse.findFirst();
        if(whs) {
          await tx.warehouseStock.upsert({
            where: { warehouseId_itemId: { warehouseId: whs.id, itemId: l.itemId } },
            update: { qty: { increment: Number(l.qty) } },
            create: { warehouseId: whs.id, itemId: l.itemId, qty: Number(l.qty) }
          });
          await tx.stockCard.create({
            data: {
              date: new Date(date), itemId: l.itemId, warehouseId: whs.id,
              transType: "IN", transNumber: invNumber, qtyIn: Number(l.qty), balance: 0, // Simplified balance tracking
              notes: "Purchase Invoice " + invNumber
            }
          });
        }
      }

      return inv;
    });
    res.json(result);
  } catch(error: any) {
    res.status(400).json({ message: "Gagal membuat invoice", error: error.message });
  }
};

export const getAgingAP = async (req: Request, res: Response) => {
  try {
    const unpaidInvoices = await prisma.invoice.findMany({
      where: { type: "PURCHASE", status: { in: ["UNPAID", "PARTIAL"] }, isDeleted: false },
      include: { contact: true }
    });

    const now = new Date();
    const report = unpaidInvoices.map(inv => {
      const daysOverdue = inv.dueDate ? differenceInDays(now, new Date(inv.dueDate)) : 0;
      let category = "Current";
      if (daysOverdue > 90) category = "Over 90 Days";
      else if (daysOverdue > 60) category = "61-90 Days";
      else if (daysOverdue > 30) category = "31-60 Days";
      else if (daysOverdue > 0) category = "1-30 Days";

      return {
        invNumber: inv.invNumber,
        supplier: inv.contact.name,
        date: format(inv.date, "yyyy-MM-dd"),
        dueDate: inv.dueDate ? format(inv.dueDate, "yyyy-MM-dd") : "-",
        total: inv.total,
        balance: inv.balance,
        daysOverdue,
        category
      };
    });

    res.json(report);
  } catch(e) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { Lines: true, supplier: true }
    });
    if (!data) return res.status(404).json({ message: "Order not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, supplierId, notes, lines } = req.body;
    if (!lines || !Array.isArray(lines)) return res.status(400).json({ message: "Invalid lines array" });
    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { date: new Date(date), supplierId, notes }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order" });
  }
};

export const approveOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: "APPROVED" }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to approve order" });
  }
};

export const getInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await prisma.invoice.findUnique({
      where: { id },
      include: { Lines: true, contact: true }
    });
    if (!data) return res.status(404).json({ message: "Invoice not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch invoice" });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await prisma.invoice.update({
      where: { id },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update invoice" });
  }
};

export const getPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await prisma.payment.findUnique({
      where: { id },
      include: { Lines: true, contact: true }
    });
    if (!data) return res.status(404).json({ message: "Payment not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payment" });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await prisma.payment.update({
      where: { id },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update payment" });
  }
};

export const getReturn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await prisma.invoice.findUnique({
      where: { id },
      include: { Lines: true, contact: true }
    });
    if (!data) return res.status(404).json({ message: "Return not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch return" });
  }
};

export const updateReturn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await prisma.invoice.update({
      where: { id },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update return" });
  }
};
