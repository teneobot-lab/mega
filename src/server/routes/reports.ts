import express from "express";
import * as reportController from "../controllers/reportController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.use(authenticateToken);

router.get("/balance-sheet", reportController.getBalanceSheet);
router.get("/income-statement", reportController.getIncomeStatement);
router.get("/cash-flow", reportController.getCashFlow);

export default router;
