import Otp from "../../../models/tourist/Otp.js";
import User from "../../../models/tourist/User.js";
import { generateOtp } from "../../../core/otp.js";
import { sendSMS } from "../../../core/sms.js";
import { generateToken } from "../../../core/token.js";

export const sendOtpService = async (phone) => {
    const otp = generateOtp();

    await Otp.create({
        phone,
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 min
    });

    await sendSMS(phone, `Your OTP is ${otp}`);

    return { phone, otp };
};

export const verifyOtpService = async (phone, otp) => {
    const record = await Otp.findOne({ phone, otp });

    if (!record) {
        throw new Error("Invalid OTP");
    }

    if (record.expiresAt < Date.now()) {
        throw new Error("OTP expired");
    }

    let user = await User.findOne({ phone });

    if (!user) {
        user = await User.create({ phone });
    }

    const token = generateToken(user._id, "tourist");
    await Otp.deleteMany({ phone });

    return {
        token,
        isProfileComplete: !!user.name
    };
};