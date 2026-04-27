import {
    getRiderProfileService,
    completeRiderProfileService,
    updateRiderProfileService,
    deleteRiderProfileService
} from "./profile.service.js";
import sendEmail from "../../../core/mailer.js";
import path from "path";

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
        
        // Map uploaded files to the profile data
        mapFilesToData(req.files, profileData);

        const result = await completeRiderProfileService(req.user._id, profileData);

        const logoPath = path.join(process.cwd(), "logo.png");

        // Send email to rider
        await sendEmail(
            result.email || req.user.email,
            "Your Profile is Under Review 🚴‍♂️ | Ride With Guide",
            `
            <div style="margin:0;padding:0;background:#F5F4F0;font-family:'DM Sans',Arial,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 15px;background:#F5F4F0;">
                    <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.06);">
                                <!-- Header -->
                                <tr>
                                    <td style="background:linear-gradient(135deg, #FFC15E 0%, #F59000 55%, #E07200 100%);padding:25px 20px;text-align:center;">
                                        <img src="cid:rwg-logo" alt="Ride With Guide" width="80" style="display:block;margin:0 auto 12px; border-radius: 8px;">
                                        <h1 style="margin:0;font-size:24px;color:#ffffff;font-family:'Syne',Arial,sans-serif;font-weight:700;letter-spacing:-0.5px;">
                                            Ride With Guide
                                        </h1>
                                        <p style="margin:6px 0 0;color:#FFF7E8;font-size:15px;font-weight:500;">
                                            Rider Profile Verification Update
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Body -->
                                <tr>
                                    <td style="padding:40px 35px;">
                                        <h2 style="margin:0 0 20px;color:#1A1918;font-size:24px;font-family:'Syne',Arial,sans-serif;">
                                            Hello ${result.name || "Rider"} 👋
                                        </h2>
                                        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#5C5A55;">
                                            Thank you for completing your rider profile with <strong style="color:#1A1918;">Ride With Guide</strong>.
                                        </p>
                                        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#5C5A55;">
                                            Your profile has been successfully submitted and is currently:
                                        </p>
                                        
                                        <!-- Status Box -->
                                        <div style="margin:0 0 30px;padding:20px;background:#FFF7E8;border-left:4px solid #F59000;border-radius:12px;">
                                            <h3 style="margin:0 0 8px;color:#B85A00;font-size:18px;font-family:'Syne',Arial,sans-serif;">
                                                ⏳ Under Review
                                            </h3>
                                            <p style="margin:0;color:#8F4500;font-size:15px;line-height:1.5;">
                                                Our admin team is reviewing your documents and profile details. This process usually takes 24-48 hours.
                                            </p>
                                        </div>
                                        
                                        <!-- Details Section -->
                                        <div style="margin:0 0 30px;background:#F5F4F0;padding:24px;border-radius:16px;border:1px solid #E2E0D9;">
                                            <h3 style="margin:0 0 16px;color:#1A1918;font-size:18px;font-family:'Syne',Arial,sans-serif;">
                                                Your Submitted Details
                                            </h3>
                                            
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding:8px 0;border-bottom:1px solid #E2E0D9;">
                                                        <span style="color:#9B9890;font-size:14px;display:block;margin-bottom:4px;">Name</span>
                                                        <strong style="color:#3A3832;font-size:15px;">${result.name || "Not Provided"}</strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:8px 0;border-bottom:1px solid #E2E0D9;">
                                                        <span style="color:#9B9890;font-size:14px;display:block;margin-bottom:4px;">Email</span>
                                                        <strong style="color:#3A3832;font-size:15px;">${result.email || req.user.email || "Not Provided"}</strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:8px 0;border-bottom:1px solid #E2E0D9;">
                                                        <span style="color:#9B9890;font-size:14px;display:block;margin-bottom:4px;">Phone</span>
                                                        <strong style="color:#3A3832;font-size:15px;">${result.phone || "Not Provided"}</strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:8px 0;border-bottom:1px solid #E2E0D9;">
                                                        <span style="color:#9B9890;font-size:14px;display:block;margin-bottom:4px;">Nationality</span>
                                                        <strong style="color:#3A3832;font-size:15px;">${result.nationality || "Not Provided"}</strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:8px 0;border-bottom:1px solid #E2E0D9;">
                                                        <span style="color:#9B9890;font-size:14px;display:block;margin-bottom:4px;">Preferred Language</span>
                                                        <strong style="color:#3A3832;font-size:15px;">${result.preferredLanguage || "Not Provided"}</strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:8px 0;">
                                                        <span style="color:#9B9890;font-size:14px;display:block;margin-bottom:4px;">Gender</span>
                                                        <strong style="color:#3A3832;font-size:15px;">${result.gender || "Not Provided"}</strong>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                        
                                        <!-- Info -->
                                        <p style="margin:0 0 30px;font-size:15px;line-height:1.6;color:#5C5A55;">
                                            Once your profile is approved, you will receive another confirmation email.
                                        </p>
                                        
                                        <!-- Footer Message -->
                                        <div style="padding:20px;background:#F5F4F0;border-radius:12px;text-align:center;">
                                            <p style="margin:0;color:#1A1918;font-size:15px;line-height:1.5;font-weight:500;">
                                                Thank you for choosing Ride With Guide.<br>
                                                <span style="color:#F59000;">We're excited to have you onboard 🚀</span>
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="background:#0E0D0C;padding:24px;text-align:center;">
                                        <p style="margin:0 0 8px;color:#C8C4B8;font-size:14px;">
                                            © ${new Date().getFullYear()} Ride With Guide Team
                                        </p>
                                        <p style="margin:0;color:#5C5A55;font-size:12px;">
                                            This is an automated message. Please do not reply.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>
            `,
            [{
                filename: 'logo.png',
                path: logoPath,
                cid: 'rwg-logo'
            }]
        );
        return res.status(200).json({
            success: true,
            message: "Rider profile completed successfully.",
            data: result
        });
    } catch (error) {
        console.error("Error in completeProfile (Rider):", error);
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
