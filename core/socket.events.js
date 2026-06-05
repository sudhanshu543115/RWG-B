import { SOCKET_EVENTS } from './constants.js';
import Rider from '../models/rider/Rider.js';
import { createNotification } from "../modules/notification/notification.service.js";

let _io;

function initSocketEvents(io) {
  _io = io;
}

function getIO() {
  if (!_io) throw new Error('Socket.io not initialised');
  return _io;
}

function emitToRoom(room, event, data) {
  getIO().to(room).emit(event, data);
}

function buildGenderFilter(genderPreference) {
  if (genderPreference === "Male guide preferred") {
    return { gender: { $regex: /^male$/i } };
  }
  if (genderPreference === "Female guide preferred") {
    return { gender: { $regex: /^female$/i } };
  }
  return {};
}

async function notifyMatchedRidersNewBooking(booking) {
  try {
    const genderFilter = buildGenderFilter(booking.genderPreference);
    const matchedRiders = await Rider.find({
      city: { $regex: new RegExp(`^${booking.city}$`, "i") },
      languages: booking.language,
      isVerified: true,
      verificationStatus: "approved",
      vehicleType: booking.vehicleType,
      ...genderFilter
    }).select("_id").lean();

    if (!matchedRiders.length) {
      console.log("⚠️ No matched riders found for new booking", booking._id);
      return;
    }

    const payload = {
      bookingId: booking._id,
      city: booking.city,
      date: booking.date,
      startTime: booking.startTime,
      durationType: booking.durationType,
      message: `New ${booking.durationType} tour request in ${booking.city}!`
    };

    // After the emitToRoom line, add:
    matchedRiders.forEach((rider) => {
      emitToRoom(`rider:${rider._id}`, "new-booking", payload);

      // 🔔 Save notification
      createNotification({
        recipientId: rider._id,
        recipientRole: "rider",
        type: "new_booking",
        title: "New Booking Available",
        message: `New ${booking.durationType} tour request in ${booking.city}!`,
        bookingId: booking._id,
      });
    });

  } catch (error) {
    console.error("Socket emit error for matched riders:", error.message);
  }
}

function notifyAdminRiderInterested(booking, rider) {
  try {
    emitToRoom(
      "admin", // 👈 admin room
      "rider-interested",
      {
        bookingId: booking._id,
        riderId: rider._id,
        riderName: rider.name,
        city: booking.city,
        message: `${rider.name} showed interest in booking`
      }
    );
  } catch (error) {
    console.error("❌ Admin notify error:", error.message);
  }
}
function notifyTouristRiderAssigned(booking, rider) {
  try {
    console.log("🔍 NOTIFYING TOURIST - booking.touristId:", booking.touristId);
    console.log("🔍 NOTIFYING TOURIST - rider:", rider.name, rider._id);

    // Handle both populated and non-populated touristId
    let touristId;
    if (booking.touristId && typeof booking.touristId === 'object') {
      touristId = booking.touristId._id?.toString();
    } else {
      touristId = booking.touristId?.toString();
    }

    if (!touristId) {
      throw new Error("Tourist ID not found in booking");
    }

    console.log("✅ EXTRACTED TOURIST ID:", touristId);

    const payload = {
      bookingId: booking._id,
      riderId: rider._id,
      riderName: rider.name,
      riderPhone: rider.phone,
      message: `Your ride has been assigned to ${rider.name}`
    };

    console.log("📤 EMITTING TO ROOM:", `tourist:${touristId}`, payload);
    emitToRoom(
      `tourist:${touristId}`,
      "rider-assigned",
      payload,
      // 🔔 Save notification
      createNotification({
        recipientId: touristId,
        recipientRole: "tourist",
        type: "rider_assigned",
        title: "Rider Assigned",
        message: `Your ride has been assigned to ${rider.name}`,
        bookingId: booking._id,
      })

    );

    console.log("📡 NOTIFIED TOURIST:", touristId);
  } catch (error) {
    console.error("❌ Tourist notify error:", error.message);
    console.error("❌ Stack:", error.stack);
  }
}
function notifyRiderAssigned(booking, rider) {
  try {
    const payload = {
      bookingId: booking._id,
      city: booking.city,
      date: booking.date,
      startTime: booking.startTime,
      durationType: booking.durationType,
      touristName: booking.touristId?.name,
      message: `You have been assigned for this ride in ${booking.city}`
    };

    console.log("📤 EMITTING TO RIDER:", `rider:${rider._id}`, payload);

    emitToRoom(
      `rider:${rider._id}`,
      "ride-assigned",   // 👈 event name
      payload,
      createNotification({
        recipientId: rider._id,
        recipientRole: "rider",
        type: "rider_assigned",
        title: "New Ride Assigned",
        message: `You have been assigned for a ride in ${booking.city}`,
        bookingId: booking._id,
      })

    );

    console.log("📡 NOTIFIED RIDER:", rider._id);
  } catch (error) {
    console.error("❌ Rider notify error:", error.message);
  }
}

