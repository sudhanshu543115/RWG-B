import {
    getRiderProfileService,
    completeRiderProfileService,
    updateRiderProfileService,
    deleteRiderProfileService,
    updateRiderStatusService
} from "./profile.service.js";
import sendEmail from "../../../core/mailer.js";
import path from "path";
import fs from "fs";

// Helper function to map Cloudinary files to profile data
const mapFilesToData = (files, data) => {
    const fileFields = [
        'profileImage', 'aadhaarImage', 'licenseImage', 
        'rcImage', 'insuranceImage', 'vehicleImage', 'selfieImage'
    ];

    fileFields.forEach(field => {
        if (files && files[field] && files[field][0]) {
            data[field] = files[field][0].path; // Cloudinary URL
        }
    });
};

export const getProfile = async (req, res) => {
    try {
        const profile = await getRiderProfileService(req.user._id);
        return res.status(200).json({
            success: true,
            message: "Rider profile retrieved successfully.",
            data: profile
        });
    } catch (error) {
        console.error("Error in getProfile (Rider):", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch rider profile."
        });
    }
};
export const completeProfile = async (req, res) => {
    try {
        const profileData = { ...req.body };

        // 📦 Map uploaded files
        mapFilesToData(req.files, profileData);

        const result = await completeRiderProfileService(req.user._id, profileData);

        console.log("📌 PROFILE RESULT =>", result);

        // 🧠 Decide email
        const emailToSend = result?.email || req.user?.email;

        console.log("📧 RESULT EMAIL =>", result?.email);
        console.log("📧 USER EMAIL =>", req.user?.email);
        console.log("📧 FINAL EMAIL =>", emailToSend);

        // 🚨 If no email → skip safely
        if (!emailToSend || emailToSend.trim() === "") {
            console.log("❌ NO EMAIL FOUND → MAIL SKIPPED");
        } else {

            // 📦 Logo Attachment
            const logoPath = path.join(process.cwd(), "public", "logo.png");

            console.log("🖼 LOGO EXISTS =>", fs.existsSync(logoPath));

            const attachments = fs.existsSync(logoPath)
                ? [{
                    filename: "logo.png",
                    path: logoPath,
                    cid: "rwg-logo"
                }]
                : [];

            const html = `
            <div style="margin:0;padding:0;background:#F5F4F0;font-family:Arial;">
                <div style="max-width:600px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;">
                    
                    <div style="background:#F59000;padding:20px;text-align:center;color:#fff;">
                        ${attachments.length ? '<img src="cid:rwg-logo" width="70"/>' : ''}
                        <h2>Ride With Guide</h2>
                        <p>Profile Under Review ⏳</p>
                    </div>

                    <div style="padding:30px;">
                        <h3>Hello ${result?.name || "Rider"} 👋</h3>

                        <p>Your profile has been successfully submitted.</p>

                        <div style="background:#FFF3E0;padding:15px;border-left:4px solid #F59000;margin:20px 0;">
                            Our admin team is reviewing your profile. This usually takes 24–48 hours.
                        </div>

                        <p><strong>Email:</strong> ${emailToSend}</p>
                        <p><strong>Phone:</strong> ${result?.phone || "N/A"}</p>

                        <p style="margin-top:20px;">
                            You will receive another email once approved 🚀
                        </p>
                    </div>

                    <div style="background:#000;color:#aaa;text-align:center;padding:10px;">
                        © ${new Date().getFullYear()} Ride With Guide
                    </div>
                </div>
            </div>
            `;

            try {
                console.log("🚀 SENDING EMAIL TO:", emailToSend);

                await sendEmail(
                    emailToSend,
                    "Your Profile is Under Review | Ride With Guide",
                    html,
                    attachments
                );

                console.log("✅ EMAIL SENT SUCCESS");
            } catch (emailError) {
                console.error("❌ EMAIL ERROR FULL:", emailError);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Rider profile completed successfully.",
            data: result
        });

    } catch (error) {
        console.error("❌ ERROR in completeProfile:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to complete rider profile."
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const profileData = { ...req.body };

        // Map uploaded files if any new ones are uploaded
        mapFilesToData(req.files, profileData);

        const result = await updateRiderProfileService(req.user._id, profileData);
        return res.status(200).json({
            success: true,
            message: "Rider profile updated successfully.",
            data: result
        });
    } catch (error) {
        console.error("Error in updateProfile (Rider):", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update rider profile."
        });
    }
};

export const deleteProfile = async (req, res) => {
    try {
        await deleteRiderProfileService(req.user._id);
        return res.status(200).json({
            success: true,
            message: "Rider profile deleted successfully."
        });
    } catch (error) {
        console.error("Error in deleteProfile (Rider):", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to delete rider profile."
        });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { isOnline } = req.body;
        
        if (typeof isOnline !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isOnline status (boolean) is required."
            });
        }

        const result = await updateRiderStatusService(req.user._id, isOnline);
        return res.status(200).json({
            success: true,
            message: `Rider is now ${isOnline ? "online" : "offline"}.`,
            data: { isOnline: result.isOnline }
        });
    } catch (error) {
        console.error("Error in updateStatus (Rider):", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update status."
        });
    }
};

