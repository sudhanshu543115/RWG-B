import {
  getTouristProfileService,
  updateTouristProfileService,
  completeTouristProfileService,
  deleteTouristProfileService
} from "./profile.service.js";

export const getProfile = async (req, res) => {
  try {
    const profile = await getTouristProfileService(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: profile
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


export const completeProfile = async (req, res) => {
  try {

    const dataPayload = req.body;

    if (req.file) {
      dataPayload.profileImage = req.file.path;
    }

    const updatedProfile =
      await completeTouristProfileService(req.user._id, dataPayload);

    return res.status(200).json({
      success: true,
      message: "Profile completed successfully",
      data: updatedProfile
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


export const updateProfile = async (req, res) => {
  try {

    const dataPayload = req.body;   // ✅ FIX

    if (req.file) {
      dataPayload.profileImage = req.file.path;
    }

    const updatedProfile =
      await updateTouristProfileService(req.user._id, dataPayload);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


export const deleteProfile = async (req, res) => {
  try {

    const deletedProfile =
      await deleteTouristProfileService(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
      data: deletedProfile
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};