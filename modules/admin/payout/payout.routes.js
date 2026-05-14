import express from "express";

import {
   getAllPayouts,
   processPayout
} from "./payout.controller.js";

import { protectAdmin } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/", getAllPayouts);

router.patch(
   "/:id/process",
   processPayout
);

export default router;