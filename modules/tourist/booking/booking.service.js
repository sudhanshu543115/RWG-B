import Booking from "../../../models/tourist/Booking.js";
import Settings from "../../../models/admin/Setting.js";
import Rider from "../../../models/rider/Rider.js";
import PlatformConfig from "../../../models/admin/PlatformConfig.js";
import User from "../../../models/tourist/User.js";
import RefundRequest from "../../../models/tourist/RefundRequest.js";
import mongoose from "mongoose";

// Calculates distance between two points in KM
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

// Calculates total route distance (Pickup -> Stop 1 -> Stop 2 ...) with breakdown
const calculateRouteDistance = (pickup, stops = [], config = null) => {
  const roadFactor = config?.PRICING_CONFIG?.ROAD_FACTOR || 1.2;
  if (!stops || stops.length === 0) return { total: 0, segments: [] };
  
  let total = 0;
  let segments = [];
  let lastPoint = null;
  let lastLabel = "Pickup";

  if (pickup?.lat && pickup?.lng) {
    lastPoint = { lat: pickup.lat, lng: pickup.lng };
    lastLabel = "Pickup";
  } else {
    const firstStop = stops[0];
    const fLat = firstStop?.location?.lat || firstStop?.lat;
    const fLng = firstStop?.location?.lng || firstStop?.lng;
    if (fLat && fLng) {
      lastPoint = { lat: fLat, lng: fLng };
      lastLabel = firstStop.name;
    }
  }

  if (!lastPoint) return { total: 0, segments: [] };

  stops.forEach((stop, index) => {
    if (index === 0 && (!pickup?.lat || !pickup?.lng)) return;

    const stopLat = stop.location?.lat || stop.lat;
    const stopLng = stop.location?.lng || stop.lng;
    
    if (stopLat && stopLng) {
      const dist = calculateDistance(lastPoint.lat, lastPoint.lng, stopLat, stopLng);
      const roadDist = parseFloat((dist * roadFactor).toFixed(1)); 
      
      segments.push({
        from: lastLabel,
        to: stop.name,
        distance: roadDist
      });

      total += roadDist;
      lastPoint = { lat: stopLat, lng: stopLng };
      lastLabel = stop.name;
    }
  });

  return { 
    total: parseFloat(total.toFixed(1)), 
    segments,
    roadFactorApplied: roadFactor
  };
};

