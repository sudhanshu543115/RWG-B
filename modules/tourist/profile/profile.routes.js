import express from "express";
import { getProfile, updateProfile, completeProfile, deleteProfile } from "./profile.controller.js";
import { protectTourist } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectTourist);

router.route("/")
    .get(getProfile)
    .post(completeProfile)
    .patch(updateProfile)
    .delete(deleteProfile);

export default router;
