import Booking from "../../../models/tourist/Booking.js";
import Settings from "../../../models/admin/Setting.js";
import Rider from "../../../models/rider/Rider.js";
import { getIO } from "../../../config/socket.js";

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

    // Emit to all riders in that city
    try {
        const io = getIO();
        io.to(newBooking.city.toLowerCase()).emit("new-booking", {
            bookingId: newBooking._id,
            city: newBooking.city,
            date: newBooking.date,
            startTime: newBooking.startTime,
            durationType: newBooking.durationType,
            message: `New ${newBooking.durationType} tour request in ${newBooking.city}!`
        });
    } catch (err) {
        console.error("Socket emit error:", err.message);
    }

    // // Auto-assign rider if toggle is ON
    // try {
    //     const settings = await Settings.findOne();
    //     if (settings?.autoAssign) {
    //         // First check if any rider already expressed interest
    //         if (newBooking.interestedRiders.length > 0) {
    //             newBooking.riderId = newBooking.interestedRiders[0].riderId;
    //         } else {
    //             // Find best matching rider directly
    //             const busyRiderIds = await Booking.find({
    //                 status: { $in: ["confirmed", "ongoing"] },
    //                 riderId: { $ne: null }
    //             }).distinct("riderId");
    //
    //             const matchedRider = await Rider.findOne({
    //                 city: { $regex: new RegExp(`^${newBooking.city}$`, "i") },
    //                 languages: newBooking.language,
    //                 isVerified: true,
    //                 verificationStatus: "approved",
    //                 _id: { $nin: busyRiderIds }
    //             }).sort({ rating: -1 });
    //
    //             if (matchedRider) {
    //                 newBooking.riderId = matchedRider._id;
    //             }
    //         }
    //
    //         if (newBooking.riderId) {
    //             newBooking.status = "confirmed";
    //             await newBooking.save();
    //         }
    //     }
    // } catch (err) {
    //     console.error("Auto-assign error:", err.message);
    // }


    return newBooking;
};



// import { io } from "socket.io-client";

// const socket = io("http://localhost:9999");

// // When rider logs in and their city is known:
// socket.emit("join-city", rider.city); // e.g., "Goa"

// // Listen for new bookings
// socket.on("new-booking", (data) => {
//     // Show a toast/notification
//     console.log("🔔 New booking!", data.message);
// });



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
















