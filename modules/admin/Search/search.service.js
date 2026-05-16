import Rider from "../../../models/rider/Rider.js";
import Booking from "../../../models/tourist/Booking.js";

export const searchService = async (query) => {
  // Search for Riders (Guides)
  const riders = await Rider.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { city: { $regex: query, $options: "i" } },
      { bio: { $regex: query, $options: "i" } }
    ]
  })
    .select("name city profileImage rating vehicleType")
    .limit(5);

  // Search for Bookings/Tours
  const bookings = await Booking.find({
    $or: [
      { city: { $regex: query, $options: "i" } },
      { "pickupLocation.address": { $regex: query, $options: "i" } },
      { specialRequest: { $regex: query, $options: "i" } }
    ]
  })
    .select("city pickupLocation date pricing status")
    .limit(5);

  return {
    riders,
    bookings
  };
};