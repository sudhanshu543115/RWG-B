import express from "express";
import { protectAdmin } from "../../../middleware/auth.middleware.js";
import { getAllKitOrders, updateKitOrderStatus } from "./kit.controller.js";

const router = express.Router();

router.get("/orders", protectAdmin, getAllKitOrders);
router.patch("/orders/:id/status", protectAdmin, updateKitOrderStatus);

export default router;
