import Booking from "../../../models/tourist/Booking.js";
import Settings from "../../../models/admin/Setting.js";
import Rider from "../../../models/rider/Rider.js";

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
        payment: {
            ...payment,
            status: "pending"
        },
        bookingStatus: "pending", 
        assignmentStatus: "not_assigned"
    });

    await newBooking.save();

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


    // Return a clean object for the tourist
    const bookingResponse = newBooking.toObject();
    delete bookingResponse.interestedRiders;
    delete bookingResponse.rejectedRiders;

    return bookingResponse;
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
    const bookings = await Booking.find({ touristId: userId })
        .populate("riderId", "name phone profileImage vehicleModel vehicleNumber vehicleType rating")
        .select("-interestedRiders -rejectedRiders")
        .sort({ createdAt: -1 });
    return bookings;
};

export const getBookingByIdService = async (userId, bookingId) => {
    const booking = await Booking.findOne({ touristId: userId, _id: bookingId })
        .populate("riderId", "name phone profileImage vehicleModel vehicleNumber vehicleType rating")
        .select("-interestedRiders -rejectedRiders");
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

    // Prevents proceeding if ride has already started or finished
    if (["ongoing", "completed"].includes(booking.bookingStatus)) {
        throw new Error(`Cannot cancel an ${booking.bookingStatus} ride.`);
    }

    if (booking.bookingStatus === "cancelled") {
        throw new Error("Booking is already cancelled.");
    }

    booking.bookingStatus = "cancelled";
    await booking.save();
    return booking;
};



export const rateRiderService = async (touristId, bookingId, rating) => {
    const booking = await Booking.findOne({ _id: bookingId, touristId });
    
    if (!booking) throw new Error("Booking not found");
    if (booking.bookingStatus !== "completed") throw new Error("Ride not completed yet");

    // Save only the star rating
    booking.review = {
        rating,
        isReviewed: true,
        reviewedAt: new Date()
    };
    await booking.save();

    // Update Rider's Average Star Rating
    const rider = await Rider.findById(booking.riderId);
    if (rider) {
        const total = rider.totalRides || 0;
        const current = rider.rating || 0;
        const ratingNum = Number(rating); // 🔥 Force to Number
        
        const calculatedRating = ((current * total) + ratingNum) / (total + 1);
        rider.rating = Number(calculatedRating.toFixed(1)); // 🎯 Round to 1 decimal
        rider.totalRides = total + 1;
        await rider.save();
    }

    return booking;
};

















