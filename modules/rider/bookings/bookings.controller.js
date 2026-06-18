import {
    getPendingBookingsForRider,
    expressInterestService,
    rejectBookingService,
    getMyBookingsService,
    startRideService,
    verifyEndRideOtpService,
    completeRideService,
    verifyAndCompleteRideService,
    getBookingByIdService,
    updateTrackingService,
    cancelBookingService
} from "./bookings.service.js";
import { notifyTouristRideCompleted } from "../../../core/socket.events.js";

export const getBookingById = async (req, res) => {
    try {
        const booking = await getBookingByIdService(req.params.id, req.user._id);
        res.status(200).json({
            success: true,
            message: "Booking retrieved successfully.",
            data: booking
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getPendingBookings = async (req, res) => {
    try {
        const bookings = await getPendingBookingsForRider(req.user._id);
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const expressInterest = async (req, res) => {
    try {
        const booking = await expressInterestService(req.user._id, req.params.id);
        res.status(200).json({ success: true, message: "Interest sent to admin!", data: booking });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const rejectBooking = async (req, res) => {
    try {
        const booking = await rejectBookingService(req.user._id, req.params.id);
        res.status(200).json({ success: true, message: "Booking rejected.", data: booking });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const bookings = await getMyBookingsService(req.user._id);
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const startRide = async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json({ success: false, message: "OTP is required to start the ride." });
        }
        const booking = await startRideService(req.user._id, req.params.id, otp);
        res.status(200).json({ success: true, message: "Ride started!", data: booking });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const verifyEndRideOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json({ success: false, message: "End OTP is required to complete the ride." });
        }
        const booking = await verifyEndRideOtpService(req.user._id, req.params.id, otp);
        res.status(200).json({ success: true, message: "End OTP verified!", data: booking });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};



export const completeRide = async (req, res) => {
    try {
const { booking, paymentLink, remainingAmount } = 
    await completeRideService(req.user._id, req.params.id);

res.status(200).json({
    success: true,
    message: "Ride completion initiated. Please collect payment.",
    data: booking,
    paymentLink,
    remainingAmount
});

// Notify tourist if completed immediately (0 remaining)
if (booking.bookingStatus === 'completed') {
    notifyTouristRideCompleted(booking);
}
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const verifyPaymentAndComplete = async (req, res) => {
    try {
        const booking = await verifyAndCompleteRideService(req.user._id, req.params.id);
        res.status(200).json({ 
            success: true, 
            message: "Payment verified and ride completed! 🎉", 
            data: booking 
        });

        // Notify tourist via socket
        notifyTouristRideCompleted(booking);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateTracking = async (req, res) => {
    try {
        const { stage, lat, lng, stopId } = req.body;
        const booking = await updateTrackingService(req.user._id, req.params.id, { stage, lat, lng, stopId });
        res.status(200).json({
            success: true,
            message: "Tracking updated successfully.",
            data: booking
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const updatedBooking = await cancelBookingService(req.user._id, id, reason);

        // Notify tourist and admin about the cancellation via socket
        import('../../../core/socket.events.js').then(({ notifyTouristBookingCancelled, notifyAdminBookingCancelled }) => {
            notifyTouristBookingCancelled(updatedBooking);
            notifyAdminBookingCancelled(updatedBooking);
        });
        
        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully.",
            data: updatedBooking
        });
    } catch (error) {
        console.error("Error in cancelBooking (rider):", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to cancel booking."
        });
    }
};
