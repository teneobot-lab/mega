import express from "express";
import { prisma } from "../prisma";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_only";

// Middleware Auth
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Silakan login terlebih dahulu" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Token tidak valid atau kadaluarsa" });
    (req as any).user = user;
    next();
  });
};

router.use(authenticateToken);

// ========================
// 1. Chart Of Accounts
// ========================

router.get("/accounts", async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { isDeleted: false },
      include: { currency: true },
      orderBy: { code: 'asc' }
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/accounts", async (req, res) => {
  try {
    const { code, name, type, currencyId } = req.body;
    const account = await prisma.account.create({
      data: { code, name, type, currencyId }
    });
    res.json(account);
  } catch (error: any) {
    res.status(400).json({ message: "Gagal membuat kode akun. Kode mungkin sudah ada.", error: error.message });
  }
});

// ========================
// 2. Contacts (Customers/Suppliers)
// ========================

router.get("/contacts", async (req, res) => {
  const { type } = req.query; // CUSTOMER, SUPPLIER, EMPLOYEE
  try {
    const contacts = await prisma.contact.findMany({
      where: { 
        isDeleted: false,
        ...(type && { type: String(type) })
      },
      orderBy: { name: 'asc' }
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/contacts", async (req, res) => {
  try {
    const { type, code, name, email, phone, address, creditLimit, termsDays } = req.body;
    const contact = await prisma.contact.create({
      data: { type, code, name, email, phone, address, creditLimit, termsDays }
    });
    res.json(contact);
  } catch (error: any) {
    res.status(400).json({ message: "Gagal membuat kontak. Kode mungkin sudah ada.", error: error.message });
  }
});

// ========================
// 3. Items
// ========================

router.get("/items", async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      where: { isDeleted: false },
      include: { category: true, baseUom: true },
      orderBy: { code: 'asc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/items", async (req, res) => {
  try {
    const { code, name, categoryId, baseUomId, buyPrice, sellPrice, minStock } = req.body;
    const item = await prisma.item.create({
      data: { code, name, categoryId, baseUomId, buyPrice, sellPrice, minStock }
    });
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ message: "Gagal membuat barang. Kode mungkin sudah ada.", error: error.message });
  }
});

// ========================
// 4. Warehouses
// ========================

router.get("/warehouses", async (req, res) => {
  try {
    const data = await prisma.warehouse.findMany({
      where: { isDeleted: false },
      orderBy: { code: 'asc' }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/warehouses", async (req, res) => {
  try {
    const { code, name, location } = req.body;
    const data = await prisma.warehouse.create({
      data: { code, name, location }
    });
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: "Gagal membuat gudang.", error: error.message });
  }
});

// ========================
// 5. UOM (Unit of Measurement)
// ========================

router.get("/uoms", async (req, res) => {
  try {
    const data = await prisma.uom.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
