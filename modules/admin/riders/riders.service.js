import Rider from "../../../models/rider/Rider.js";
import Booking from "../../../models/tourist/Booking.js";
import mongoose from "mongoose";

export const getAllRidersService = async (status) => {
    const query = status ? { verificationStatus: status } : {};
    return await Rider.find(query).sort({ createdAt: -1 });
};

export const updateRiderStatusService = async (id, status) => {
    return await Rider.findByIdAndUpdate(
        id, 
        { verificationStatus: status, isVerified: status === "approved" }, 
        { new: true }
    );
};

export const getPendingRidersService = async () => {
    return await Rider.find({ 
        isVerified: false
    }).sort({ createdAt: -1 });
};

export const deleteRiderService = async (id) => {
    return await Rider.findByIdAndDelete(id);
};

export const getRiderCompleteHistoryService = async (riderId) => {

  // VALID OBJECT ID
  if (!mongoose.Types.ObjectId.isValid(riderId)) {
    throw new Error("Invalid rider id");
  }

  // FIND RIDER
  const rider = await Rider.findById(riderId);

  if (!rider) {
    throw new Error("Rider not found");
  }

  // GET ALL BOOKINGS OF RIDER
  const bookings = await Booking.find({
    riderId
  })

    .populate(
      "touristId",
      "name phone email nationality profileImage"
    )

    .sort({ createdAt: -1 });



  // SUMMARY
  let totalBookings = bookings.length;

  let totalEarnings = 0;

  let completedRides = 0;

  let cancelledRides = 0;

  let ongoingRides = 0;

  let pendingRides = 0;



  bookings.forEach((booking) => {

    // EARNINGS
    totalEarnings += booking.pricing?.rideFee || 0;

    // STATUS COUNTS
    if (booking.bookingStatus === "completed") {
      completedRides++;
    }

    if (booking.bookingStatus === "cancelled") {
      cancelledRides++;
    }

    if (booking.bookingStatus === "ongoing") {
      ongoingRides++;
    }

    if (booking.bookingStatus === "pending") {
      pendingRides++;
    }

  });



  return {

    rider: {

      _id: rider._id,

      name: rider.name,

      phone: rider.phone,

      email: rider.email,

      city: rider.city,

      gender: rider.gender,

      profileImage: rider.profileImage,



      vehicleType: rider.vehicleType,

      vehicleModel: rider.vehicleModel,

      vehicleNumber: rider.vehicleNumber,



      languages: rider.languages,

      expertise: rider.expertise,



      bio: rider.bio,



      rating: rider.rating,

      totalRides: rider.totalRides,



      walletBalance: rider.walletBalance,

      pendingWithdrawal: rider.pendingWithdrawal,

      totalEarnings: rider.totalEarnings,



      isOnline: rider.isOnline,

      isVerified: rider.isVerified,

      verificationStatus: rider.verificationStatus,



      createdAt: rider.createdAt

    },



    summary: {

      totalBookings,

      totalEarnings,

      completedRides,

      cancelledRides,

      ongoingRides,

      pendingRides

    },



    bookings

  };

};