import express from "express";
import touristAuthRoutes from "../modules/tourist/auth/auth.routes.js";
import touristProfileRoutes from "../modules/tourist/profile/profile.routes.js";
<<<<<<< HEAD
import touristBookingRoutes from "../modules/tourist/booking/booking.routes.js";
import touristWalletRoutes from "../modules/tourist/wallet/wallet.routes.js";

import riderAuthRoutes from "../modules/rider/auth/auth.routes.js";
import riderProfileRoutes from "../modules/rider/profile/profile.routes.js";


import touristPaymentRoutes from "../modules/tourist/payment/payment.routes.js";
=======
import paymentRoutes from "../modules/tourist/payment/payment.routes.js";
>>>>>>> main

const router = express.Router();

// Tourist Routes
router.use("/api/tourist/auth", touristAuthRoutes);
router.use("/api/tourist/profile", touristProfileRoutes);
<<<<<<< HEAD
router.use("/api/tourist/booking", touristBookingRoutes);
router.use("/api/tourist/wallet", touristWalletRoutes);

// Rider Routes
router.use("/api/rider/auth", riderAuthRoutes);
router.use("/api/rider/profile", riderProfileRoutes);


router.use("/api/payment", touristPaymentRoutes);
=======
router.use("/api/payment", paymentRoutes);
>>>>>>> main

export default router;