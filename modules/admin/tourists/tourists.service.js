import User from "../../../models/tourist/User.js";
import Booking from "../../../models/tourist/Booking.js";

// GET ALL TOURISTS
export const getAllTouristsService = async (query) => {
    const filter = {};

    // optional filters
    if (query.profileCompleted !== undefined) {
        filter.profileCompleted = query.profileCompleted === "true";
    }

    return await User.find(filter).sort({ createdAt: -1 });
};

// GET PENDING TOURISTS
export const getPendingTouristsService = async () => {
    return await User.find({ profileCompleted: false }).sort({ createdAt: -1 });
};

// GET BY ID
export const getTouristByIdService = async (id) => {
    return await User.findById(id);
};

// UPDATE TOURIST
export const updateTouristService = async (id, data) => {
    return await User.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
    );
};

// DELETE TOURIST
export const deleteTouristService = async (id) => {
    return await User.findByIdAndDelete(id);
};

export const getTouristBookingHistoryService = async (touristId) => {

  // CHECK TOURIST
  const tourist = await User.findById(touristId);

  if (!tourist) {
    throw new Error("Tourist not found");
  }

  // GET ALL BOOKINGS
  const bookings = await Booking.find({
    touristId
  })
    .populate(
      "riderId",
      "name phone profileImage vehicleType vehicleNumber rating"
    )
    .sort({ createdAt: -1 });

  // SUMMARY
  let totalSpent = 0;
  let totalBookings = bookings.length;
  let completedBookings = 0;
  let cancelledBookings = 0;

  bookings.forEach((booking) => {

    totalSpent += booking.payment?.amountPaid || 0;

    if (booking.bookingStatus === "completed") {
      completedBookings++;
    }

    if (booking.bookingStatus === "cancelled") {
      cancelledBookings++;
    }

  });

  return {
    tourist: {
      _id: tourist._id,
      name: tourist.name,
      phone: tourist.phone,
      email: tourist.email,
      nationality: tourist.nationality,
      profileImage: tourist.profileImage,
      walletBalance: tourist.walletBalance,
      tripsCount: tourist.tripsCount
    },

    summary: {
      totalBookings,
      totalSpent,
      completedBookings,
      cancelledBookings
    },

    bookings
  };
};