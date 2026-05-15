import Booking from "../../../models/tourist/Booking.js";
import Rider from "../../../models/rider/Rider.js";
import Admin from "../../../models/admin/Admin.js";
import { notifyAdminRiderInterested, notifyRiderPaymentCompleted } from "../../../core/socket.events.js";
import Settings from "../../../models/admin/Setting.js";
import { autoAssignRiderService } from "../../admin/bookings/bookings.service.js";
import razorpay from "../../../config/razorpay.js";


// Get all pending bookings matching rider's city & language
export const getPendingBookingsForRider = async (riderId) => {
    const rider = await Rider.findById(riderId);

    if (!rider) {
        throw new Error("Rider not found.");
    }

    // Only approved riders can see bookings
    if (rider.verificationStatus !== "approved") {
        return [];
    }

    const query = {
        bookingStatus: "searching",
        vehicleType: rider.vehicleType,

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
    } else if (rider.gender === "Female") {
        query.genderPreference = {
            $ne: "Male guide preferred",
        };
    }

    console.log("Rider:", rider.name);
    console.log("Query:", query);

    const bookings = await Booking.find(query)
        .populate("touristId", "name phone profileImage")
        .select("city date startTime durationType pickupLocation stops language genderPreference touristId pricing.totalAmount pricing.serviceFee pricing.guideServiceFee createdAt bookingStatus interestedRiders rejectedRiders expiresAt")
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

    // 🔥 GET RIDER (THIS WAS MISSING)
    const rider = await Rider.findById(riderId);
    if (!rider) throw new Error("Rider not found.");

    booking.interestedRiders.push({ riderId, interestedAt: new Date() });
    await booking.save();

    console.log("🚀 EMITTING ADMIN EVENT");

    // ✅ EMIT TO ADMIN
    notifyAdminRiderInterested(booking, rider);

    // --- NEW: Automatic Best-Match Trigger ---
    try {
        const settings = await Settings.findOne();
        if (settings?.autoAssign && booking.interestedRiders.length >= 2) {
            console.log("Auto-assign triggered: 2 riders interested.");
            await autoAssignRiderService(bookingId);
        }
    } catch (err) {
        console.error("Auto-assign background error:", err.message);
    }

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

// Start the ride with OTP verification
export const startRideService = async (riderId, bookingId, enteredOtp) => {
    const booking = await Booking.findOne({ _id: bookingId, riderId });
    if (!booking) throw new Error("Booking not found or not assigned to you.");
    if (booking.bookingStatus !== "assigned") throw new Error("Booking must be assigned to start.");


    // Verify OTP
    if (booking.rideOTP !== enteredOtp) {
        throw new Error("Invalid OTP. Please ask the tourist for the correct code.");
    }

    booking.bookingStatus = "ongoing";
    await booking.save();
    return booking;
};

// Complete the ride




export const completeRideService = async (riderId, bookingId) => {
    const booking = await Booking.findOne({ _id: bookingId, riderId })
        .populate("touristId", "name phone");
    
    if (!booking) throw new Error("Booking not found or not assigned to you.");
    if (booking.bookingStatus !== "ongoing") throw new Error("Only ongoing rides can be completed.");

    const total = booking.pricing?.totalAmount || 0;
    const advance = booking.pricing?.advanceAmount || 0;
    const remaining = Math.max(total - advance, 0);

    console.log(`[PAYMENT_DEBUG] Booking: ${bookingId}, Total: ${total}, Advance: ${advance}, Remaining: ${remaining}`);

    let paymentLink = null;
    let paymentLinkId = null;

    if (remaining > 0) {
        const response = await razorpay.paymentLink.create({
            amount: Math.round(remaining * 100),
            currency: "INR",
            description: `Trip remaining fare`,
            customer: {
                name: booking.touristId?.name || "Tourist",
                contact: booking.touristId?.phone || ""
            },
            notify: { sms: false, email: false },
            reminder_enable: false,
            notes: {
                bookingId: bookingId.toString()
            }
        });

        paymentLink = response.short_url;
        paymentLinkId = response.id;

        booking.payment.remainingOrderId = paymentLinkId;
        booking.payment.remainingAmount = remaining;
    } else {
        booking.bookingStatus = "completed";
        await creditRiderWallet(riderId, booking); // 💰 Add to wallet
    }

    await booking.save();

    return { booking, paymentLink, paymentLinkId, remainingAmount: remaining };
};

export const verifyAndCompleteRideService = async (riderId, bookingId) => {
    const booking = await Booking.findOne({ _id: bookingId, riderId });
    if (!booking) throw new Error("Booking not found.");

    if (booking.bookingStatus === "completed") return booking;

    const paymentLinkId = booking.payment.remainingOrderId;

    
    // If no payment link exists, it means remaining was 0, so just complete it
    if (!paymentLinkId) {
        booking.bookingStatus = "completed";
        await booking.save();
        await creditRiderWallet(riderId, booking);
        return booking;
    }

    // Verify with Razorpay
    const paymentLink = await razorpay.paymentLink.fetch(paymentLinkId);

    if (paymentLink.status === 'paid') {
        const finalAmount = booking.payment.remainingAmount || 0;
        
        booking.bookingStatus = "completed";
        booking.payment.status = "paid"; // Final 100% status
        booking.payment.amountPaid = (booking.payment.amountPaid || 0) + finalAmount;
        booking.payment.remainingAmount = 0; // Clear remaining amount
        booking.payment.paidAt = new Date();

        // Record transaction
        booking.transactions.push({
            transactionId: paymentLink.id,
            amount: finalAmount,
            method: "Net Banking", // Or dynamic if available
            paymentType: "final",
            status: "success",
            paidAt: new Date()
        });

        await booking.save();
        
        await creditRiderWallet(riderId, booking); // 💰 Add to wallet
        
         // ✅ SOCKET EMIT TO RIDER
    notifyRiderPaymentCompleted(booking, riderId);
        return booking;
    } else {
        throw new Error("Payment is not yet completed by the tourist.");
    }
};

const creditRiderWallet = async (riderId, booking) => {
    try {
        console.log(`[CREDIT_WALLET_START] Processing for Rider: ${riderId}, Booking: ${booking._id}`);
        
        const total = booking.pricing?.totalAmount || 0;
        const platformFee = booking.pricing?.serviceFee || 0;
        const riderEarning = total - platformFee;

        console.log(`[CREDIT_WALLET_CALC] Total: ${total}, PlatformFee: ${platformFee}, RiderEarning: ${riderEarning}`);

        if (riderEarning > 0) {
            const updatedRider = await Rider.findByIdAndUpdate(riderId, {
                $inc: { walletBalance: riderEarning, totalEarnings: riderEarning }
            }, { new: true });
            console.log(`💰 Credited ₹${riderEarning} to rider ${riderId} wallet. New walletBalance: ${updatedRider?.walletBalance}`);
        } else {
            console.log(`⚠️ Rider earning is 0 or less, skipping wallet credit.`);
        }

        if (platformFee > 0) {
            const adminResult = await Admin.updateMany({ role: "admin" }, {
                $inc: { totalEarnings: platformFee }
            });
            console.log(`💰 Credited ₹${platformFee} platform fee to Admin. Modified docs: ${adminResult.modifiedCount}`);
        } else {
            console.log(`⚠️ Platform fee is 0 or less, skipping admin credit.`);
        }
    } catch (err) {
        console.error(`[CREDIT_WALLET_ERROR] Failed to credit wallet:`, err);
    }
};


// Get all bookings assigned to this rider (Assigned, Ongoing, Completed)
export const getMyBookingsService = async (riderId) => {
    const bookings = await Booking.find({ riderId })
        .populate("touristId", "name phone profileImage")
        .select("city date startTime durationType pickupLocation stops language genderPreference touristId pricing.totalAmount pricing.serviceFee pricing.guideServiceFee bookingStatus rideOTP payment.status payment.remainingAmount createdAt interestedRiders rejectedRiders expiresAt")
        .sort({ createdAt: -1 });
    return bookings;
};

export const getBookingByIdService = async (bookingId, riderId) => {
    const booking = await Booking.findOne({ _id: bookingId, riderId })
        .populate("touristId", "name phone profileImage")
        .select("-interestedRiders -rejectedRiders");

    if (!booking) {
        throw new Error("Booking not found or you are not authorized to view it.");
    }
    return booking;


};
