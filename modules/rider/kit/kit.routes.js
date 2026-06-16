import express from "express";
import { protectRider } from "../../../middleware/auth.middleware.js";
import {
  createKitOrder,
  verifyKitPayment,
  updateDeliveryLocation,
  getRiderKitOrder,
} from "./kit.controller.js";

const router = express.Router();

router.post("/create-order", protectRider, createKitOrder);
router.post("/verify-payment", protectRider, verifyKitPayment);
router.post("/update-location", protectRider, updateDeliveryLocation);
router.get("/my-order", protectRider, getRiderKitOrder);

export default router;
