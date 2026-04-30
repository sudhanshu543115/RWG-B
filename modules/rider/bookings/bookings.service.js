import Booking from "../../../models/tourist/Booking.js";
import Rider from "../../../models/rider/Rider.js";

// Get all pending bookings matching rider's city & language
export const getPendingBookingsForRider = async (riderId) => {
  const rider = await Rider.findById(riderId);

  if (!rider) {
    throw new Error("Rider not found.");
  }

  // only approved rider
  if (rider.verificationStatus !== "approved") {
    return [];
  }

  const query = {
    bookingStatus: "searching",

    // city match (case insensitive)
    city: {
      $regex: rider.city.trim(),
      $options: "i",
    },

    // booking not accepted yet
    $or: [
      { riderId: null },
      { riderId: { $exists: false } },
    ],

    // rejected rider not included
    rejectedRiders: {
      $nin: [rider._id],
    },
  };

  // multiple languages match
  if (rider.languages && rider.languages.length > 0) {
    query.language = {
      $in: rider.languages.map(
        (lang) => new RegExp(lang.trim(), "i")
      ),
    };
  }

  // gender preference filter
  if (rider.gender === "Male") {
    query.genderPreference = {
      $ne: "Female guide preferred",
    };
  }

  if (rider.gender === "Female") {
    query.genderPreference = {
      $ne: "Male guide preferred",
    };
  }

  console.log("Rider:", rider.name);
  console.log("Query:", query);

  const bookings = await Booking.find(query)
    .populate("touristId", "name phone")
    .sort({ createdAt: -1 });

    const bookings = await Booking.find(query)
        .populate("touristId", "name phone profileImage")
        .select("-pricing -payment.transactionId -payment.amountPaid -payment.paidAt")
        .sort({ createdAt: -1 });
  console.log("Bookings Found:", bookings.length);

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

// Get all bookings assigned to this rider (Assigned, Ongoing, Completed)
export const getMyBookingsService = async (riderId) => {
    const bookings = await Booking.find({ riderId })
        .populate("touristId", "name phone profileImage")
        .select("-pricing -payment.transactionId -payment.amountPaid -payment.paidAt")
        .sort({ updatedAt: -1 });
    return bookings;
};
