import User from "../../../models/tourist/User.js";

export const getTouristProfileService = async (userId) => {
    const user = await User.findById(userId).select("-__v");
    if (!user) {
        throw new Error("Tourist profile not found.");
    }
    return user;
};

export const updateTouristProfileService = async (userId, dataPayload) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("Tourist profile not found.");
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
