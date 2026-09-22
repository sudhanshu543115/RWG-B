import { createRazorpayOrder, verifyRazorpayPayment, getPaymentHistoryService, createRefundRequest, getRefundRequests, updateRefundRequest, saveRefundDetailsService, fixExistingRefundRequests, handlePaymentLinkWebhook } from "./payment.service.js";
import { notifyMatchedRidersNewBooking } from "../../../core/socket.events.js";


export const createOrderController = async (req, res) => {
    try {
        const { bookingId } = req.body;
        if (!bookingId) {
            return res.status(400).json({ success: false, message: "Booking ID is required." });
        }

        const order = await createRazorpayOrder(bookingId);
        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Error in createOrderController:", error);
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const verifyPaymentController = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;
        
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !bookingId) {
            return res.status(400).json({ success: false, message: "Missing payment or booking details." });
        }

        const result = await verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId);
        
        // 🔥 NEW: Now that payment is partial_paid, notify riders to start searching
        if (result.booking.payment.status === "partial_paid") {
            await notifyMatchedRidersNewBooking(result.booking);
        }

        return res.status(200).json({ 
            success: true, 
            message: "Payment verified and booking confirmed.",
            data: result.booking 
        });
    } catch (error) {
        console.error("Error in verifyPaymentController:", error);
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const getPaymentHistory = async (req, res) => {
    try {
        const history = await getPaymentHistoryService(req.user._id);
        return res.status(200).json({
            success: true,
            message: "Payment history retrieved successfully.",
            data: history
        });
    } catch (error) {
        console.error("Error in getPaymentHistory:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch payment history."
        });
    }
};

export const createRefundRequestController = async (req, res) => {
    try {
        const { bookingId, refundDetails } = req.body;
        const refundRequest = await createRefundRequest(req.user._id, bookingId, refundDetails);
        return res.status(200).json({
            success: true,
            message: "Refund request submitted successfully.",
            data: refundRequest
        });
    } catch (error) {
        console.error("Error in createRefundRequestController:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to submit refund request."
        });
    }
};

export const getRefundRequestsController = async (req, res) => {
    try {
        const refundRequests = await getRefundRequests(req.user._id);
        return res.status(200).json({
            success: true,
            message: "Refund requests retrieved successfully.",
            data: refundRequests
        });
    } catch (error) {
        console.error("Error in getRefundRequestsController:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch refund requests."
        });
    }
};

export const saveRefundDetailsController = async (req, res) => {
    try {
        const { paymentMethod, upiId, bankAccount } = req.body;
        const updatedUser = await saveRefundDetailsService(req.user._id, { paymentMethod, upiId, bankAccount });
        return res.status(200).json({
            success: true,
            message: "Refund details saved successfully.",
            data: updatedUser
        });
    } catch (error) {
        console.error("Error in saveRefundDetailsController:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to save refund details."
        });
    }
};

export const fixExistingRefundRequestsController = async (req, res) => {
    try {
        const fixedCount = await fixExistingRefundRequests();
        return res.status(200).json({
            success: true,
            message: `Fixed ${fixedCount} existing refund requests.`,
            data: { fixedCount }
        });
    } catch (error) {
        console.error("Error in fixExistingRefundRequestsController:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fix existing refund requests."
        });
    }
};

export const handlePaymentLinkWebhookController = async (req, res) => {
    try {
        const webhookData = req.body;
        const result = await handlePaymentLinkWebhook(webhookData);
        return res.status(200).json({
            success: true,
            message: "Webhook processed successfully.",
            data: result
        });
    } catch (error) {
        console.error("Error in handlePaymentLinkWebhookController:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to process webhook."
        });
    }
};