function notifyRidersBookingCancelled(booking) {
  try {
    const payload = {
      bookingId: booking._id,
      message: `The booking in ${booking.city} has been cancelled by the tourist.`
    };

    // 1. Notify the assigned rider if any
    if (booking.riderId) {
      emitToRoom(`rider:${booking.riderId}`, "booking-cancelled", payload);
    }

    // 2. Notify all interested riders (to clear their UI)
    if (booking.interestedRiders && booking.interestedRiders.length > 0) {
      booking.interestedRiders.forEach(item => {
        emitToRoom(`rider:${item.riderId}`, "booking-cancelled", payload,);
        // For the assigned rider:
        if (booking.riderId) {
          createNotification({
            recipientId: booking.riderId,
            recipientRole: "rider",
            type: "booking_cancelled",
            title: "Booking Cancelled",
            message: `The booking in ${booking.city} has been cancelled.`,
            bookingId: booking._id,
          });
        }

      });
    }
  } catch (error) {
    console.error("❌ Socket cancellation notify error:", error.message);
  }
}

function notifyAdminBookingCancelled(booking) {
  try {
    emitToRoom("admin", "booking-cancelled", {
      bookingId: booking._id,
      message: `Booking #${booking._id} was cancelled by the tourist.`
    });
    // For admin, use a fixed admin user ID or skip recipientId
    // Skipped createNotification for admin because recipientId requires a valid ObjectId

  } catch (error) {
    console.error("❌ Admin cancellation notify error:", error.message);
  }
}
function notifyRiderPaymentCompleted(booking, riderId) {
  try {
    const payload = {
      bookingId: booking._id,
      city: booking.city,
      amount: booking.payment?.remainingAmount || 0,
      message: `Payment completed successfully for ride in ${booking.city} 🎉`
    };

    console.log("💰 PAYMENT COMPLETED NOTIFICATION TO RIDER:", riderId);

    emitToRoom(
      `rider:${riderId}`,
      "payment-completed",
      payload
    );

  } catch (error) {
    console.error("❌ Rider payment notify error:", error.message);
  }
}

function notifyTouristRideCompleted(booking) {
  try {
    let touristId;
    if (booking.touristId && typeof booking.touristId === 'object') {
      touristId = booking.touristId._id?.toString();
    } else {
      touristId = booking.touristId?.toString();
    }
    if (!touristId) return;

    emitToRoom(`tourist:${touristId}`, "ride-completed", {
      bookingId: booking._id,
      message: "Your tour has been completed! Please rate your guide."

    });
    // Save notification
    createNotification({
      recipientId: touristId,
      recipientRole: "tourist",
      type: "ride_completed",
      title: "Ride Completed",
      message: "Your tour has been completed! Please rate your guide.",
      bookingId: booking._id,
    });

    console.log("📡 NOTIFIED TOURIST OF COMPLETION:", touristId);

  } catch (error) {
    console.error("❌ Completion notify error:", error.message);
  }
}

function notifyRiderPayoutProcessed(riderId, amount) {
  try {
    emitToRoom(`rider:${riderId}`, "payout-processed", {
      message: `Your payout of ₹${amount} has been processed successfully!`,
      amount
    });

    createNotification({
      recipientId: riderId,
      recipientRole: "rider",
      type: "payout_processed",
      title: "Payout Successful",
      message: `Your payout of ₹${amount} has been processed!`,
    });

  } catch (error) {
    console.error("❌ Payout processed notify error:", error.message);
  }
}

function notifyRiderPayoutRejected(riderId, amount) {
  try {
    emitToRoom(`rider:${riderId}`, "payout-rejected", {
      message: `Your payout request for ₹${amount} was rejected. The amount has been returned to your available balance.`,
      amount
    });
    createNotification({
      recipientId: riderId,
      recipientRole: "rider",
      type: "payout_rejected",
      title: "Payout Rejected",
      message: `Your payout request for ₹${amount} was rejected.`,
    });

  } catch (error) {
    console.error("❌ Payout rejected notify error:", error.message);
  }
}

function notifyRideTrackingUpdated(booking) {
  try {
    const payload = {
      bookingId: booking._id,
      tracking: booking.tracking
    };

    // Emit to admin
    emitToRoom("admin", "ride-tracking-updated", payload);

    // Emit to tourist
    let touristId;
    if (booking.touristId && typeof booking.touristId === 'object') {
      touristId = booking.touristId._id?.toString();
    } else {
      touristId = booking.touristId?.toString();
    }
    if (touristId) {
      emitToRoom(`tourist:${touristId}`, "ride-tracking-updated", payload);
    }
  } catch (error) {
    console.error("❌ Tracking update notify error:", error.message);
  }
}




export {
  initSocketEvents,
  getIO,
  notifyAdminRiderInterested,
  notifyMatchedRidersNewBooking,
  notifyTouristRiderAssigned,
  notifyRiderAssigned,
  notifyRidersBookingCancelled,
  notifyAdminBookingCancelled,
  notifyRiderPaymentCompleted,
  notifyTouristRideCompleted,
  notifyRiderPayoutProcessed,
  notifyRiderPayoutRejected,
  notifyRideTrackingUpdated
};