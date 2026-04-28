import Booking from "../../../models/tourist/Booking.js";
import User from "../../../models/tourist/User.js";
import Rider from "../../../models/rider/Rider.js";
import Settings from "../../../models/admin/Setting.js";


export const getAllBookings = async () => {
    const bookings = await Booking.find().populate("touristId").populate("riderId");
    return bookings;
}


export const getBookingById = async (id) => {
    const booking = await Booking.findById(id).populate("touristId").populate("riderId");
    return booking;
}





export const deleteBooking = async (id) => {
    const booking = await Booking.findByIdAndDelete(id);
    return booking;
}


export const assignRiderToBooking = async (id, riderId) => {
    const booking = await Booking.findByIdAndUpdate(id, { riderId: riderId }, { new: true });
    return booking;
}


export const autoAssignRiderService = async (bookingId) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found.");
    if (booking.riderId) throw new Error("Rider already assigned to this booking.");

    // Find best matching rider: same city, speaks the language, verified, and not already busy
    const busyRiderIds = await Booking.find({
        status: { $in: ["confirmed", "ongoing"] },
        riderId: { $ne: null }
    }).distinct("riderId");

    const matchedRider = await Rider.findOne({
        city: { $regex: new RegExp(`^${booking.city}$`, "i") },
        languages: booking.language,
        isVerified: true,
        verificationStatus: "approved",
        profileCompleted: true,
        _id: { $nin: busyRiderIds }
    }).sort({ rating: -1, totalRides: -1 }); // Best rated first

    if (!matchedRider) throw new Error("No available rider found for this city and language.");

    booking.riderId = matchedRider._id;
    booking.status = "confirmed";
    await booking.save();

    return { booking, assignedRider: matchedRider };
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

