import Booking from "../../../models/tourist/Booking.js";
import Rider from "../../../models/rider/Rider.js";
import Admin from "../../../models/admin/Admin.js";
import { notifyAdminRiderInterested, notifyRiderPaymentCompleted, notifyRideTrackingUpdated } from "../../../core/socket.events.js";
import Settings from "../../../models/admin/Setting.js";
import { autoAssignRiderService } from "../../admin/bookings/bookings.service.js";
import razorpay from "../../../config/razorpay.js";
import User from "../../../models/tourist/User.js";
import PlatformConfig from "../../../models/admin/PlatformConfig.js";

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

    const bookingExpiryCutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const query = {
        bookingStatus: "searching",
        vehicleType: rider.vehicleType,
        createdAt: { $gte: bookingExpiryCutoff },

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
        if (settings?.autoAssign && booking.interestedRiders.length >= 1) {
            console.log("Auto-assign triggered: 1st rider interested.");
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
    if (!booking.tracking) booking.tracking = {};
    if (!booking.endRideOTP) {
        booking.endRideOTP = Math.floor(1000 + Math.random() * 9000).toString();
    }
    booking.tracking.endOtpVerified = false;
    booking.tracking.endOtpVerifiedAt = null;
    booking.tracking.currentStage = "trip_started";
    booking.tracking.stages.push({
        stage: "trip_started",
        timestamp: new Date()
    });
    
    await booking.save();
    
    // Notify tracking
    notifyRideTrackingUpdated(booking);
    
    return booking;
};

export const verifyEndRideOtpService = async (riderId, bookingId, enteredOtp) => {
    const booking = await Booking.findOne({ _id: bookingId, riderId });
    if (!booking) throw new Error("Booking not found or not assigned to you.");
    if (booking.bookingStatus !== "ongoing") throw new Error("Ride must be ongoing before end OTP verification.");

    const completedStops = booking.tracking?.completedStops || [];
    const totalStops = booking.stops?.length || 0;
    if (totalStops > 0 && completedStops.length < totalStops) {
        throw new Error("Complete all stops before verifying the end OTP.");
    }

    if (!enteredOtp) throw new Error("End OTP is required to complete the ride.");
    if (booking.endRideOTP !== enteredOtp) {
        throw new Error("Invalid end OTP. Please ask tourist to recheck.");
    }

    if (!booking.tracking) booking.tracking = {};
    booking.tracking.endOtpVerified = true;
    booking.tracking.endOtpVerifiedAt = new Date();
    await booking.save();

    notifyRideTrackingUpdated(booking);

    return booking;
};

// Complete the ride




export const completeRideService = async (riderId, bookingId) => {
    const booking = await Booking.findOne({ _id: bookingId, riderId })
        .populate("touristId", "name phone");

    if (!booking) throw new Error("Booking not found or not assigned to you.");

    const completedStops = booking.tracking?.completedStops || [];
    const totalStops = booking.stops?.length || 0;
    if (totalStops > 0 && completedStops.length < totalStops) {
        throw new Error("Complete all stops before completing the ride.");
    }

    if (!booking.tracking?.endOtpVerified) {
        throw new Error("Please verify the end OTP from tourist before completing the ride.");
    }

   if (
    booking.bookingStatus !== "ongoing" &&
    booking.bookingStatus !== "completed"
)throw new Error("Only ongoing rides can be completed.");

    const total = booking.pricing?.totalAmount || 0;
    const advance = booking.pricing?.advanceAmount || 0;
    const remaining = Math.max(total - advance, 0);
    // ✅ If already completed and unpaid,
// return existing payment link instead of creating new one

if (
    booking.bookingStatus === "completed" &&
    booking.payment?.remainingOrderId &&
    booking.payment?.status !== "paid"
) {

    const existingPaymentLink = await razorpay.paymentLink.fetch(
        booking.payment.remainingOrderId
    );

    return {
        booking,
        paymentLink: existingPaymentLink.short_url,
        paymentLinkId: existingPaymentLink.id,
        remainingAmount: booking.payment.remainingAmount || remaining
    };
}

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
        await User.findByIdAndUpdate(
    booking.touristId,
    {
        $inc: { tripsCount: 1 }
    }
);
        await creditRiderWallet(riderId, booking); // 💰 Add to wallet
    }

    // Instantly mark the ride as completed
    booking.bookingStatus = "completed";
    
    if (!booking.tracking) booking.tracking = {};
    booking.tracking.currentStage = "completed";
    booking.tracking.stages.push({
        stage: "completed",
        timestamp: new Date()
    });

    await booking.save();
    
    // Notify tracking
    notifyRideTrackingUpdated(booking);

    return { booking, paymentLink, paymentLinkId, remainingAmount: remaining };
};

