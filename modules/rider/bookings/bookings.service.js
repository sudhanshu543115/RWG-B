import Booking from "../../../models/tourist/Booking.js";
import Rider from "../../../models/rider/Rider.js";

// Get all pending bookings matching rider's city & language
export const getPendingBookingsForRider = async (riderId) => {
    const rider = await Rider.findById(riderId);
    if (!rider) throw new Error("Rider not found.");

    // Check if profile is approved (double check even though middleware handles it)
    if (rider.verificationStatus !== "approved") {
        return []; 
    }

    // Create case-insensitive regex for each language the rider speaks
    const riderLanguagesRegex = rider.languages.map(lang => new RegExp(`^${lang.trim()}$`, "i"));

    const query = {
        city: { $regex: new RegExp(`^${rider.city.trim()}$`, "i") },
        language: { $in: riderLanguagesRegex },
        bookingStatus: "searching", // Riders see bookings only AFTER advance is paid and broadcast starts
        riderId: null,
        rejectedRiders: { $nin: [riderId] }
    };

    // Filter by Gender Preference
    if (rider.gender === "Male") {
        query.genderPreference = { $ne: "Female guide preferred" };
    } else if (rider.gender === "Female") {
        query.genderPreference = { $ne: "Male guide preferred" };
    }

    const bookings = await Booking.find(query)
        .populate("touristId", "name phone")
        .sort({ createdAt: -1 });

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


// Start the ride
export const startRideService = async (riderId, bookingId) => {
    const booking = await Booking.findOne({ _id: bookingId, riderId });
    if (!booking) throw new Error("Booking not found or not assigned to you.");
    if (booking.bookingStatus !== "assigned") throw new Error("Booking must be assigned to start.");

    booking.bookingStatus = "ongoing";
    await booking.save();
    return booking;
};

// Complete the ride
export const completeRideService = async (riderId, bookingId) => {
    const booking = await Booking.findOne({ _id: bookingId, riderId });
    if (!booking) throw new Error("Booking not found or not assigned to you.");
    if (booking.bookingStatus !== "ongoing") throw new Error("Only ongoing rides can be completed.");

    booking.bookingStatus = "completed"; 
    await booking.save();
    return booking;
};
