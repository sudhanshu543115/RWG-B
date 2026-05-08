import express from "express";
import { getPlatformConfig, updatePlatformConfig } from "./config.controller.js";
import { protectAdmin } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// GET is public
router.get("/", getPlatformConfig);

// Other methods are admin protected
router.put("/", protectAdmin, updatePlatformConfig);
router.post("/", protectAdmin, updatePlatformConfig);

export default router;
