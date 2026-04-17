import express from "express";
import touristAuthRoutes from "../modules/tourist/auth/auth.routes.js";

const router = express.Router();

router.use("/api/tourist/auth", touristAuthRoutes);

export default router;