import User from "../../../models/tourist/User.js";

export const getTouristProfileService = async (userId) => {
    const user = await User.findById(userId).select("-__v");
    if (!user) {
        throw new Error("Tourist profile not found.");
    }
    return user;
};

// Helper to handle all profile updates
const performUpdate = async (userId, dataPayload = {}) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("Tourist profile not found.");
    }

    if (!dataPayload || typeof dataPayload !== 'object' || Object.keys(dataPayload).length === 0) {
        throw new Error("Request body is empty or invalid. Please ensure you are sending JSON data and the Content-Type is set to application/json.");
    }

    const updatableFields = ["name", "email", "nationality", "preferredLanguage", "bio", "gender"];
    let isUpdated = false;

    updatableFields.forEach((field) => {
        if (dataPayload[field] !== undefined) {
            user[field] = dataPayload[field];
            isUpdated = true;
        }
    });

    if (user.name && user.email) {
        user.profileCompleted = true;
    }

    if (isUpdated) {
        await user.save();
    }

    return user;
};

export const completeTouristProfileService = async (userId, dataPayload) => {
    return await performUpdate(userId, dataPayload);
};

export const updateTouristProfileService = async (userId, dataPayload) => {
    return await performUpdate(userId, dataPayload);
};

export const deleteTouristProfileService = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("Tourist profile not found.");
    }
    await user.deleteOne();
    return user;
};
