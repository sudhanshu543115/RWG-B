import { Router } from "express";
import { protectAdmin } from "../../../middleware/auth.middleware.js";
import {
    getAllBookingsController,
    getBookingByIdController,
    deleteBookingController,
    assignRiderToBookingController,
    autoAssignRiderController,
    getSettings,
    toggleAutoAssign,
    processRefundController,
    getRefundRequestsController,
    processTouristRefundController
} from "./bookings.controller.js";

const router = Router();

router.use(protectAdmin);

// Settings routes (MUST be before /:id routes)
router.get("/settings", getSettings);
router.patch("/settings/auto-assign", toggleAutoAssign);

// Refund requests routes (MUST be before /:id routes)
router.get("/refund-requests", getRefundRequestsController);
router.put("/refund-requests/:id/process", processTouristRefundController);

router.get("/", getAllBookingsController);
router.get("/:id", getBookingByIdController);
router.delete("/:id", deleteBookingController);
router.put("/:id/assign", assignRiderToBookingController);
router.put("/:id/auto-assign", autoAssignRiderController);
router.put("/:id/refund", processRefundController);

export default router;