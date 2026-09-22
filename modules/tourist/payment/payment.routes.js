import express from "express";
import { 
    createOrderController,
    verifyPaymentController,
    getPaymentHistory,
    createRefundRequestController,
    getRefundRequestsController,
    saveRefundDetailsController,
    fixExistingRefundRequestsController,
    handlePaymentLinkWebhookController
} from "./payment.controller.js";
import { protectTourist } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Apply protection to all payment routes
router.use(protectTourist);

router.get("/history", getPaymentHistory);
router.post("/create-order", createOrderController);
router.post("/verify-payment", verifyPaymentController);
router.post("/refund-request", createRefundRequestController);
router.get("/refund-requests", getRefundRequestsController);
router.put("/refund-details", saveRefundDetailsController);
router.post("/fix-existing-refunds", fixExistingRefundRequestsController);

export { handlePaymentLinkWebhookController };
export default router;
