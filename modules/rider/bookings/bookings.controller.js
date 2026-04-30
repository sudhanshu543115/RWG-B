import { 
    getPendingBookingsForRider, 
    expressInterestService, 
    rejectBookingService,
    getMyBookingsService,
    startRideService,
    completeRideService
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

export const completeRide = async (req, res) => {
    try {
        const booking = await completeRideService(req.user._id, req.params.id);
        res.status(200).json({ success: true, message: "Ride completed!", data: booking });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
