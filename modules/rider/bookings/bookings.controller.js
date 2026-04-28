import { 
    getPendingBookingsForRider, 
    expressInterestService, 
    rejectBookingService 
} from "./bookings.service.js";

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
