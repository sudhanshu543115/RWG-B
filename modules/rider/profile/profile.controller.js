import {
    getRiderProfileService,
    completeRiderProfileService,
    updateRiderProfileService,
    deleteRiderProfileService
} from "./profile.service.js";

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
        const updatedProfile = await completeRiderProfileService(req.user._id, req.body);
        return res.status(200).json({
            success: true,
            message: "Rider profile completed successfully.",
            data: updatedProfile
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
        const updatedProfile = await updateRiderProfileService(req.user._id, req.body);
        return res.status(200).json({
            success: true,
            message: "Rider profile updated successfully.",
            data: updatedProfile
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

