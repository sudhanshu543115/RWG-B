import User from "../models/tourist/User.js";
import Rider from "../models/rider/Rider.js";
import Admin from "../models/admin/Admin.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export const protectTourist = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers or cookies
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies.token) {
            token = req.cookies.token;
        }

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
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Authentication required. Please login." });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const rider = await Rider.findById(decoded.id);

        if (!rider) {
            return res.status(404).json({ success: false, message: "Rider not found." });
        }

        // --- ENFORCE PROFILE COMPLETION ---
        const isProfileRoute = req.originalUrl.includes("/api/rider/profile");
        const isAuthRoute = req.originalUrl.includes("/api/rider/auth");

        if (!rider.profileCompleted && !isProfileRoute && !isAuthRoute) {
            return res.status(403).json({
                success: false,
                message: "Profile incomplete. Please complete your profile first.",
                isProfileComplete: false
            });
        }

        // --- ENFORCE ADMIN APPROVAL ---
        const isOperationalRoute = !isProfileRoute && !isAuthRoute;

        if (isOperationalRoute && rider.verificationStatus !== "approved") {
            return res.status(403).json({
                success: false,
                message: rider.verificationStatus === "rejected"
                    ? "Your account has been rejected. Please contact support."
                    : "Account pending approval. You will be able to take rides once the admin approves your profile.",
                verificationStatus: rider.verificationStatus
            });
        }

        req.user = rider;
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        return res.status(401).json({ success: false, message: "Authentication failed." });
    }
};


export const protectAdmin = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Authentication required. Please login." });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized. Admin access required." });
        }

        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        req.user = admin;
        next();
    } catch (error) {
        console.error("Admin Auth Error:", error);
        return res.status(401).json({ success: false, message: "Authentication failed." });
    }
};

export const protectAny = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { _id: decoded.id, role: decoded.role };
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};
