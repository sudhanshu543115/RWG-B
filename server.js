import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { PORT } from "./config/env.js";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import corsOptions from "./config/cors.js";
import routes from "./routes/routes.js";
<<<<<<< HEAD
import razorpay from "./config/razorpay.js";

=======
import dns from "dns";
>>>>>>> main

dns.setServers(["8.8.8.8", "1.1.1.1"]);
const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

connectDB();



// Define routes
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// --- CHECK RAZORPAY CONFIGURATION ---
app.get("/api/config/razorpay", (req, res) => {
    res.json({
        keyId: process.env.TEST_API_KEY, // only send ID, NOT secret
        mode: "test",
        message: process.env.TEST_API_KEY ? "Razorpay config OK" : "Missing Razorpay config"
    });
});


app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Server is healthy and running smoothly",
        timestamp: new Date().toISOString()
    });
});

app.use(routes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});