export const getBookingEstimateService = async (bookingData) => {
    const config = await PlatformConfig.findOne();
    if (!config) throw new Error("Platform configuration not found.");

    console.log('🔎 Estimate payload:', bookingData);

    // Extract fields – support both `cityId` (new) and legacy `city`
    const { cityId, city, durationType, pickupLocation, stops, actualKm, segments } = bookingData;
    const cityValue = cityId || city;
    // Ensure city is a string before lowercasing
    const cityStr = cityValue ? String(cityValue) : '';
    const cityConfig = config.CITIES.find(c => c.id.toLowerCase() === cityStr.toLowerCase() || c.name.toLowerCase() === cityStr.toLowerCase());
    const d = cityConfig?.demand || 1.0;

    // Find hours from durationType
    const rideTypeConfig = config.RIDE_TYPES.find(rt => rt.id === durationType);
    let hoursBooked = rideTypeConfig?.hours || 5;
    if (durationType === 'custom') {
        if (bookingData.totalHours) {
            hoursBooked = bookingData.totalHours;
        } else if (bookingData.startTime && bookingData.endTime) {
            // Parse AM/PM format times to calculate hours
            const parseTime = (t) => {
                const [time, period] = t.split(' ');
                let [h, m] = time.split(':').map(Number);
                if (period === 'PM' && h !== 12) h += 12;
                if (period === 'AM' && h === 12) h = 0;
                return h + (m || 0) / 60;
            };
            let diff = parseTime(bookingData.endTime) - parseTime(bookingData.startTime);
            if (diff < 0) diff += 24;
            hoursBooked = Math.max(1, Math.round(diff));
        } else {
            hoursBooked = 8;
        }
    }

    // Normalize stop locations to ensure lat/lng are present
    const normalizedStops = (stops || []).map(stop => {
      const lat = stop.location?.lat ?? stop.lat;
      const lng = stop.location?.lng ?? stop.lng;
      return {
        ...stop,
        location: { lat, lng }
      };
    });

    // Calculate distance – if no stops but client supplied `actualKm`, use that
    const distanceResult = calculateRouteDistance(pickupLocation, normalizedStops, config);
    const km = (normalizedStops.length === 0 && actualKm != null) ? actualKm : distanceResult.total;
    const segs = (normalizedStops.length === 0 && segments != null) ? segments : distanceResult.segments;

    const rates = config.GLOBAL_RATES;
    const pConfig = config.PRICING_CONFIG;

    // Determine Vehicle Multiplier
    const vehicleTypeStr = bookingData.vehicleType || 'bike';
    let vMult = 1.0;
    if (vehicleTypeStr === 'cab') vMult = 2.5;
    else if (vehicleTypeStr === 'auto') vMult = 1.5;
    else if (vehicleTypeStr === 'bike-light') vMult = 0.8;

    const base = Math.round(rates.base * vMult);
    const dist = Math.round(km * rates.perKm * vMult);
    const time = Math.round(hoursBooked * rates.perHour * vMult);
    const guide = Math.round(rates.guideFee * vMult);

    const rawTotal = Math.round((dist + time + base + guide) * d);
    const adminPercent = pConfig.ADMIN_COMMISSION_PERCENT !== undefined ? pConfig.ADMIN_COMMISSION_PERCENT : 0.3;
    const advancePercent = pConfig.ADVANCE_PERCENT !== undefined ? pConfig.ADVANCE_PERCENT : 0.3;

    const serviceFee = Math.round(rawTotal * adminPercent);
    const rideFee = rawTotal - serviceFee;
    const total = rawTotal;

    return {
        baseFare: base,
        distanceCharge: dist, // note: backend schema uses distanceCost for this
        timeCharge: time,
        guideFee: guide,      // note: backend schema uses guideServiceFee for this
        rideFee,
        serviceFee,
        totalFee: total,      // note: backend schema uses totalAmount for this
        totalDistance: km,
        distanceSegments: segs,
        demandMult: d,
        advanceAmount: Math.round(total * advancePercent),
        calculationMethod: {
            formula: pConfig.FORMULA,
            description: pConfig.DESCRIPTION,
            roadFactor: pConfig.ROAD_FACTOR,
            adminCommission: adminPercent,
            isRealRoute: km > 0
        }
    };
};

