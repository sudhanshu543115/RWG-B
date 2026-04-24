import express from "express";
import { 
    createOrderController,
    verifyPaymentController,
    getPaymentHistory 
} from "./payment.controller.js";
import { protectTourist } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Apply protection to all payment routes
router.use(protectTourist);

router.get("/history", getPaymentHistory);
router.post("/create-order", createOrderController);
router.post("/verify-payment", verifyPaymentController);

export default router;
