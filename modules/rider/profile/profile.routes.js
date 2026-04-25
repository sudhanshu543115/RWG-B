import express from "express";
import {
    getProfile,
    completeProfile,
    updateProfile,
    deleteProfile
} from "./profile.controller.js";
import { protectRider } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../config/cloudinary.js";

const router = express.Router();

router.use(protectRider); // Only riders can access these routes

router.route("/")
    .get(getProfile)
    .post(upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aadhaarImage', maxCount: 1 },
    { name: 'licenseImage', maxCount: 1 },
    { name: 'rcImage', maxCount: 1 },
    { name: 'insuranceImage', maxCount: 1 },
    { name: 'vehicleImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 }
]), completeProfile)
    .patch(upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aadhaarImage', maxCount: 1 },
    { name: 'licenseImage', maxCount: 1 },
    { name: 'rcImage', maxCount: 1 },
    { name: 'insuranceImage', maxCount: 1 },
    { name: 'vehicleImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 }
]), updateProfile)
    .delete(deleteProfile);

export default router;
