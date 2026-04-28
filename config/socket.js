import { Server } from "socket.io";

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
    });

     socket.on("join-city", (city) => {
            socket.join(city.toLowerCase());
            console.log(`🏙️ Rider ${socket.id} joined room: ${city}`);
        });
        // Rider leaves city room
        socket.on("leave-city", (city) => {
            socket.leave(city.toLowerCase());
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