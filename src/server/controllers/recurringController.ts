import { Request, Response } from "express";
import { prisma } from "../prisma";

export const getRecurring = async (req: Request, res: Response) => {
  try {
    const list = await prisma.recurringTransaction.findMany({
      where: { isDeleted: false }
    });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createRecurring = async (req: Request, res: Response) => {
  try {
    const { name, type, frequency, nextDate, amount, payload } = req.body;
    const item = await prisma.recurringTransaction.create({
      data: {
        name, type, frequency, 
        nextDate: new Date(nextDate), 
        amount: Number(amount),
        payload: JSON.stringify(payload)
      }
    });
    res.json(item);
  } catch (e) {
    res.status(400).json({ message: "Gagal membuat transaksi berulang" });
  }
};

export const executeRecurring = async (req: Request, res: Response) => {
    // Logic to manual trigger "run" for a recurring transaction
    try {
        const { id } = req.params;
        const recurring = await prisma.recurringTransaction.findUnique({ where: { id } });
        if(!recurring) return res.status(404).json({ message: "Not found" });

        const payload = JSON.parse(recurring.payload);

        const result = await prisma.$transaction(async (tx) => {
            // Based on type, create the actual transaction
            if(recurring.type === 'GENERAL_JOURNAL') {
                await tx.journal.create({
                    data: {
                        journalNumber: "REC-" + Date.now(),
                        date: new Date(),
                        description: recurring.name,
                        Entries: { create: payload.entries }
                    }
                });
            }
            // Update next date based on frequency
            let next = new Date(recurring.nextDate);
            if(recurring.frequency === 'MONTHLY') next.setMonth(next.getMonth() + 1);
            else if(recurring.frequency === 'WEEKLY') next.setDate(next.getDate() + 7);
            else next.setDate(next.getDate() + 1);

            return await tx.recurringTransaction.update({
                where: { id },
                data: { nextDate: next }
            });
        });

        res.json(result);
    } catch(e) {
        res.status(400).json({ message: "Gagal eksekusi transaksi berulang" });
    }
}
