import express from "express";
import { getRiderStats } from "./stats.controller.js";
import { protectRider } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRider, getRiderStats);

export default router;
