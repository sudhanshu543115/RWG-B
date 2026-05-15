import Booking from "../../../models/tourist/Booking.js";
import Rider from "../../../models/rider/Rider.js";

export const getRiderStatsService = async (riderId) => {
    const rider = await Rider.findById(riderId);
    if (!rider) throw new Error("Rider not found");

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Prepare queries
    const todayCompletedQuery = {
        riderId,
        bookingStatus: "completed",
        updatedAt: { $gte: startOfToday }
    };

    const newRequestsQuery = {
        bookingStatus: "searching",
        vehicleType: rider.vehicleType,
        city: { $regex: rider.city.trim(), $options: "i" },
        $or: [{ riderId: null }, { riderId: { $exists: false } }],
        rejectedRiders: { $nin: [rider._id] },
        "interestedRiders.riderId": { $nin: [rider._id] }
    };

    if (rider.languages && rider.languages.length > 0) {
        newRequestsQuery.language = {
            $in: rider.languages.map(lang => new RegExp(lang.trim(), "i")),
        };
    }

    if (rider.gender === "Male") {
        newRequestsQuery.genderPreference = { $ne: "Female guide preferred" };
    } else if (rider.gender === "Female") {
        newRequestsQuery.genderPreference = { $ne: "Male guide preferred" };
    }

    // Run all queries in parallel
    const [
        todayCompletedBookings,
        totalTrips,
        newRequestsCount,
        newRequests
    ] = await Promise.all([
        Booking.find(todayCompletedQuery).populate("touristId", "name phone profileImage"),
        Booking.countDocuments({ riderId, bookingStatus: "completed" }),
        Booking.countDocuments(newRequestsQuery),
        Booking.find(newRequestsQuery)
            .populate("touristId", "name phone profileImage")
            .sort({ createdAt: -1 })
            .limit(10)
    ]);

    // Calculate today's earnings
    const todayEarnings = todayCompletedBookings.reduce((sum, b) => {
        const total = b.pricing?.totalAmount || 0;
        const platformFee = b.pricing?.serviceFee || 0;
        return sum + (total - platformFee);
    }, 0);

    // Prepare live earnings breakdown
    const liveEarnings = todayCompletedBookings.map(b => ({
        id: b._id,
        amount: (b.pricing?.totalAmount || 0) - (b.pricing?.serviceFee || 0),
        time: b.updatedAt,
        touristName: b.touristId?.name || "Tourist",
        city: b.city
    })).sort((a, b) => b.time - a.time);

    return {
        todayEarnings,
        totalTrips,
        rating: rider.rating || 5.0,
        newRequestsCount,
        newRequests,
        liveEarnings
    };
};
