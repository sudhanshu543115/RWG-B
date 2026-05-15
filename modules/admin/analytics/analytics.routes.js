import express from "express";
import { getOverviewStats } from "./analytics.controller.js";
import { protectAdmin } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Get dashboard overview stats
router.get("/overview", protectAdmin, getOverviewStats);

export default router;
