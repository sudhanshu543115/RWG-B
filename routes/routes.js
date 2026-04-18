import express from "express";
import touristAuthRoutes from "../modules/tourist/auth/auth.routes.js";
import touristProfileRoutes from "../modules/tourist/profile/profile.routes.js";

const router = express.Router();

router.use("/api/tourist/auth", touristAuthRoutes);
router.use("/api/tourist/profile", touristProfileRoutes);

export default router;