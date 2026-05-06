import { Server } from "socket.io";
import mongoose from "mongoose";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // dev only
      methods: ["GET", "POST"]
    }
  });

  console.log("🚀 SOCKET SERVER INITIALIZED");

  io.on("connection", (socket) => {
    console.log("🔥 NEW SOCKET CONNECTED:", socket.id);

    socket.on("register", (data) => {
      console.log("📥 REGISTER EVENT RECEIVED:", data);

      if (!data?.userId || !data?.role) {
        console.log("❌ INVALID REGISTER DATA");
        return;
      }

      const { userId, role } = data;

      if (role === "rider") {
        socket.join("riders_online");
        socket.join(`rider:${userId}`);
        console.log(`✅ Rider joined room: rider:${userId}`);
      }

      if (role === "tourist") {
        socket.join(`tourist:${userId}`);
        console.log(`✅ Tourist joined room: tourist:${userId}`);
      }
      if (role === "admin") {
        socket.join("admin");
        console.log("✅ ADMIN REGISTERED & JOINED ROOM");
      }

    });


    socket.on("join-city", (city) => {
      socket.join(city.toLowerCase());
      console.log(`🏙️ Rider ${socket.id} joined room: ${city}`);
    });
    // Rider leaves city room
    socket.on("leave-city", (city) => {
      socket.leave(city.toLowerCase());
    });


    // --- LIVE TRACKING LOGIC ---
    // 1. Join a private room for the specific booking
    socket.on("join-ride", (bookingId) => {
      socket.join(`ride:${bookingId}`);
      console.log(`✅ Socket ${socket.id} joined ride room: ride:${bookingId}`);
    });
    // 2. Handle location updates from the Rider
    socket.on("update-ride-location", async (data) => {
      const { bookingId, lat, lng } = data;
      if (!bookingId || !lat || !lng) return;
      // A. Broadcast to the Tourist (and Admin) in that room instantly
      // We use .to() to send to everyone in the room except the sender
      socket.to(`ride:${bookingId}`).emit("ride-location-updated", { lat, lng });
      // B. Save to Database (Optional: Update every 10 seconds or so to save performance)
      try {
        await mongoose.model("Booking").findByIdAndUpdate(bookingId, {
          liveLocation: {
            lat,
            lng,
            updatedAt: new Date()
          }
        });
      } catch (err) {
        console.error("❌ Live Tracking DB Error:", err.message);
      }
    });
    // 3. Leave the room when ride is finished (Optional but good practice)
    socket.on("leave-ride", (bookingId) => {
      socket.leave(`ride:${bookingId}`);
    });




    // 4. Handle location updates from the Tourist
    socket.on("update-tourist-location", (data) => {
      const { bookingId, lat, lng } = data;
      if (!bookingId || !lat || !lng) return;
      // Broadcast to the Rider in the room
      socket.to(`ride:${bookingId}`).emit("tourist-location-updated", { lat, lng });
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ SOCKET DISCONNECTED:", socket.id, reason);
    });

    socket.on("connect_error", (err) => {
      console.log("❌ SOCKET ERROR:", err.message);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};