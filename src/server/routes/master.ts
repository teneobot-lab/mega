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

// Generic Helper for CRUD
const handleCRUD = (model: any, modelName: string) => {
  return {
    getAll: async (req: any, res: any) => {
      try {
        const { type, isDeleted = false } = req.query;
        const data = await (prisma as any)[model].findMany({
          where: { 
            ...(type && { type: String(type) }),
            ...((prisma as any)[model].fields.isDeleted ? { isDeleted: isDeleted === 'true' } : {})
          },
          orderBy: { createdAt: 'desc' }
        });
        res.json(data);
      } catch (error: any) {
        res.status(500).json({ message: `Gagal mengambil data ${modelName}`, error: error.message });
      }
    },
    getOne: async (req: any, res: any) => {
      try {
        const { id } = req.params;
        const data = await (prisma as any)[model].findUnique({ where: { id } });
        if (!data) return res.status(404).json({ message: `${modelName} tidak ditemukan` });
        res.json(data);
      } catch (error: any) {
        res.status(500).json({ message: `Gagal mengambil data ${modelName}`, error: error.message });
      }
    },
    create: async (req: any, res: any) => {
      try {
        const data = await (prisma as any)[model].create({ data: req.body });
        res.json(data);
      } catch (error: any) {
        res.status(400).json({ message: `Gagal membuat ${modelName}`, error: error.message });
      }
    },
    update: async (req: any, res: any) => {
      try {
        const { id } = req.params;
        const data = await (prisma as any)[model].update({ where: { id }, data: req.body });
        res.json(data);
      } catch (error: any) {
        res.status(400).json({ message: `Gagal memperbarui ${modelName}`, error: error.message });
      }
    },
    delete: async (req: any, res: any) => {
      try {
        const { id } = req.params;
        if ((prisma as any)[model].fields.isDeleted) {
          await (prisma as any)[model].update({ where: { id }, data: { isDeleted: true } });
        } else {
          await (prisma as any)[model].delete({ where: { id } });
        }
        res.json({ message: `${modelName} berhasil dihapus` });
      } catch (error: any) {
        res.status(400).json({ message: `Gagal menghapus ${modelName}`, error: error.message });
      }
    }
  };
};

// ========================
// 1. Accounts
// ========================
const accountCRUD = handleCRUD('account', 'Akun');
router.get("/accounts", accountCRUD.getAll);
router.get("/accounts/:id", accountCRUD.getOne);
router.post("/accounts", accountCRUD.create);
router.put("/accounts/:id", accountCRUD.update);
router.delete("/accounts/:id", accountCRUD.delete);

// ========================
// 2. Contacts (Customers/Suppliers/Salesmen)
// ========================
const contactCRUD = handleCRUD('contact', 'Kontak');
router.get("/contacts", contactCRUD.getAll);
router.get("/contacts/:id", contactCRUD.getOne);
router.post("/contacts", contactCRUD.create);
router.put("/contacts/:id", contactCRUD.update);
router.delete("/contacts/:id", contactCRUD.delete);

// Specific for Salesman
router.get("/salesman", async (req, res) => {
    try {
        const data = await prisma.contact.findMany({
            where: { type: "SALESMAN", isDeleted: false },
            orderBy: { name: 'asc' }
        });
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ message: "Gagal mengambil data salesman" });
    }
});

// ========================
// 3. Items
// ========================
const itemCRUD = handleCRUD('item', 'Barang');
router.get("/items", async (req, res) => {
    try {
        const data = await prisma.item.findMany({
            where: { isDeleted: false },
            include: { category: true, baseUom: true },
            orderBy: { code: 'asc' }
        });
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ message: "Gagal mengambil data barang" });
    }
});
router.get("/items/:id", async (req, res) => {
    try {
        const data = await prisma.item.findUnique({
            where: { id: req.params.id },
            include: { category: true, baseUom: true }
        });
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ message: "Gagal mengambil data barang" });
    }
});
router.post("/items", itemCRUD.create);
router.put("/items/:id", itemCRUD.update);
router.delete("/items/:id", itemCRUD.delete);

// ========================
// 4. Warehouses
// ========================
const warehouseCRUD = handleCRUD('warehouse', 'Gudang');
router.get("/warehouses", warehouseCRUD.getAll);
router.get("/warehouses/:id", warehouseCRUD.getOne);
router.post("/warehouses", warehouseCRUD.create);
router.put("/warehouses/:id", warehouseCRUD.update);
router.delete("/warehouses/:id", warehouseCRUD.delete);

// ========================
// 5. UOM
// ========================
const uomCRUD = handleCRUD('uom', 'Satuan');
router.get("/uom", uomCRUD.getAll);
router.get("/uoms", uomCRUD.getAll); // Alias
router.get("/uom/:id", uomCRUD.getOne);
router.post("/uom", uomCRUD.create);
router.put("/uom/:id", uomCRUD.update);
router.delete("/uom/:id", uomCRUD.delete);

// ========================
// 6. Item Categories
// ========================
const catCRUD = handleCRUD('itemCategory', 'Kategori Barang');
router.get("/item-categories", catCRUD.getAll);
router.get("/item-categories/:id", catCRUD.getOne);
router.post("/item-categories", catCRUD.create);
router.put("/item-categories/:id", catCRUD.update);
router.delete("/item-categories/:id", catCRUD.delete);

// ========================
// 7. Departments
// ========================
const deptCRUD = handleCRUD('department', 'Departemen');
router.get("/departments", deptCRUD.getAll);
router.get("/departments/:id", deptCRUD.getOne);
router.post("/departments", deptCRUD.create);
router.put("/departments/:id", deptCRUD.update);
router.delete("/departments/:id", deptCRUD.delete);

// ========================
// 8. Projects
// ========================
const projCRUD = handleCRUD('project', 'Proyek');
router.get("/projects", async (req, res) => {
    try {
        const data = await prisma.project.findMany({
            where: { isDeleted: false },
            include: { customer: true },
            orderBy: { code: 'asc' }
        });
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ message: "Gagal mengambil data proyek" });
    }
});
router.get("/projects/:id", projCRUD.getOne);
router.post("/projects", projCRUD.create);
router.put("/projects/:id", projCRUD.update);
router.delete("/projects/:id", projCRUD.delete);

// ========================
// 9. Taxes
// ========================
const taxCRUD = handleCRUD('tax', 'Pajak');
router.get("/taxes", async (req, res) => {
    try {
        const data = await prisma.tax.findMany({
            where: { isDeleted: false },
            include: { account: true },
            orderBy: { code: 'asc' }
        });
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ message: "Gagal mengambil data pajak" });
    }
});
router.get("/taxes/:id", taxCRUD.getOne);
router.post("/taxes", taxCRUD.create);
router.put("/taxes/:id", taxCRUD.update);
router.delete("/taxes/:id", taxCRUD.delete);

// ========================
// 10. Currencies
// ========================
const currCRUD = handleCRUD('currency', 'Mata Uang');
router.get("/currencies", currCRUD.getAll);
router.get("/currencies/:id", currCRUD.getOne);
router.post("/currencies", currCRUD.create);
router.put("/currencies/:id", currCRUD.update);
router.delete("/currencies/:id", currCRUD.delete);

// Currency Rates History
router.get("/currencies/rates/history", async (req, res) => {
    try {
        const { currencyId } = req.query;
        const data = await prisma.currencyRateHistory.findMany({
            where: { ...(currencyId && { currencyId: String(currencyId) }) },
            orderBy: { date: 'desc' },
            take: 100
        });
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ message: "Gagal mengambil history kurs" });
    }
});

export default router;
