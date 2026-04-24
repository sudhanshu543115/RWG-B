import express from "express";
import {
    getProfile,
    completeProfile,
    updateProfile,
    deleteProfile
} from "./profile.controller.js";
import { protectRider } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRider); // Only riders can access these routes

router.route("/")
    .get(getProfile)
    .post(completeProfile)
    .patch(updateProfile)
    .delete(deleteProfile);

export default router;
