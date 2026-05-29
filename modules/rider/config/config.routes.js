import express from "express";
import { protectRider } from "../../../middleware/auth.middleware.js";
import { getRiderCities } from "./config.controller.js";

const router = express.Router();

router.get("/master-data", protectRider, getRiderCities);

export default router;
