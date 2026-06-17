import Rider from "../../../models/rider/Rider.js";

// Refined helper to include vehicle model and license expiry
const checkProfileCompletion = (rider) => {
    return !!(
        rider.name && 
        rider.email && 
        rider.city &&
        rider.vehicleType && 
        rider.vehicleModel && // Added this
        rider.vehicleNumber && 
        rider.licenseNumber &&
        rider.licenseExpiry   // Added this
    );
};

export const completeRiderProfileService = async (userId, profileData) => {
    const rider = await Rider.findById(userId);
    if (!rider) throw new Error("Rider not found.");

    Object.assign(rider, profileData);
    rider.profileCompleted = checkProfileCompletion(rider);

    await rider.save();
    return rider;
};

export const updateRiderProfileService = async (userId, profileData) => {
    const rider = await Rider.findById(userId);
    if (!rider) throw new Error("Rider not found.");

    const wasProfileCompleted = !!rider.profileCompleted;

    Object.assign(rider, profileData);
    rider.profileCompleted = checkProfileCompletion(rider);

    await rider.save();
    rider.$locals.profileJustCompleted = !wasProfileCompleted && !!rider.profileCompleted;
    return rider;
};

export const getRiderProfileService = async (userId) => {
    const rider = await Rider.findById(userId);
    return rider;
};

export const deleteRiderProfileService = async (userId) => {
    const rider = await Rider.findByIdAndDelete(userId);
    return rider;
};

export const updateRiderStatusService = async (userId, isOnline) => {
    const rider = await Rider.findById(userId);
    if (!rider) throw new Error("Rider not found.");

    rider.isOnline = isOnline;
    await rider.save();
    return rider;
};

