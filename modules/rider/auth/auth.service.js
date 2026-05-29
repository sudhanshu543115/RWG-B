import Otp from "../../../models/tourist/Otp.js";
import Rider from "../../../models/rider/Rider.js";
import { generateOtp } from "../../../core/otp.js";
import { generateToken } from "../../../core/token.js";
import { sendSMS } from "../../../core/sms.js";

export const sendRiderOtpService = async (phone) => {
    const otp = generateOtp();

    await Otp.create({
        phone,
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 min
    });

    await sendSMS(phone, `Your OTP is ${otp}`);

    return { phone, otp };
};

export const verifyRiderOtpService = async (phone, otp) => {
    const record = await Otp.findOne({ phone, otp });

    if (!record) {
        throw new Error("Invalid OTP");
    }

    if (record.expiresAt < Date.now()) {
        throw new Error("OTP expired");
    }

    let rider = await Rider.findOne({ phone });

    if (!rider) {
        rider = await Rider.create({ phone });
    }

    const token = generateToken(rider._id, "rider");
    await Otp.deleteMany({ phone });

    return {
        token,
        rider: {
            _id: rider._id,
            name: rider.name,
            phone: rider.phone,
            email: rider.email,
            city: rider.city,
            profileImage: rider.profileImage,
            vehicleType: rider.vehicleType,
            verificationStatus: rider.verificationStatus,
            profileCompleted: rider.profileCompleted,
            isVerified: rider.isVerified,
            rating: rider.rating,
            totalRides: rider.totalRides,
        },
        isProfileComplete: !!rider.profileCompleted,
        isVerified: !!rider.isVerified,
        verificationStatus: rider.verificationStatus
    };
};
