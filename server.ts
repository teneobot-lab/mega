import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";

import authRoutes from "./src/server/routes/auth";
import masterRoutes from "./src/server/routes/master";
import purchasingRoutes from "./src/server/routes/purchasing";
import salesRoutes from "./src/server/routes/sales";
import financeRoutes from "./src/server/routes/finance";
import accountingRoutes from "./src/server/routes/accounting";
import inventoryRoutes from "./src/server/routes/inventory";
import transactionsRoutes from "./src/server/routes/transactions";
import assetsRoutes from "./src/server/routes/assets";
import dashboardRoutes from "./src/server/routes/dashboard";
import reportsRoutes from "./src/server/routes/reports";
import recurringRoutes from "./src/server/routes/recurring";
import seedRoutes from "./src/server/routes/seed";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/master", masterRoutes);
  app.use("/api/purchasing", purchasingRoutes);
  app.use("/api/sales", salesRoutes);
  app.use("/api/finance", financeRoutes);
  app.use("/api/accounting", accountingRoutes);
  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/transactions", transactionsRoutes);
  app.use("/api/assets", assetsRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/reports", reportsRoutes);
  app.use("/api/recurring", recurringRoutes);
  app.use("/api/setup", seedRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
