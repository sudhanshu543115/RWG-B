import express from "express";
import { sendRiderOtp, verifyRiderOtp } from "./auth.controller.js";

const router = express.Router();

router.post("/send-otp", sendRiderOtp);
router.post("/verify-otp", verifyRiderOtp);

export default router;
