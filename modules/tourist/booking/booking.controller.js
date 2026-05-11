import { 
    createBookingService, 
    getBookingsService, 
    getBookingByIdService, 
    cancelBookingService ,
    rateRiderService
} from "./booking.service.js";
import { notifyMatchedRidersNewBooking, notifyRidersBookingCancelled, notifyAdminBookingCancelled } from "../../../core/socket.events.js";

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
        const updatedBooking = await cancelBookingService(req.user._id, id);

        // Notify riders and admin about the cancellation via socket
        notifyRidersBookingCancelled(updatedBooking);
        notifyAdminBookingCancelled(updatedBooking);
        
        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully.",
            data: updatedBooking
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

