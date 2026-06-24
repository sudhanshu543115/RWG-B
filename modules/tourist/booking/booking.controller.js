import { 
    createBookingService, 
    getBookingsService, 
    getBookingByIdService, 
    cancelBookingService ,
    rateRiderService,
    getBookingEstimateService
} from "./booking.service.js";
import { 
    notifyMatchedRidersNewBooking, 
    notifyRidersBookingCancelled, 
    notifyAdminBookingCancelled,
    notifyAdminEmergencySOS,
    notifyTouristRefundProcessed
} from "../../../core/socket.events.js";
import { sendTouristRefundEmail } from "../../../core/touristEmails.js";
import Booking from "../../../models/tourist/Booking.js";

export const getBookingEstimate = async (req, res) => {
    try {
        const estimate = await getBookingEstimateService(req.body);
        return res.status(200).json({
            success: true,
            message: "Estimate calculated successfully.",
            data: estimate
        });
    } catch (error) {
        console.error("Error in getBookingEstimate:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to calculate estimate."
        });
    }
};

export const createBooking = async (req, res) => {
    try {
        const booking = await createBookingService(req.user._id, req.body);
        return res.status(201).json({
            success: true,
            message: "Booking created successfully.",
            data: booking
        });
    } catch (error) {
        console.error("Error in createBooking:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create booking."
        });
    }
};

export const getBookings = async (req, res) => {
    try {
        const bookings = await getBookingsService(req.user._id);
        return res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully.",
            data: bookings
        });
    } catch (error) {
        console.error("Error in getBookings:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to retrieve bookings."
        });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await getBookingByIdService(req.user._id, id);
        return res.status(200).json({
            success: true,
            message: "Booking details retrieved successfully.",
            data: booking
        });
    } catch (error) {
        console.error("Error in getBookingById:", error);
        return res.status(404).json({ 
            success: false,
            message: error.message || "Booking not found."
        });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const result = await cancelBookingService(req.user._id, id, reason);

        // Notify riders and admin about the cancellation via socket
        notifyRidersBookingCancelled(result.booking);
        notifyAdminBookingCancelled(result.booking);
        
        // Notify tourist if refund is due (processed or pending)
        console.log("🔁 refundStatus:", result.cancellation.refundStatus, "| refundAmount:", result.cancellation.refundAmount);
        if (["processed", "pending"].includes(result.cancellation.refundStatus) && result.cancellation.refundAmount > 0) {
            notifyTouristRefundProcessed(result.booking, result.cancellation.refundAmount);
            // Use email from req.user (full user doc from DB via protectTourist)
            const touristEmail = req.user?.email;
            console.log("📧 Tourist email for refund mail:", touristEmail);
            if (touristEmail) {
                sendTouristRefundEmail(touristEmail, result.cancellation.refundAmount);
            } else {
                console.warn("⚠️ No tourist email found — skipping refund email.");
            }
        }
        
        return res.status(200).json({
            success: true,
            message: result.cancellation.note,
            data: result.booking,
            cancellation: result.cancellation
        });
    } catch (error) {
        console.error("Error in cancelBooking:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to cancel booking."
        });
    }
};


export const rateRider = async (req, res) => {
    try {
        const { rating } = req.body; // Only taking rating
        const booking = await rateRiderService(req.user._id, req.params.id, rating);
        
        res.status(200).json({
            success: true,
            message: "Rating submitted successfully",
            data: booking
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

    export const triggerSOS = async (req, res) => {
    try {
        const { bookingId, location } = req.body;
        if (!bookingId) {
            return res.status(400).json({ success: false, message: "Booking ID is required" });
        }
        
        // Find booking and populate rider and tourist to get their details for the alert
        const booking = await Booking.findOne({ _id: bookingId, touristId: req.user._id })
            .populate("touristId", "name phone")
            .populate("riderId", "name phone");
            
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        
        // Temporarily attach the tourist's exact location from their device
        if (location && location.lat && location.lng) {
            booking.liveLocation = location;
        }

        // Emit the SOS socket event to the admin
        notifyAdminEmergencySOS(booking);
        
        return res.status(200).json({
            success: true,
            message: "SOS Alert sent to admin successfully"
        });
    } catch (error) {
        console.error("Error in triggerSOS:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to trigger SOS alert"
        });
    }
};
