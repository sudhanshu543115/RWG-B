import User from "../../../models/tourist/User.js";

// GET ALL TOURISTS
export const getAllTouristsService = async (query) => {
    const filter = {};

    // optional filters
    if (query.profileCompleted !== undefined) {
        filter.profileCompleted = query.profileCompleted === "true";
    }

    return await User.find(filter).sort({ createdAt: -1 });
};

// GET PENDING TOURISTS
export const getPendingTouristsService = async () => {
    return await User.find({ profileCompleted: false }).sort({ createdAt: -1 });
};

// GET BY ID
export const getTouristByIdService = async (id) => {
    return await User.findById(id);
};

// UPDATE TOURIST
export const updateTouristService = async (id, data) => {
    return await User.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
    );
};

// DELETE TOURIST
export const deleteTouristService = async (id) => {
    return await User.findByIdAndDelete(id);
};