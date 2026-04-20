import { sendOtpService, verifyOtpService } from "./auth.service.js";

export const sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, message: "Please provide a valid phone number." });
        }

        const result = await sendOtpService(phone);
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully.",
            data: result
        });
    } catch (error) {
        console.error("Error in sendOtp:", error);
        return res.status(400).json({ // Assuming most service errors are validation errors
            success: false,
            message: error.message || "An unexpected error occurred while sending OTP.",
        });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: "Both phone number and OTP are required to verify." });
        }

        const data = await verifyOtpService(phone, otp);
        return res.status(200).json({
            success: true,
            message: "OTP verified successfully.",
            data: data
        });
    } catch (error) {
        console.error("Error in verifyOtp:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "An unexpected error occurred while verifying the OTP.",
        });
    }
};