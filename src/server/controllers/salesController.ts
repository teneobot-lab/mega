import { Request, Response } from "express";
import { prisma } from "../prisma";
import { format, differenceInDays } from "date-fns";

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { type: "SALES", isDeleted: false },
      include: { 
        contact: true, 
        so: true,
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
    const { date, dueDate, soId, contactId, notes, lines } = req.body;
    const count = await prisma.invoice.count({ where: { type: "SALES" } }) + 1;
    const invNumber = `SI-${count.toString().padStart(4, '0')}`;

    let subTotal = 0;
    lines.forEach((l: any) => subTotal += (l.qty * l.price));
    const total = subTotal;

    const accPiutang = await prisma.account.findFirst({ where: { code: "1120" } }); // Piutang Usaha
    const accPenjualan = await prisma.account.findFirst({ where: { code: "4100" } }); // Penjualan

    if (!accPiutang || !accPenjualan) return res.status(400).json({ message: "Akun Piutang/Penjualan tidak ditemukan" });

    const result = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          invNumber, type: "SALES", date: new Date(date), dueDate: new Date(dueDate),
          contactId, soId: soId || null, status: "UNPAID",
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
          description: "Invoice Penjualan " + invNumber, isAuto: true, invoiceId: inv.id,
          Entries: {
            create: [
              { accountId: accPiutang.id, debit: total, credit: 0, description: "Piutang Usaha" },
              { accountId: accPenjualan.id, debit: 0, credit: total, description: "Catat Penjualan" }
            ]
          }
        }
      });

      // Stock Card Log
      for(let l of lines) {
        const whs = await tx.warehouse.findFirst();
        if(whs) {
          await tx.warehouseStock.update({
            where: { warehouseId_itemId: { warehouseId: whs.id, itemId: l.itemId } },
            data: { qty: { decrement: Number(l.qty) } }
          });
          await tx.stockCard.create({
            data: {
              date: new Date(date), itemId: l.itemId, warehouseId: whs.id,
              transType: "OUT", transNumber: invNumber, qtyOut: Number(l.qty), balance: 0,
              notes: "Sales Invoice " + invNumber
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

export const getAgingAR = async (req: Request, res: Response) => {
  try {
    const unpaidInvoices = await prisma.invoice.findMany({
      where: { type: "SALES", status: { in: ["UNPAID", "PARTIAL"] }, isDeleted: false },
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
        customer: inv.contact.name,
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

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.salesOrder.findMany({
      where: { isDeleted: false },
      include: { 
        customer: true, 
        Lines: {
          include: { item: true }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { date, customerId, notes, lines } = req.body;
    const count = await prisma.salesOrder.count() + 1;
    const soNumber = `SO-${count.toString().padStart(4, '0')}`;

    let subTotal = 0;
    lines.forEach((line: any) => subTotal += (line.qty * line.price));
    const taxAmount = subTotal * 0.11;
    const total = subTotal + taxAmount;

    const result = await prisma.$transaction(async (tx) => {
      return await tx.salesOrder.create({
        data: {
          soNumber,
          date: new Date(date),
          customerId,
          status: "DRAFT",
          subTotal, taxAmount, total, notes,
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
    res.status(400).json({ message: "Gagal membuat Sales Order", error: error.message });
  }
};
