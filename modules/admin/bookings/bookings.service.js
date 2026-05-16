import Booking from "../../../models/tourist/Booking.js";
import User from "../../../models/tourist/User.js";
import Rider from "../../../models/rider/Rider.js";
import Settings from "../../../models/admin/Setting.js";
import { notifyTouristRiderAssigned , notifyRiderAssigned} from "../../../core/socket.events.js";
import Conversation from "../../../models/chat/Conversation.js";


export const getAllBookings = async () => {
    const bookings = await Booking.find()
        .populate("touristId")
        .populate("riderId")
        .populate("interestedRiders.riderId", "name phone city rating")
        .sort({ createdAt: -1 })
        .lean();

    // Add counts
    return bookings.map(booking => ({
        ...booking,
        interestedCount: booking.interestedRiders?.length || 0,
        rejectedCount: booking.rejectedRiders?.length || 0
    }));
}


export const getBookingById = async (id) => {
    const booking = await Booking.findById(id)
        .populate("touristId")
        .populate("riderId")
        .populate("interestedRiders.riderId", "name phone city rating")
        .lean();

    if (!booking) return null;

    return {
        ...booking,
        interestedCount: booking.interestedRiders?.length || 0,
        rejectedCount: booking.rejectedRiders?.length || 0
    };
}





export const deleteBooking = async (id) => {
    const booking = await Booking.findByIdAndDelete(id);
    return booking;
}


export const assignRiderToBooking = async (id, riderId) => {
    console.log("📥 assignRiderToBooking service called with:", { bookingId: id, riderId });
    
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const booking = await Booking.findByIdAndUpdate(
        id, 
        { 
            riderId: riderId, 
            bookingStatus: "assigned",
            assignmentStatus: "admin_assigned",
            rideOTP: otp
        }, 
        { new: true }
    ).populate("touristId").populate("riderId"); // 🔥 IMPORTANT

    if (!booking) throw new Error("Booking not found");

    console.log("🚀 EMIT RIDER ASSIGNED - booking populated:", { bookingId: booking._id, touristId: booking.touristId, riderId: booking.riderId._id });

    // 🔥 EMIT TO TOURIST
    console.log("🎯 CALLING notifyTouristRiderAssigned...");
    // CREATE CHAT CONVERSATION
await Conversation.findOneAndUpdate(
    {
        bookingId: booking._id
    },
    {
        bookingId: booking._id,
        touristId: booking.touristId._id,
        riderId: booking.riderId._id
    },
    {
        upsert: true,
        new: true
    }
);
    notifyTouristRiderAssigned(booking, booking.riderId);
    // 🔥 EMIT TO RIDER
notifyRiderAssigned(booking, booking.riderId);
    console.log("✅ notifyTouristRiderAssigned completed");

    return booking;
};

export const autoAssignRiderService = async (bookingId) => {
    // 1. Find the booking and populate the interested riders' full details
    const booking = await Booking.findById(bookingId)
        .populate("interestedRiders.riderId", "name rating totalRides isVerified verificationStatus profileCompleted city languages vehicleType")
        .populate("touristId"); // 👈 IMPORTANT: Populate touristId for notification
    
    if (!booking) throw new Error("Booking not found.");
    if (booking.riderId) throw new Error("Rider already assigned to this booking.");
    
    // 2. Check if anyone has expressed interest
    if (!booking.interestedRiders || booking.interestedRiders.length === 0) {
        throw new Error("No riders have expressed interest in this booking yet. Cannot auto-assign.");
    }

    // 3. Filter and Sort the interested riders to find the best match
    // We sort by rating (highest first) and then by total rides
    const candidates = booking.interestedRiders
        .map(item => item.riderId)
        .filter(rider => 
            rider.verificationStatus === "approved" && 
            rider.profileCompleted === true
            // rider.vehicleType === booking.vehicleType // Optional: Add this if you want to strictly match vehicle
        )
        .sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return b.totalRides - a.totalRides;
        });

    if (candidates.length === 0) {
        throw new Error("No approved riders found in the interested list.");
    }

    // 4. Pick the winner
    const bestRider = candidates[0];

    // 5. Generate OTP and Assign
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    booking.riderId = bestRider._id;
    booking.bookingStatus = "assigned";
    booking.assignmentStatus = "rider_selected";
    booking.rideOTP = otp;
    
    await booking.save();

    // 6. Real-time Notifications
    try {
        const { 
            notifyTouristRiderAssigned, 
            notifyRiderAssigned 
        } = await import("../../../core/socket.events.js");

        notifyTouristRiderAssigned(booking, bestRider);
        notifyRiderAssigned(booking, bestRider._id);
    } catch (err) {
        console.error("Auto-assign socket notification error:", err.message);
    }

    // 7. Update/Create Conversation
    await Conversation.findOneAndUpdate(
        { bookingId: booking._id },
        { 
            bookingId: booking._id,
            touristId: booking.touristId._id,
            riderId: bestRider._id
        },
        { upsert: true, new: true }
    );

    return { booking, assignedRider: bestRider };
};




export const getSettingsService = async () => {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ autoAssign: false });
    return settings;
};

export const toggleAutoAssignService = async () => {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ autoAssign: false });
    settings.autoAssign = !settings.autoAssign;
    await settings.save();
    return settings;
};

