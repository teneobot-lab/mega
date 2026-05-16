import { Request, Response } from "express";
import { prisma } from "../prisma";

export const getJournal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await prisma.journal.findUnique({
      where: { id },
      include: { Entries: true }
    });
    if (!data) return res.status(404).json({ message: "Journal not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch journal" });
  }
};

export const updateJournal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, description } = req.body;
    const updated = await prisma.journal.update({
      where: { id },
      data: { date: date ? new Date(date) : undefined, description }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update journal" });
  }
};