export const createBookingService = async (userId, bookingData) => {
    let {
        city, date, startTime, endTime, durationType,
        totalHours, pickupLocation, language, genderPreference,
        stops, specialRequest, pricing, payment, vehicleType
    } = bookingData;

    if (durationType !== 'custom' && startTime) {
        const config = await PlatformConfig.findOne();
        const rideTypeConfig = config?.RIDE_TYPES.find(rt => rt.id === durationType);
        const hoursToAdd = rideTypeConfig?.hours || 5;
        
        let h = 0, m = 0, isAmPm = false, period = 'AM';
        if (startTime.toUpperCase().includes('AM') || startTime.toUpperCase().includes('PM')) {
            isAmPm = true;
            const parts = startTime.trim().split(' ');
            [h, m] = parts[0].split(':').map(Number);
            period = parts[1]?.toUpperCase() || 'AM';
            if (period === 'PM' && h !== 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;
        } else {
            [h, m] = startTime.split(':').map(Number);
        }

        let endH = (h + hoursToAdd) % 24;
        
        if (isAmPm) {
            const outPeriod = endH >= 12 ? 'PM' : 'AM';
            let outH = endH % 12;
            if (outH === 0) outH = 12;
            endTime = `${String(outH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${outPeriod}`;
        } else {
            endTime = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }
        
        totalHours = hoursToAdd;
    }

    const newBooking = new Booking({
        touristId: userId,
        city,
        date,
        startTime,
        endTime,
        durationType,
        totalHours,
        pickupLocation,
        language,
        genderPreference,
        vehicleType,
        stops,
        specialRequest,
        pricing,
        payment: {
            ...payment,
            status: "pending"
        },
        bookingStatus: "pending", 
        assignmentStatus: "not_assigned"
    });

    await newBooking.save();

    // // Auto-assign rider if toggle is ON
    // try {
    //     const settings = await Settings.findOne();
    //     if (settings?.autoAssign) {
    //         // First check if any rider already expressed interest
    //         if (newBooking.interestedRiders.length > 0) {
    //             newBooking.riderId = newBooking.interestedRiders[0].riderId;
    //         } else {
    //             // Find best matching rider directly
    //             const busyRiderIds = await Booking.find({
    //                 status: { $in: ["confirmed", "ongoing"] },
    //                 riderId: { $ne: null }
    //             }).distinct("riderId");
    //
    //             const matchedRider = await Rider.findOne({
    //                 city: { $regex: new RegExp(`^${newBooking.city}$`, "i") },
    //                 languages: newBooking.language,
    //                 isVerified: true,
    //                 verificationStatus: "approved",
    //                 _id: { $nin: busyRiderIds }
    //             }).sort({ rating: -1 });
    //
    //             if (matchedRider) {
    //                 newBooking.riderId = matchedRider._id;
    //             }
    //         }
    //
    //         if (newBooking.riderId) {
    //             newBooking.status = "confirmed";
    //             await newBooking.save();
    //         }
    //     }
    // } catch (err) {
    //     console.error("Auto-assign error:", err.message);
    // }


    // Return a clean object for the tourist
    const bookingResponse = newBooking.toObject();
    delete bookingResponse.interestedRiders;
    delete bookingResponse.rejectedRiders;

    return bookingResponse;
};



// import { io } from "socket.io-client";

// const socket = io("http://localhost:9999");

// // When rider logs in and their city is known:
// socket.emit("join-city", rider.city); // e.g., "Goa"

// // Listen for new bookings
// socket.on("new-booking", (data) => {
//     // Show a toast/notification
//     console.log("🔔 New booking!", data.message);
// });





export const getBookingsService = async (userId) => {
    const bookings = await Booking.find({ touristId: userId })
        .populate("riderId", "name phone profileImage vehicleModel vehicleNumber vehicleType rating")
        .select("-interestedRiders -rejectedRiders")
        .sort({ createdAt: -1 });

    await Promise.all(bookings.map(async (booking) => {
        if (booking.bookingStatus === "ongoing" && !booking.endRideOTP) {
            booking.endRideOTP = Math.floor(1000 + Math.random() * 9000).toString();
            await booking.save();
        }
    }));

    return bookings;
};

export const getDashboardDataService = async (userId) => {
    try {
        // Aggregate statistics in a single query
        const stats = await Booking.aggregate([
            { $match: { touristId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalTrips: { $sum: 1 },
                    citiesExplored: { $addToSet: "$city" },
                    upcomingTrips: {
                        $sum: {
                            $cond: [
                                { $in: ["$bookingStatus", ["assigned", "pending", "searching", "ongoing"]] },
                                1,
                                0
                            ]
                        }
                    },
                    completedTrips: {
                        $sum: {
                            $cond: [{ $eq: ["$bookingStatus", "completed"] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const statsData = stats[0] || {
            totalTrips: 0,
            citiesExplored: [],
            upcomingTrips: 0,
            completedTrips: 0
        };

        // Get upcoming trips (limit to 4)
        const upcomingTrips = await Booking.find({
            touristId: userId,
            bookingStatus: { $in: ["assigned", "pending", "searching", "ongoing"] }
        })
            .populate("riderId", "name phone profileImage vehicleModel vehicleNumber vehicleType rating")
            .select("city date startTime endTime bookingStatus pickupAddress estimatedPrice pricing")
            .sort({ date: 1, startTime: 1 })
            .limit(4);

        return {
            stats: {
                totalTrips: statsData.totalTrips,
                citiesExplored: statsData.citiesExplored.length,
                upcomingTrips: statsData.upcomingTrips,
                completedTrips: statsData.completedTrips
            },
            upcomingTrips
        };
    } catch (error) {
        console.error("Error in getDashboardDataService:", error);
        throw error;
    }
};

export const getBookingByIdService = async (userId, bookingId) => {
    const booking = await Booking.findOne({ touristId: userId, _id: bookingId })
        .populate("riderId", "name phone profileImage vehicleModel vehicleNumber vehicleType rating")
        .select("-interestedRiders -rejectedRiders");
    if (!booking) {
        throw new Error("Booking not found.");
    }
    if (booking.bookingStatus === "ongoing" && !booking.endRideOTP) {
        booking.endRideOTP = Math.floor(1000 + Math.random() * 9000).toString();
        await booking.save();
    }
    return booking;
};

export const cancelBookingService = async (userId, bookingId, reason) => {
    const booking = await Booking.findOne({ touristId: userId, _id: bookingId });

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

    // ── Scenario-Based Cancellation Charge Calculation (Tourist) ────────
    const config = await PlatformConfig.findOne();
    const policy = config?.CANCELLATION_POLICY || {};

    const freeCancelMins    = policy.FREE_CANCEL_WINDOW_MINS       ?? 5;
    const onTheWayFee       = policy.ON_THE_WAY_FEE                ?? 50;
    const onTheWayRiderComp = policy.ON_THE_WAY_RIDER_COMPENSATION ?? 35;
    const arrivedFee        = policy.ARRIVED_FEE                   ?? 100;
    const arrivedRiderComp  = policy.ARRIVED_RIDER_COMPENSATION    ?? 70;

    const bookingCreated = booking.createdAt ? new Date(booking.createdAt) : new Date();
    const now = new Date();
    const minutesSinceBooking = (now.getTime() - bookingCreated.getTime()) / (1000 * 60);

    const advanceAmount = Number(booking.pricing?.advanceAmount || booking.payment?.amountPaid || 0);
    let chargeAmount = 0;
    let refundAmount = advanceAmount;
    let riderCompensation = 0;
    let matchedScenario = "Tourist Cancel";
    let triggerCondition = `Within ${freeCancelMins} min of booking / Free window`;

    const currentStage = booking.tracking?.currentStage || "assigned";
    const hasAssignedRider = Boolean(booking.assignedRiderId || booking.riderId);

    // Scenario 1: Within free cancellation window (e.g., 5 min)
    if (minutesSinceBooking <= freeCancelMins) {
        chargeAmount = 0;
        refundAmount = advanceAmount;
        riderCompensation = 0;
        matchedScenario = "Tourist Cancel";
        triggerCondition = `Within ${freeCancelMins} min of booking / Free window`;
    }
    // Scenario 3: Rider arrived at pickup location (arrived_at_pickup)
    else if (currentStage === "arrived_at_pickup") {
        chargeAmount = Math.min(arrivedFee, advanceAmount);
        refundAmount = Math.max(advanceAmount - chargeAmount, 0);
        riderCompensation = arrivedRiderComp;
        matchedScenario = "Tourist Cancel";
        triggerCondition = "Rider arrived at location (arrived_at_pickup)";
    }
    // Scenario 2: Rider on the way (heading_to_pickup) or assigned & moving
    else if (currentStage === "heading_to_pickup" || (hasAssignedRider && minutesSinceBooking > freeCancelMins)) {
        chargeAmount = Math.min(onTheWayFee, advanceAmount);
        refundAmount = Math.max(advanceAmount - chargeAmount, 0);
        riderCompensation = onTheWayRiderComp;
        matchedScenario = "Tourist Cancel";
        triggerCondition = "Rider on the way (heading_to_pickup)";
    }
    // Fallback: If no rider assigned yet, tourist gets full refund
    else {
        chargeAmount = 0;
        refundAmount = advanceAmount;
        riderCompensation = 0;
        matchedScenario = "Tourist Cancel";
        triggerCondition = "Unassigned / Early cancellation";
    }

    // Credit rider wallet if rider compensation applies
    const riderIdToCredit = booking.assignedRiderId || booking.riderId;
    if (riderCompensation > 0 && riderIdToCredit) {
        try {
            await Rider.findByIdAndUpdate(riderIdToCredit, {
                $inc: { walletBalance: riderCompensation }
            });
            console.log(`💰 Credited rider ₹${riderCompensation} wallet compensation for tourist cancellation`);
        } catch (walletErr) {
            console.error("❌ Error crediting rider wallet compensation:", walletErr);
        }
    }

    booking.bookingStatus      = "cancelled";
    booking.cancellationReason = reason || "Not specified";
    booking.cancelledBy        = "tourist";
    booking.cancellation = {
        scenario:          matchedScenario,
        trigger:           triggerCondition,
        chargePercent:     advanceAmount > 0 ? (chargeAmount / advanceAmount) : 0,
        chargeAmount,
        refundAmount,
        riderCompensation,
        riderPenalty:      0,
        refundStatus:      refundAmount > 0 ? "pending" : "not_applicable",
        cancelledAt:       now,
        cancelledBy:       "tourist",
        reason:            reason || "Not specified"
    };

    await booking.save();

    // Create refund request with tourist's saved refund details
    if (refundAmount > 0) {
        try {
            const tourist = await User.findById(userId);
            const refundDetails = tourist?.refundDetails || {
                paymentMethod: 'original_payment_method',
                upiId: '',
                bankAccount: {
                    accountNumber: '',
                    accountHolder: '',
                    ifsc: '',
                    bankName: ''
                }
            };

            const refundRequest = new RefundRequest({
                touristId: userId,
                bookingId: booking._id,
                cancellation: {
                    chargeAmount: booking.cancellation.chargeAmount || 0,
                    refundAmount: booking.cancellation.refundAmount || 0,
                    refundStatus: booking.cancellation.refundStatus,
                    cancelledAt: booking.cancellation.cancelledAt,
                    cancelledBy: booking.cancellation.cancelledBy || booking.cancelledBy || 'tourist',
                    reason: booking.cancellation.reason || booking.cancellationReason || reason || 'Not specified'
                },
                refundDetails: {
                    ...refundDetails,
                    originalPaymentMethod: {
                        transactionId: booking.payment?.transactionId,
                        method: booking.payment?.method
                    }
                }
            });
            await refundRequest.save();
            console.log("📝 Refund request created for tourist:", refundRequest._id);
        } catch (error) {
            console.error("❌ Error creating refund request:", error);
            // Don't fail the cancellation if refund request creation fails
        }
    }

    return {
        booking,
        cancellation: {
            isFree:       chargeAmount === 0,
            chargeAmount,
            refundAmount,
            note: chargeAmount === 0
                ? "Cancelled within free window — full advance will be refunded."
                : `₹${chargeAmount} cancellation charge applied. ₹${refundAmount} will be refunded.`
        }
    };
};



export const rateRiderService = async (touristId, bookingId, rating) => {
    const booking = await Booking.findOne({ _id: bookingId, touristId });
    
    if (!booking) throw new Error("Booking not found");
    if (booking.bookingStatus !== "completed") throw new Error("Ride not completed yet");

    // Save only the star rating
    booking.review = {
        rating,
        isReviewed: true,
        reviewedAt: new Date()
    };
    await booking.save();

    // Update Rider's Average Star Rating
    const rider = await Rider.findById(booking.riderId);
    if (rider) {
        const total = rider.totalRides || 0;
        const current = rider.rating || 0;
        const ratingNum = Number(rating); // 🔥 Force to Number
        
        const calculatedRating = ((current * total) + ratingNum) / (total + 1);
        rider.rating = Number(calculatedRating.toFixed(1)); // 🎯 Round to 1 decimal
        rider.totalRides = total + 1;
        await rider.save();
    }

    return booking;
};

















