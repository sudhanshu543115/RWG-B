import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { PORT } from "./config/env.js";

import connectDB from "./config/db.js";
import corsOptions from "./config/cors.js";
import routes from "./routes/routes.js";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

connectDB();

// Define routes
app.get("/", (req, res) => {
    res.send("Hello World!");
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