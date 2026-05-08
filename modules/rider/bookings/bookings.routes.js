import express from "express";
import { protectRider } from "../../../middleware/auth.middleware.js";
import { 
    getPendingBookings, 
    expressInterest, 
    rejectBooking,
    getMyBookings,
    startRide,
    completeRide,
    verifyPaymentAndComplete,
    getBookingById
} from "./bookings.controller.js";
import razorpay from "../../../config/razorpay.js";
const router = express.Router();
// ✅ YE ADD KARO route file ke top pe
import Booking from "../../../models/tourist/Booking.js";

router.use(protectRider);

router.get("/pending", getPendingBookings);
router.get("/my-bookings", getMyBookings);

router.get("/:id/payment-status", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.json({ status: 'not_found' });

        // Agar pehle se paid hai
        if (booking.payment.status === 'paid') {
            return res.json({ status: 'paid' });
        }

        // Razorpay se live status check karo
        if (booking.payment.remainingOrderId) {
            const paymentLink = await razorpay.paymentLink.fetch(
                booking.payment.remainingOrderId
            );

            // Razorpay bolta hai "paid" toh booking update karo
            if (paymentLink.status === 'paid') {
                booking.payment.status = 'paid';
                booking.payment.paidAt = new Date();
                await booking.save();
                return res.json({ status: 'paid' });
            }
        }

        res.json({ status: booking.payment.status });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});
router.get("/:id", getBookingById);
router.post("/:id/interested", expressInterest);
router.post("/:id/reject", rejectBooking);
router.patch("/:id/start", startRide);
router.patch("/:id/complete", completeRide);
router.patch("/:id/verify-payment", verifyPaymentAndComplete);



export default router;
