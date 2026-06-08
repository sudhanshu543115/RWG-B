import Booking from "../../../models/tourist/Booking.js";
import Rider from "../../../models/rider/Rider.js";
import User from "../../../models/tourist/User.js";

export const getOverviewStatsService = async () => {
    const [
        totalBookings,
        activeRiders,
        totalTourists,
        pendingApprovals,
        activeRidesNow,
        allBookings,
        riders
    ] = await Promise.all([
        Booking.countDocuments(),
        Rider.countDocuments({ isOnline: true }),
        User.countDocuments(),
        Rider.countDocuments({ verificationStatus: "pending" }),
        Booking.countDocuments({ bookingStatus: "ongoing" }),
        Booking.find().populate('riderId touristId'),
        Rider.find()
    ]);

    // Calculate Financials and Trends
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const stats = allBookings.reduce((acc, booking) => {
        const total = booking.payment?.amountPaid || 0;
        const platformCut = booking.pricing?.serviceFee || 0;
        const status = booking.bookingStatus;
        const bookingDate = new Date(booking.createdAt);
        const bookingMonth = bookingDate.getMonth();
        const bookingYear = bookingDate.getFullYear();
        
        // Basic stats
        if (status === "completed") {
            acc.totalRevenue += total;
            acc.totalPlatformFee += platformCut;
            acc.completedCount += 1;

            // Current vs Last Month Revenue
            if (bookingMonth === currentMonth && bookingYear === currentYear) {
                acc.currentMonthRevenue += total;
            } else if (bookingMonth === lastMonth && bookingYear === lastMonthYear) {
                acc.lastMonthRevenue += total;
            }
        }

        // Current vs Last Month Bookings
        if (bookingMonth === currentMonth && bookingYear === currentYear) {
            acc.currentMonthBookings += 1;
        } else if (bookingMonth === lastMonth && bookingYear === lastMonthYear) {
            acc.lastMonthBookings += 1;
        }

        // Booking Status Breakdown
        acc.statusBreakdown[status] = (acc.statusBreakdown[status] || 0) + 1;

        // Monthly Trends (Last 12 Months)
        const monthName = bookingDate.toLocaleString('default', { month: 'short' });
        if (!acc.monthlyTrends[monthName]) acc.monthlyTrends[monthName] = { month: monthName, revenue: 0, bookings: 0 };
        if (status === "completed") acc.monthlyTrends[monthName].revenue += total;
        acc.monthlyTrends[monthName].bookings += 1;

        // City Performance
        const city = booking.city || "Unknown";
        if (!acc.cityStats[city]) acc.cityStats[city] = { city, bookings: 0, riders: new Set(), revenue: 0 };
        acc.cityStats[city].bookings += 1;
        if (status === "completed") {
            acc.cityStats[city].revenue += total;
        }
        if (booking.riderId) acc.cityStats[city].riders.add(booking.riderId._id.toString());

        return acc;
    }, {
        totalRevenue: 0,
        totalPlatformFee: 0,
        completedCount: 0,
        currentMonthRevenue: 0,
        lastMonthRevenue: 0,
        currentMonthBookings: 0,
        lastMonthBookings: 0,
        statusBreakdown: {},
        monthlyTrends: {},
        cityStats: {}
    });

    // Comparison Helper
    const getChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return (((current - previous) / previous) * 100).toFixed(1);
    };

    // For Riders and Tourists, we can check their createdAt
    const currentMonthRiders = riders.filter(r => {
        const d = new Date(r.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
    const lastMonthRiders = riders.filter(r => {
        const d = new Date(r.createdAt);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    }).length;

    const tourists = await User.find();
    const currentMonthTourists = tourists.filter(t => {
        const d = new Date(t.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
    const lastMonthTourists = tourists.filter(t => {
        const d = new Date(t.createdAt);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    }).length;

    // Format Monthly Trends for Chart
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlyTrends = monthOrder.map(m => ({
        month: m,
        revenue: stats.monthlyTrends[m]?.revenue || 0,
        bookings: stats.monthlyTrends[m]?.bookings || 0
    }));

    // Format City Stats
    const formattedCityStats = Object.values(stats.cityStats).map(c => ({
        ...c,
        riders: c.riders.size
    })).sort((a, b) => b.bookings - a.bookings).slice(0, 5);

    // Platform Rating
    const avgRating = riders.length > 0 
        ? (riders.reduce((sum, r) => sum + (r.rating || 0), 0) / riders.length).toFixed(1)
        : "0.0";

    // Completion Rate
    const completionRate = totalBookings > 0 
        ? ((stats.completedCount / totalBookings) * 100).toFixed(1)
        : "0";

    // Recent Bookings
    const recentBookings = allBookings
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map(b => ({
            id: b._id,
            tourist: { name: b.touristId?.name || "Unknown" },
            rider: b.riderId?.name || "Unassigned",
            grossFare: b.pricing?.totalAmount || 0,
            status: b.bookingStatus,
            city: b.city || "Unknown",
            rideType: b.rideType || "Not specified",
            date: b.createdAt
        }));

    return {
        summary: {
            totalRevenue: {
                value: stats.totalRevenue,
                change: getChange(stats.currentMonthRevenue, stats.lastMonthRevenue)
            },
            totalBookings: {
                value: totalBookings,
                change: getChange(stats.currentMonthBookings, stats.lastMonthBookings)
            },
            activeRiders: {
                value: activeRiders,
                change: getChange(currentMonthRiders, lastMonthRiders)
            },
            totalTourists: {
                value: totalTourists,
                change: getChange(currentMonthTourists, lastMonthTourists)
            },
            pendingApprovals: pendingApprovals,
            activeRidesNow: activeRidesNow,
            avgPlatformRating: avgRating,
            completionRate: completionRate,
            totalPlatformFee: stats.totalPlatformFee
        },
        charts: {
            revenueAndBookings: formattedMonthlyTrends,
            bookingStatus: [
                { name: "Completed", value: stats.statusBreakdown["completed"] || 0, color: "#8b5cf6" },
                { name: "Confirmed", value: (stats.statusBreakdown["assigned"] || 0) + (stats.statusBreakdown["searching"] || 0), color: "#10b981" },
                { name: "In Progress", value: stats.statusBreakdown["ongoing"] || 0, color: "#06b6d4" },
                { name: "Cancelled", value: stats.statusBreakdown["cancelled"] || 0, color: "#f59e0b" }
            ],
            cityPerformance: formattedCityStats
        },
        recentBookings
    };
};
