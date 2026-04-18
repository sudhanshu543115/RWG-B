import express from "express";
import { getProfile, updateProfile } from "./profile.controller.js";
import { protectTourist } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectTourist);

router.route("/")
    .get(getProfile)
    .put(updateProfile);

export default router;
