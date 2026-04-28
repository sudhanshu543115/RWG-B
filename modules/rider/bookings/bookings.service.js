import Booking from "../../../models/tourist/Booking.js";
import Rider from "../../../models/rider/Rider.js";

// Get all pending bookings matching rider's city & language
export const getPendingBookingsForRider = async (riderId) => {
    const rider = await Rider.findById(riderId);
    if (!rider) throw new Error("Rider not found.");

    const bookings = await Booking.find({
        city: { $regex: new RegExp(`^${rider.city}$`, "i") },
        language: { $in: rider.languages },
        status: "pending",
        riderId: null,
        rejectedRiders: { $nin: [riderId] }
    }).populate("touristId", "name phone").sort({ createdAt: -1 });

    return bookings;
};

// Rider clicks "Interested"
export const expressInterestService = async (riderId, bookingId) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found.");
    if (booking.riderId) throw new Error("Rider already assigned.");

    const alreadyInterested = booking.interestedRiders.some(
        r => r.riderId.toString() === riderId.toString()
    );
    if (alreadyInterested) throw new Error("You already expressed interest.");

    booking.interestedRiders.push({ riderId, interestedAt: new Date() });
    await booking.save();

    // Return with rider names populated
    const populatedBooking = await Booking.findById(bookingId)
        .populate("interestedRiders.riderId", "name phone city rating");

    return populatedBooking;
};

// Rider clicks "Reject"
export const rejectBookingService = async (riderId, bookingId) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found.");

    if (!booking.rejectedRiders.includes(riderId)) {
        booking.rejectedRiders.push(riderId);
    }
    await booking.save();
    return booking;
};
