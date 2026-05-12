import express from "express";
import { getRiderEarnings } from "./earnings.controller.js";
import { protectRider } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRider);
router.get("/", getRiderEarnings);

export default router;
