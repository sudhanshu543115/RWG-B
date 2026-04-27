import Rider from "../../../models/rider/Rider.js";

export const getAllRidersService = async (status) => {
    const query = status ? { verificationStatus: status } : {};
    return await Rider.find(query).sort({ createdAt: -1 });
};

export const updateRiderStatusService = async (id, status) => {
    return await Rider.findByIdAndUpdate(
        id, 
        { verificationStatus: status, isVerified: status === "approved" }, 
        { new: true }
    );
};

export const getPendingRidersService = async () => {
    return await Rider.find({ 
        isVerified: false
    }).sort({ createdAt: -1 });
};

export const deleteRiderService = async (id) => {
    return await Rider.findByIdAndDelete(id);
};

