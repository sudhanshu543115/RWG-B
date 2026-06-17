import {
    getRiderProfileService,
    completeRiderProfileService,
    updateRiderProfileService,
    deleteRiderProfileService,
    updateRiderStatusService
} from "./profile.service.js";
import { sendRiderProfileUnderReviewEmail } from "../../../core/riderProfileEmails.js";

const mapFilesToData = (files, data) => {
    const fileFields = [
        "profileImage",
        "aadhaarImage",
        "licenseImage",
        "rcImage",
        "insuranceImage",
        "vehicleImage",
        "selfieImage"
    ];

    fileFields.forEach((field) => {
        if (files?.[field]?.[0]) {
            data[field] = files[field][0].path;
        }
    });
};

const sendUnderReviewEmailSafely = async (rider, fallbackEmail = "") => {
    try {
        const riderForMail = {
            ...(rider?.toObject ? rider.toObject() : rider),
            email: rider?.email || fallbackEmail || "",
        };
        return await sendRiderProfileUnderReviewEmail(riderForMail);
    } catch (error) {
        console.error("Failed to send rider profile under-review email:", error.message);
        return { sent: false, error: error.message };
    }
};

export const getProfile = async (req, res) => {
    try {
        const profile = await getRiderProfileService(req.user._id);
        return res.status(200).json({
            success: true,
            message: "Rider profile retrieved successfully.",
            data: profile
        });
    } catch (error) {
        console.error("Error in getProfile (Rider):", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch rider profile."
        });
    }
};

export const completeProfile = async (req, res) => {
    try {
        const profileData = { ...req.body };
        mapFilesToData(req.files, profileData);

        const result = await completeRiderProfileService(req.user._id, profileData);
        const emailResult = await sendUnderReviewEmailSafely(
            result,
            req.user?.email || profileData.email
        );

        return res.status(200).json({
            success: true,
            message: "Rider profile completed successfully.",
            data: result,
            email: emailResult
        });
    } catch (error) {
        console.error("Error in completeProfile (Rider):", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to complete rider profile."
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const profileData = { ...req.body };
        mapFilesToData(req.files, profileData);

        const result = await updateRiderProfileService(req.user._id, profileData);
        let emailResult = null;

        if (result?.$locals?.profileJustCompleted) {
            emailResult = await sendUnderReviewEmailSafely(
                result,
                req.user?.email || profileData.email
            );
        }

        return res.status(200).json({
            success: true,
            message: "Rider profile updated successfully.",
            data: result,
            ...(emailResult ? { email: emailResult } : {})
        });
    } catch (error) {
        console.error("Error in updateProfile (Rider):", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update rider profile."
        });
    }
};

export const deleteProfile = async (req, res) => {
    try {
        await deleteRiderProfileService(req.user._id);
        return res.status(200).json({
            success: true,
            message: "Rider profile deleted successfully."
        });
    } catch (error) {
        console.error("Error in deleteProfile (Rider):", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to delete rider profile."
        });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { isOnline } = req.body;

        if (typeof isOnline !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isOnline status (boolean) is required."
            });
        }

        const result = await updateRiderStatusService(req.user._id, isOnline);
        return res.status(200).json({
            success: true,
            message: `Rider is now ${isOnline ? "online" : "offline"}.`,
            data: { isOnline: result.isOnline }
        });
    } catch (error) {
        console.error("Error in updateStatus (Rider):", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update status."
        });
    }
};
