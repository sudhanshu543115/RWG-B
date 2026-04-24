import express from "express";
import { 
    createBooking, 
    getBookings, 
    getBookingById, 
    cancelBooking 
} from "./booking.controller.js";
import { protectTourist } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectTourist);

router.route("/")
    .post(createBooking)
    .get(getBookings);

router.route("/:id")
    .get(getBookingById)
    .patch(cancelBooking); // Using PATCH for status update

export default router;
