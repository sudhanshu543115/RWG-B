import express from "express";
import touristAuthRoutes from "../modules/tourist/auth/auth.routes.js";
import touristProfileRoutes from "../modules/tourist/profile/profile.routes.js";
import paymentRoutes from "../modules/tourist/payment/payment.routes.js";

const router = express.Router();

router.use("/api/tourist/auth", touristAuthRoutes);
router.use("/api/tourist/profile", touristProfileRoutes);
router.use("/api/payment", paymentRoutes);

export default router;