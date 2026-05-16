import express from "express";
import * as assetController from "../controllers/assetController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.use(authenticateToken);

// GET ALL ASSETS
router.get("/", assetController.getAssets);

router.get("/:id", assetController.getAsset);
router.put("/:id", assetController.updateAsset);

// CREATE ASSET
router.post("/", assetController.createAsset);

// DISPOSE ASSET
router.post("/:id/dispose", assetController.disposeAsset);

export default router;
