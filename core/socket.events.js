import { SOCKET_EVENTS } from './constants.js';
import Rider from '../models/rider/Rider.js';

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

    matchedRiders.forEach((rider) => {
      emitToRoom(`rider:${rider._id}`, "new-booking", payload);
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
      payload
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
      payload
    );

    console.log("📡 NOTIFIED RIDER:", rider._id);
  } catch (error) {
    console.error("❌ Rider notify error:", error.message);
  }
}


// ✅ IMPORTANT PART (this fixes your error)
export {
  initSocketEvents,
  getIO,
  notifyAdminRiderInterested,
  notifyMatchedRidersNewBooking,
    notifyTouristRiderAssigned ,
     notifyRiderAssigned // 👈 ADD THIS
};