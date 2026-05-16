import express from "express";
import * as reportController from "../controllers/reportController";
import * as salesController from "../controllers/salesController";
import * as purchasingController from "../controllers/purchasingController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.use(authenticateToken);

router.get("/balance-sheet", reportController.getBalanceSheet);
router.get("/income-statement", reportController.getIncomeStatement);
router.get("/cash-flow", reportController.getCashFlow);

router.get("/trial-balance", reportController.getTrialBalance);
router.get("/sales", reportController.getSalesReport);
router.get("/purchase", reportController.getPurchaseReport);
router.get("/tax", reportController.getTaxReport);
router.get("/stock-card", reportController.getStockCard);
router.get("/ar-aging", salesController.getAgingAR);
router.get("/ap-aging", purchasingController.getAgingAP);

export default router;
