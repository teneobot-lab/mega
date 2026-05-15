import express from "express";
import * as authController from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);
router.get("/me", authenticateToken, authController.getMe);

export default router;
