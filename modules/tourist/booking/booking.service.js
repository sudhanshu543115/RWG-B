import Booking from "../../../models/tourist/Booking.js";

export const createBookingService = async (userId, bookingData) => {
    const { 
        city, date, startTime, endTime, durationType, 
        totalHours, pickupLocation, language, genderPreference, 
        stops, specialRequest, pricing, payment 
    } = bookingData;

    const newBooking = new Booking({
        touristId: userId,
        city,
        date,
        startTime,
        endTime,
        durationType,
        totalHours,
        pickupLocation,
        language,
        genderPreference,
        stops,
        specialRequest,
        pricing,
        payment,
        status: "pending",
        paymentStatus: "pending"
    });

    await newBooking.save();
    return newBooking;
};

export const getBookingsService = async (userId) => {
    const bookings = await Booking.find({ touristId: userId }).sort({ createdAt: -1 });
    return bookings;
};

export const getBookingByIdService = async (userId, bookingId) => {
    const booking = await Booking.findOne({ touristId: userId, _id: bookingId });
    if (!booking) {
        throw new Error("Booking not found.");
    }
    return booking;
};

export const cancelBookingService = async (userId, bookingId) => {
    const booking = await Booking.findOne({ touristId: userId, _id: bookingId });
    
    if (!booking) {
        throw new Error("Booking not found.");
    }

    if (booking.status === "cancelled") {
        throw new Error("Booking is already cancelled.");
    }

    booking.status = "cancelled";
    await booking.save();
    return booking;
};
