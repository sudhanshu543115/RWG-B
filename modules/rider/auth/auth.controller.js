import { sendRiderOtpService, verifyRiderOtpService } from "./auth.service.js";

export const sendRiderOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        const result = await sendRiderOtpService(phone);
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully.",
            data: result
        });
    } catch (error) {
        console.error("Error in sendRiderOtp:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to send OTP."
        });
    }
};

export const verifyRiderOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const result = await verifyRiderOtpService(phone, otp);

        const cookieOptions = {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        return res
            .status(200)
            .cookie("token", result.token, cookieOptions)
            .json({
                success: true,
                message: "OTP verified successfully.",
                data: result
            });
    } catch (error) {
        console.error("Error in verifyRiderOtp:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to verify OTP."
        });
    }
};
