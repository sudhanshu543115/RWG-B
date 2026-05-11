import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dns from "dns";
import http from "http";

import { PORT } from "./config/env.js";
import connectDB from "./config/db.js";
import corsOptions from "./config/cors.js";
import routes from "./routes/routes.js";
import { initSocket } from "./config/socket.js";
import { initSocketEvents } from "./core/socket.events.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// DB
connectDB();
const io = initSocket(server);
initSocketEvents(io);
// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/config/razorpay", (req, res) => {
  res.json({
    keyId: process.env.TEST_API_KEY,
    mode: "test",
    message: process.env.TEST_API_KEY
      ? "Razorpay config OK"
      : "Missing Razorpay config"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString()
  });
});

app.use(routes);
 
// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ GLOBAL ERROR:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});



// Listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});