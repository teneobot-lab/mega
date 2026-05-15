import express from "express";
import { prisma } from "../prisma";

const router = express.Router();

/**
 * Endpoint to seed a super admin and basic master data if none exists.
 * Used during setup or first boot.
 */
router.post("/init", async (req, res) => {
  try {
    // Check if role admin exists
    let adminRole = await prisma.role.findUnique({ where: { name: "Admin" } });
    if (!adminRole) {
       adminRole = await prisma.role.create({
         data: {
           name: "Admin",
           description: "Administrator dengan akses penuh"
         }
       });
       
       await prisma.role.createMany({
         data: [
           { name: "Kasir", description: "Bisa melihat kas dan transaksi" },
           { name: "Gudang", description: "Mengatur stok dan inventory" },
           { name: "Akuntan", description: "Membuat laporan dan jurnal" }
         ]
       })
    }

    // Check if any user exists
    const userCount = await prisma.user.count();
    let user;
    if (userCount === 0) {
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      user = await prisma.user.create({
        data: {
          email: "admin@accurate.local",
          name: "Super Admin",
          password: hashedPassword,
          roleId: adminRole.id
        }
      });
    }

    // Init UOM
    const uomCount = await prisma.uom.count();
    if (uomCount === 0) {
      await prisma.uom.createMany({
        data: [
          { code: "PCS", name: "Pieces" },
          { code: "KG", name: "Kilograms" },
          { code: "BOX", name: "Box" }
        ]
      })
    }

    // Init Basic Accounts
    const accountCount = await prisma.account.count();
    if (accountCount === 0) {
      await prisma.account.createMany({
        data: [
          { code: "110-10", name: "Kas Sedang", type: "ASSET" },
          { code: "110-20", name: "Bank BCA", type: "ASSET" },
          { code: "120-10", name: "Piutang Usaha", type: "ASSET" },
          { code: "210-10", name: "Hutang Usaha", type: "LIABILITY" },
          { code: "310-10", name: "Modal Pemilik", type: "EQUITY" },
          { code: "410-10", name: "Pendapatan Penjualan", type: "REVENUE" },
          { code: "510-10", name: "Harga Pokok Penjualan", type: "EXPENSE" },
          { code: "610-10", name: "Beban Gaji", type: "EXPENSE" },
        ]
      })
    }

    res.json({ message: "Initialisasi Database Berhasil", user });
  } catch (error: any) {
    res.status(500).json({ message: "Gagal inisialisasi", error: error.message });
  }
});

export default router;
