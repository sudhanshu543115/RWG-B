// modules/admin/earnings/earnings.service.js
import Booking from "../../../models/tourist/Booking.js";

export const getAdminEarningsService = async () => {
    const completedBookings = await Booking.find({ bookingStatus: "completed" }).populate('riderId');

    const stats = completedBookings.reduce((acc, booking) => {
        const total = booking.pricing?.totalAmount || 0;
        const platformCut = booking.pricing?.serviceFee || 0;
        const riderShare = total - platformCut;
        const city = booking.city || "Unknown";
        const date = new Date(booking.date || booking.createdAt);
        const month = date.toLocaleString('default', { month: 'short' });

        // Basic Totals
        acc.totalRevenue += total;
        acc.totalPlatformFee += platformCut;
        acc.totalRiderEarnings += riderShare;
        acc.rideCount += 1;

        // Monthly Trends
        if (!acc.monthlyTrends[month]) acc.monthlyTrends[month] = { month, revenue: 0, bookings: 0 };
        acc.monthlyTrends[month].revenue += total;
        acc.monthlyTrends[month].bookings += 1;

        // City Stats
        if (!acc.cityStats[city]) acc.cityStats[city] = { city, revenue: 0, bookings: 0, riders: new Set() };
        acc.cityStats[city].revenue += total;
        acc.cityStats[city].bookings += 1;
        if (booking.riderId) acc.cityStats[city].riders.add(booking.riderId._id.toString());
        
        return acc;
    }, {
        totalRevenue: 0,
        totalPlatformFee: 0,
        totalRiderEarnings: 0,
        rideCount: 0,
        monthlyTrends: {},
        cityStats: {}
    });

    // Format Monthly Trends for Chart (Include all 12 months for a better UI look)
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlyTrends = monthOrder.map(m => ({
        month: m,
        revenue: stats.monthlyTrends[m]?.revenue || 0,
        bookings: stats.monthlyTrends[m]?.bookings || 0
    }));

    // Format City Stats for Chart
    const formattedCityStats = Object.values(stats.cityStats).map(c => ({
        ...c,
        riders: c.riders.size
    })).sort((a, b) => b.revenue - a.revenue);

    return {
        stats: {
            totalRevenue: stats.totalRevenue,
            totalPlatformFee: stats.totalPlatformFee,
            totalRiderEarnings: stats.totalRiderEarnings,
            rideCount: stats.rideCount,
            avgPerBooking: stats.rideCount > 0 ? Math.round(stats.totalRevenue / stats.rideCount) : 0
        },
        monthlyTrends: formattedMonthlyTrends,
        cityStats: formattedCityStats,
        recentTransactions: completedBookings.slice(-10).reverse()
    };
};
