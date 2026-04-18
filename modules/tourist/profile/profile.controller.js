import { getTouristProfileService, updateTouristProfileService } from "./profile.service.js";

export const getProfile = async (req, res) => {
    try {
        const profile = await getTouristProfileService(req.user._id);

        return res.status(200).json({
            success: true,
            message: "Profile retrieved successfully",
            data: profile
        });
    } catch (error) {
        console.error("Error in getProfile:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch profile."
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const updatedProfile = await updateTouristProfileService(req.user._id, req.body);

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedProfile
        });
    } catch (error) {
        console.error("Error in updateProfile:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update profile details."
        });
    }
};
