import Rider from "../../../models/rider/Rider.js";


const checkProfileCompletion = (rider) => {
    return !!(
        rider.name && 
        rider.email && 
        rider.vehicleType && 
        rider.vehicleNumber && 
        rider.licenseNumber
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

    Object.assign(rider, profileData);

    
    rider.profileCompleted = checkProfileCompletion(rider);

    await rider.save();
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