export const updateTrackingService = async (riderId, bookingId, { stage, lat, lng, stopId }) => {
    const booking = await Booking.findOne({ _id: bookingId, riderId });
    if (!booking) throw new Error("Booking not found or not assigned to you.");

    if (!booking.tracking) booking.tracking = {};
    if (!booking.tracking.stages) booking.tracking.stages = [];
    if (!booking.tracking.completedStops) booking.tracking.completedStops = [];
    
    // Prevent pushing duplicate stages (unless it's a different stop)
    const isDuplicate = booking.tracking.currentStage === stage && 
                        (booking.tracking.stages.length > 0 && 
                         booking.tracking.stages[booking.tracking.stages.length - 1].stopId?.toString() === stopId?.toString());

    if (!isDuplicate) {
        booking.tracking.currentStage = stage;
        booking.tracking.stages.push({
            stage,
            lat,
            lng,
            stopId,
            timestamp: new Date()
        });

        if (stage === "completed_stop") {
            if (stopId && !booking.tracking.completedStops.includes(stopId)) {
                booking.tracking.completedStops.push(stopId);
            }
        }

        await booking.save();
        
        // Emit socket event for tracking
        notifyRideTrackingUpdated(booking);
    }
    
    return booking;
};

export const verifyAndCompleteRideService = async (riderId, bookingId) => {
    const booking = await Booking.findOne({ _id: bookingId, riderId });
    if (!booking) throw new Error("Booking not found.");

    // If payment is already 100% paid, no need to verify again
    if (booking.payment.status === "paid") return booking;

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
        await User.findByIdAndUpdate(
    booking.touristId,
    {
        $inc: { tripsCount: 1 }
    }
);
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
        .select("city date startTime durationType pickupLocation stops language genderPreference touristId pricing.totalAmount pricing.serviceFee pricing.guideServiceFee bookingStatus rideOTP endRideOTP payment.status payment.remainingAmount createdAt interestedRiders rejectedRiders expiresAt tracking")
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

    if (booking.bookingStatus === "ongoing" && !booking.endRideOTP) {
        booking.endRideOTP = Math.floor(1000 + Math.random() * 9000).toString();
        await booking.save();
    }

    return booking;
};

export const cancelBookingService = async (riderId, bookingId, reason) => {
    const booking = await Booking.findOne({ riderId: riderId, _id: bookingId });

    if (!booking) {
        throw new Error("Booking not found.");
    }

    // Prevents proceeding if ride has already started or finished
    if (["ongoing", "completed"].includes(booking.bookingStatus)) {
        throw new Error(`Cannot cancel an ${booking.bookingStatus} ride.`);
    }

    if (booking.bookingStatus === "cancelled") {
        throw new Error("Booking is already cancelled.");
    }

    // ── Cancellation charge calculation (Rider) ──────────────────────────
    const config = await PlatformConfig.findOne();
    const policy = config?.CANCELLATION_POLICY || {};
    const freeCancelPercent = policy.FREE_CANCEL_PERCENT           ?? 0.30;
    const chargePercent     = policy.RIDER_CANCEL_CHARGE_PERCENT   ?? 0.03;

    // Build ride start datetime from booking.date + booking.startTime
    let rideStart = null;
    try {
        const [h, m] = (booking.startTime || "00:00").split(":").map(Number);
        rideStart = new Date(booking.date);
        rideStart.setHours(h, m, 0, 0);
    } catch (_) {}

    // Gap is measured from assignedAt → ride start (falls back to createdAt if missing)
    const assignedAt = booking.assignedAt || booking.createdAt;
    const now = new Date();

    let riderPenalty = 0;

    if (rideStart && assignedAt && rideStart > assignedAt) {
        const totalGapMs   = rideStart.getTime() - assignedAt.getTime();
        const freeWindowMs = totalGapMs * freeCancelPercent;
        const freeDeadline = new Date(assignedAt.getTime() + freeWindowMs);

        if (now > freeDeadline) {
            // After free window — apply 3% penalty on rider wallet
            const totalAmount = booking.pricing?.totalAmount || 0;
            riderPenalty = Math.round(totalAmount * chargePercent);

            // Deduct from rider wallet — wallet CAN go negative, auto-recovers on next earning
            await Rider.findByIdAndUpdate(riderId, {
                $inc: { walletBalance: -riderPenalty }
            });
        }
    }

    // Tourist ALWAYS gets full advance refunded when rider cancels (rider's fault)
    const refundAmount = booking.pricing?.advanceAmount || 0;

    booking.bookingStatus      = "cancelled";
    booking.cancellationReason = reason || "Not specified";
    booking.cancelledBy        = "rider";
    booking.cancellation = {
        chargePercent,
        chargeAmount:  0,          // tourist is not charged when rider cancels
        refundAmount,              // tourist gets full advance back
        riderPenalty,
        refundStatus:  refundAmount > 0 ? "pending" : "not_applicable",
        cancelledAt:   now
    };

    await booking.save();

    return {
        booking,
        cancellation: {
            isFree:       riderPenalty === 0,
            riderPenalty,
            refundAmount,
            note: riderPenalty === 0
                ? "Cancelled within free window — no penalty applied. Tourist will receive full refund."
                : `₹${riderPenalty} penalty deducted from your wallet. Tourist will receive full ₹${refundAmount} refund.`
        }
    };
};
