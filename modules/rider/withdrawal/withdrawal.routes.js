import express from "express";
import {
   createWithdrawal,
   getMyWithdrawals
} from "./withdrawal.controller.js";

import { protectRider } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRider);

router.post("/", createWithdrawal);
router.get("/", getMyWithdrawals);

export default router;