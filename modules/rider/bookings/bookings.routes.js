import express from "express";
import { protectRider } from "../../../middleware/auth.middleware.js";
import { 
    getPendingBookings, 
    expressInterest, 
    rejectBooking,
    getMyBookings,
    startRide,
    completeRide
} from "./bookings.controller.js";

const router = express.Router();

router.use(protectRider);

router.get("/pending", getPendingBookings);
router.get("/my-bookings", getMyBookings);
router.post("/:id/interested", expressInterest);
router.post("/:id/reject", rejectBooking);
router.patch("/:id/start", startRide);
router.patch("/:id/complete", completeRide);

export default router;
