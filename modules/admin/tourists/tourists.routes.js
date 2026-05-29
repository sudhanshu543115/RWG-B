import express from "express";
import {
    getAllTourists,
    getPendingTourists,
    updateTourist,
    deleteTourist,
    getTouristById,
    getTouristBookingHistoryController
} from "./tourists.controller.js";

import { protectAdmin } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// 🔐 Admin protection
router.use(protectAdmin);

// 📌 Routes
router.get("/", getAllTourists);
router.get("/pending", getPendingTourists);
router.get("/:id", getTouristById);

router.patch("/:id", updateTourist);
router.delete("/:id", deleteTourist);
router.get(
  "/:touristId/bookings",
  getTouristBookingHistoryController
);

export default router;