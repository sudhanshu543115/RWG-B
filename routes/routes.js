import express from "express";
import touristAuthRoutes from "../modules/tourist/auth/auth.routes.js";
import touristProfileRoutes from "../modules/tourist/profile/profile.routes.js";
import touristBookingRoutes from "../modules/tourist/booking/booking.routes.js";

import riderAuthRoutes from "../modules/rider/auth/auth.routes.js";
import riderProfileRoutes from "../modules/rider/profile/profile.routes.js";
import riderBookingRoutes from "../modules/rider/bookings/bookings.routes.js";
import riderEarningsRoutes from "../modules/rider/earnings/earnings.routes.js";
import riderStatsRoutes from "../modules/rider/stats/stats.routes.js";
import riderConfigRoutes from "../modules/rider/config/config.routes.js";

import notificationRoutes from "../modules/notification/notification.routes.js";
import { protectAny } from "../middleware/auth.middleware.js";

import touristPaymentRoutes from "../modules/tourist/payment/payment.routes.js";

import adminAuthRoutes from "../modules/admin/auth/auth.routes.js";
import adminRiderRoutes from "../modules/admin/riders/riders.routes.js";
import adminBookingRoutes from "../modules/admin/bookings/bookings.routes.js";
import adminTouristRoutes from "../modules/admin/tourists/tourists.routes.js";
import adminAnalyticsRoutes from "../modules/admin/analytics/analytics.routes.js";
import platformConfigRoutes from "../modules/admin/config/config.routes.js";
import adminEarningsRoutes from "../modules/admin/earnings/earnings.routes.js";
import riderWithdrawalRoutes from "../modules/rider/withdrawal/withdrawal.routes.js";

import riderPaymentMethodRoutes from "../modules/rider/payment-method/paymentMethod.routes.js";
import payoutRoutes from "../modules/admin/payout/payout.routes.js";
import chatRoutes from "../modules/chat/chat.routes.js";
import searchRoutes from "../modules/admin/Search/search.routes.js";
import supportRoutes from "../modules/support/support.routes.js";

import riderKitRoutes from "../modules/rider/kit/kit.routes.js";
import adminKitRoutes from "../modules/admin/kit/kit.routes.js";

const router = express.Router();

// Public Config
router.use("/api/config", platformConfigRoutes);

// Tourist Routes
router.use("/api/tourist/auth", touristAuthRoutes);
router.use("/api/tourist/profile", touristProfileRoutes);
router.use("/api/tourist/booking", touristBookingRoutes);

// Rider Routes
router.use("/api/rider/auth", riderAuthRoutes);
router.use("/api/rider/profile", riderProfileRoutes);
router.use("/api/payment", touristPaymentRoutes);
router.use("/api/rider/bookings", riderBookingRoutes);
router.use("/api/rider/earnings", riderEarningsRoutes);
router.use("/api/rider/stats", riderStatsRoutes);
router.use("/api/rider/config", riderConfigRoutes);
router.use("/api/rider/withdrawal", riderWithdrawalRoutes);
router.use("/api/rider/payment-method", riderPaymentMethodRoutes);
router.use("/api/rider/kit", riderKitRoutes);

router.use("/api/notifications", protectAny, notificationRoutes);

// Admin Routes
router.use("/api/admin/auth", adminAuthRoutes);
router.use("/api/admin/riders", adminRiderRoutes);
router.use("/api/admin/bookings", adminBookingRoutes);
router.use("/api/admin/tourists", adminTouristRoutes);
router.use("/api/admin/analytics", adminAnalyticsRoutes);
router.use("/api/admin/payouts", payoutRoutes);
router.use("/api/admin/search", searchRoutes);
router.use("/api/admin/earnings", adminEarningsRoutes);
router.use("/api/admin/kit", adminKitRoutes);

// Support Routes
router.use("/api/support", supportRoutes);

// chat Routes
router.use("/api/chat", chatRoutes);

export default router;
