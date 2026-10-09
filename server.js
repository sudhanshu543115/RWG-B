import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dns from "dns";
import http from "http";
import { createClient } from "redis";

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
const io = await  initSocket(server);
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
    redisConfigured: Boolean(process.env.REDIS_URL),
    timestamp: new Date().toISOString()
  });
});

app.get("/api/redis-check", async (req, res) => {
  const REDIS_URL = process.env.REDIS_URL;
  if (!REDIS_URL) {
    return res.status(200).json({
      success: false,
      status: "not_configured",
      message: "REDIS_URL is not set in backend .env",
      configured: false
    });
  }

  const start = Date.now();
  let client;
  try {
    client = createClient({ url: REDIS_URL });
    client.on("error", () => {});
    await client.connect();

    const ping = await client.ping();
    const testKey = `rwg_browser_test_${Date.now()}`;
    await client.set(testKey, "active", { EX: 15 });
    const readBack = await client.get(testKey);
    const latency = Date.now() - start;
    await client.disconnect();

    res.status(200).json({
      success: true,
      status: "connected",
      message: "Redis is connected and responding correctly!",
      ping: ping, // should return "PONG"
      readWriteTest: readBack === "active" ? "passed" : "failed",
      latency: `${latency}ms`,
      provider: REDIS_URL.includes("upstash") ? "Upstash Cloud Redis" : "Custom/Local Redis",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (client) {
      try { await client.disconnect(); } catch (_) {}
    }
    res.status(500).json({
      success: false,
      status: "error",
      message: "Redis connection failed",
      error: error.message
    });
  }
});

app.use(routes);
 
// Global Error Handler ddj
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
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});