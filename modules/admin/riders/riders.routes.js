import express from "express";
import { getAllRiders, updateRiderStatus } from "./riders.controller.js";
import { protectAdmin } from "../../../middleware/auth.middleware.js";
import { getPendingRiders } from "./riders.controller.js";
import { deleteRider } from "./riders.controller.js";
import { getRiderCompleteHistoryController } from "./riders.controller.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/", getAllRiders);
router.get("/pending", getPendingRiders);
router.patch("/:id/approve", updateRiderStatus);
router.patch("/:id/reject", updateRiderStatus);
router.delete("/:id/delete", deleteRider);

// GET RIDER COMPLETE HISTORY
router.get(
  "/:riderId/history",
  getRiderCompleteHistoryController
);




export default router;
