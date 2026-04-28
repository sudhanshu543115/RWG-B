import express from "express";
import touristAuthRoutes from "../modules/tourist/auth/auth.routes.js";
import touristProfileRoutes from "../modules/tourist/profile/profile.routes.js";
import touristBookingRoutes from "../modules/tourist/booking/booking.routes.js";

import riderAuthRoutes from "../modules/rider/auth/auth.routes.js";
import riderProfileRoutes from "../modules/rider/profile/profile.routes.js";
import riderBookingRoutes from "../modules/rider/bookings/bookings.routes.js";

import touristPaymentRoutes from "../modules/tourist/payment/payment.routes.js";


import adminAuthRoutes from "../modules/admin/auth/auth.routes.js";
import adminRiderRoutes from "../modules/admin/riders/riders.routes.js";
import adminBookingRoutes from "../modules/admin/bookings/bookings.routes.js";
const router = express.Router();

// Tourist Routes
router.use("/api/tourist/auth", touristAuthRoutes);
router.use("/api/tourist/profile", touristProfileRoutes);
router.use("/api/tourist/booking", touristBookingRoutes);
//router.use("/api/tourist/wallet", touristWalletRoutes);

// Rider Routes
router.use("/api/rider/auth", riderAuthRoutes);
router.use("/api/rider/profile", riderProfileRoutes);
router.use("/api/payment", touristPaymentRoutes);
router.use("/api/rider/bookings", riderBookingRoutes);



// Admin Routes

router.use("/api/admin/auth", adminAuthRoutes);
router.use("/api/admin/riders", adminRiderRoutes);
router.use("/api/admin/bookings", adminBookingRoutes);



export default router;