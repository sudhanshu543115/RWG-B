import { createRazorpayOrder, verifyRazorpayPayment, getPaymentHistoryService } from "./payment.service.js";
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
