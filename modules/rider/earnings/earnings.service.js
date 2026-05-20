import Booking from "../../../models/tourist/Booking.js";
import Rider from "../../../models/rider/Rider.js";

export const getRiderEarningsService = async (riderId) => {
    const rider = await Rider.findById(riderId);
    if (!rider) throw new Error("Rider not found");

    // All completed bookings for this rider
    const completedBookings = await Booking.find({
        riderId,
        bookingStatus: "completed"
    })
    .populate("touristId", "name phone profileImage")
    .sort({ updatedAt: -1 });

    // ── 1. TOTALS ──────────────────────────────────
    const totals = completedBookings.reduce((acc, b) => {
        const total = b.pricing?.totalAmount || 0;
        const platformFee = b.pricing?.serviceFee || 0;
        const riderEarning = total - platformFee;

        acc.totalEarnings += riderEarning;
        acc.totalPlatformFee += platformFee;
        acc.totalRides += 1;
        return acc;
    }, { totalEarnings: 0, totalPlatformFee: 0, totalRides: 0 });

    totals.avgPerTrip = totals.totalRides > 0
        ? Math.round(totals.totalEarnings / totals.totalRides)
        : 0; 

    // ── 2. THIS WEEK EARNINGS ──────────────────────
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeek = completedBookings
        .filter(b => new Date(b.updatedAt) >= startOfWeek)
        .reduce((sum, b) => sum + ((b.pricing?.totalAmount || 0) - (b.pricing?.serviceFee || 0)), 0);

    // ── 3. TODAY EARNINGS ──────────────────────────
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const today = completedBookings
        .filter(b => new Date(b.updatedAt) >= startOfToday)
        .reduce((sum, b) => sum + ((b.pricing?.totalAmount || 0) - (b.pricing?.serviceFee || 0)), 0);

    // ── 4. DAILY BREAKDOWN (Last 7 days) ──────────
    const dailyBreakdown = [];
    for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);
        day.setHours(0, 0, 0, 0);

        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);

        const dayBookings = completedBookings.filter(b => {
            const d = new Date(b.updatedAt);
            return d >= day && d < nextDay;
        });

        const dayEarnings = dayBookings.reduce(
            (sum, b) => sum + ((b.pricing?.totalAmount || 0) - (b.pricing?.serviceFee || 0)), 0
        );

        dailyBreakdown.push({
            date: day.toISOString().split('T')[0],
            day: day.toLocaleDateString('en', { weekday: 'short' }),
            rides: dayBookings.length,
            earnings: dayEarnings
        });
    }

    // ── 5. LATEST TRANSACTIONS (Last 15) ──────────
    const latestTransactions = completedBookings.slice(0, 15).map(b => ({
        _id: b._id,
        type: "ride",
        title: `Trip - ${b.city}`,
        date: b.updatedAt,
        tourist: b.touristId?.name || "Tourist",
        amount: (b.pricing?.totalAmount || 0) - (b.pricing?.serviceFee || 0),
        totalAmount: b.pricing?.totalAmount || 0,
        platformFee: b.pricing?.serviceFee || 0,
        status: b.payment?.status || "paid"
    }));

    // ── 6. QUICK INSIGHTS ──────────────────────────
    // Peak day
    const peakDay = dailyBreakdown.reduce(
        (max, d) => d.earnings > max.earnings ? d : max,
        { day: '-', earnings: 0 }
    );

    // Top city
    const cityMap = {};
    completedBookings.forEach(b => {
        const city = b.city || 'Unknown';
        const earning = (b.pricing?.totalAmount || 0) - (b.pricing?.serviceFee || 0);
        cityMap[city] = (cityMap[city] || 0) + earning;
    });
    const topCity = Object.entries(cityMap).sort((a, b) => b[1] - a[1])[0];

    // Top language
    const langMap = {};
    completedBookings.forEach(b => {
        const lang = b.language || 'English';
        langMap[lang] = (langMap[lang] || 0) + 1;
    });
    const topLanguage = Object.entries(langMap).sort((a, b) => b[1] - a[1])[0];

    return {
        overview: {
            totalEarnings: totals.totalEarnings,
            thisWeek,
            today,
            avgPerTrip: totals.avgPerTrip,
            totalRides: totals.totalRides,
            rating: rider.rating || 0,
            acceptanceRate: 92, // placeholder or calculate from interested/rejected
            walletBalance: rider.walletBalance || 0,
            pendingWithdrawal: rider.pendingWithdrawal || 0,
            availableBalance: (rider.walletBalance || 0) - (rider.pendingWithdrawal || 0)
        },
        dailyBreakdown,
        latestTransactions,
        quickInsights: {
            peakDay: peakDay.day,
            peakHour: "3pm-6pm", // Can calculate from startTime later
            topCity: topCity ? topCity[0] : "-",
            topLanguage: topLanguage ? topLanguage[0] : "-"
        }
    };
};

export const insertRiderEarning = async (booking) => {
    const rider = await Rider.findById(booking.riderId);
    if (!rider) throw new Error("Rider not found");

    const earning = {
        riderId: booking.riderId,
        bookingId: booking._id,
        amount: booking.pricing?.totalAmount || 0,
        platformFee: booking.pricing?.serviceFee || 0,
        totalAmount: booking.pricing?.totalAmount || 0,
        payment: booking.payment || {},
        status: booking.payment?.status || "paid"
    };

    rider.earnings.push(earning);
    await rider.save();

    return earning;
}
