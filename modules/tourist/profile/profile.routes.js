import express from "express";
import { getProfile, updateProfile, completeProfile, deleteProfile } from "./profile.controller.js";
import { protectTourist } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../config/cloudinary.js";

const router = express.Router();

router.use(protectTourist);

router.route("/")
    .get(getProfile)
    .post(upload.single("profileImage"), completeProfile)
   .patch(upload.single("profileImage"), updateProfile)
    .delete(deleteProfile);

export default router;
