import User from "../models/tourist/User.js";
import Rider from "../models/rider/Rider.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export const protectTourist = async (req, res, next) => {
    try {
        // Change this line to read from cookies
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ success: false, message: "Authentication required. Please login." });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }

            req.user = user;
            next();
        } catch (jwtError) {
            return res.status(401).json({ success: false, message: "Invalid or expired token." });
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: "Authentication failed." });
    }
};

export const protectRider = async (req, res, next) => {
    try {
        // Change this line to read from cookies
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ success: false, message: "Authentication required. Please login." });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const rider = await Rider.findById(decoded.id);

            if (!rider) {
                return res.status(404).json({ success: false, message: "Rider not found." });
            }

            req.user = rider;
            next();
        } catch (jwtError) {
            return res.status(401).json({ success: false, message: "Invalid or expired token." });
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: "Authentication failed." });
    }
};

