import { Router } from "express";
import { getAdminEarnings } from "./earnings.controller.js";
import { protectAdmin } from "../../../middleware/auth.middleware.js";

const router = Router();

router.get("/", protectAdmin, getAdminEarnings);

export default router;