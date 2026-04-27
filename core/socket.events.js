import { SOCKET_EVENTS } from './constants.js';

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

// ✅ THIS MUST EXIST AS NAMED EXPORT
function notifyAllRidersNewBooking(booking) {
  try {
    emitToRoom(
      "riders_online",
      SOCKET_EVENTS.BOOKING_NEW_REQUEST,
      {
        message: "New booking request available",
        booking
      }
    );
  } catch (error) {
    console.error("Socket emit error:", error.message);
  }
}

// ✅ IMPORTANT PART (this fixes your error)
export {
  initSocketEvents,
  getIO,
  notifyAllRidersNewBooking,
};