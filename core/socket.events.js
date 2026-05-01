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

// // ✅ THIS MUST EXIST AS NAMED EXPORT
// function notifyAllRidersNewBooking(booking) {
//   try {
//     emitToRoom(
//       "riders_online",
//       SOCKET_EVENTS.BOOKING_NEW_REQUEST,
//       {
//         message: "New booking request available",
//         booking
//       }
//     );
//   } catch (error) {
//     console.error("Socket emit error:", error.message);
//   }
// }

// ✅ IMPORTANT PART (this fixes your error)
export {
  initSocketEvents,
  getIO,
  // notifyAllRidersNewBooking,
  notifyMatchedRidersNewBooking,
};