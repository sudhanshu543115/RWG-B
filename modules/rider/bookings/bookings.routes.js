import express from "express";
import { protectRider } from "../../../middleware/auth.middleware.js";
import { getPendingBookings, expressInterest, rejectBooking } from "./bookings.controller.js";

const router = express.Router();

router.use(protectRider);

router.get("/pending", getPendingBookings);
router.post("/:id/interested", expressInterest);
router.post("/:id/reject", rejectBooking);

export default router;
