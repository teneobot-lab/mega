import express from "express";
import * as recurringController from "../controllers/recurringController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.use(authenticateToken);

router.get("/", recurringController.getRecurring);
router.post("/", recurringController.createRecurring);
router.post("/:id/execute", recurringController.executeRecurring);

export default router;
