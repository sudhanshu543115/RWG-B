import express from "express";
import { handlePaymentLinkWebhookController } from "./payment.controller.js";

const router = express.Router();

// Webhook endpoint (no authentication required for Razorpay webhooks)
router.post("/", handlePaymentLinkWebhookController);

export default router;