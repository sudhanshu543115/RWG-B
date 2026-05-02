import { getAllRidersService, updateRiderStatusService, getPendingRidersService, deleteRiderService } from "./riders.service.js";
import sendEmail from "../../../core/mailer.js";
import path from "path";
import fs from "fs";

export const getAllRiders = async (req, res) => {
    try {
        const { status } = req.query;
        const riders = await getAllRidersService(status);
        res.status(200).json({ success: true, data: riders });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateRiderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const rider = await updateRiderStatusService(id, status);

        // Only send email if rider has an email
        if (rider && rider.email) {
            // 📦 Logo Attachment (optional)
            const logoPath = path.resolve("public/logo.png");
            const attachments = fs.existsSync(logoPath)
                ? [{
                    filename: "logo.png",
                    path: logoPath,
                    cid: "rwg-logo"
                }]
                : [];

            let subject = "";
            let html = "";

            // =========================
            // ✅ APPROVED EMAIL
            // =========================
            if (status === "approved") {
                subject = "🎉 Profile Approved | Ride With Guide";

                html = `
                <div style="background:#F5F4F0;padding:20px;font-family:Arial;">
                    <div style="max-width:600px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;">
                        
                        <div style="background:#4CAF50;padding:20px;text-align:center;color:#fff;">
                            ${attachments.length ? '<img src="cid:rwg-logo" width="70"/>' : ''}
                            <h2>Ride With Guide</h2>
                            <p>Profile Approved ✅</p>
                        </div>

                        <div style="padding:30px;">
                            <h3>Hello ${rider.name || "Rider"} 👋</h3>

                            <p>Your profile has been <strong style="color:green;">approved</strong> by our admin team.</p>

                            <div style="background:#E8F5E9;padding:15px;border-left:4px solid green;margin:20px 0;">
                                You can now start accepting bookings and using the platform.
                            </div>

                            <p><strong>Email:</strong> ${rider.email}</p>
                            <p><strong>Phone:</strong> ${rider.phone || "N/A"}</p>

                            <p style="margin-top:20px;">Welcome onboard 🚀</p>
                        </div>

                        <div style="background:#000;color:#aaa;text-align:center;padding:10px;">
                            © ${new Date().getFullYear()} Ride With Guide
                        </div>
                    </div>
                </div>
                `;
            }

            // =========================
            // ❌ REJECTED EMAIL
            // =========================
            else if (status === "rejected") {
                subject = "⚠️ Profile Rejected | Ride With Guide";

                html = `
                <div style="background:#F5F4F0;padding:20px;font-family:Arial;">
                    <div style="max-width:600px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;">
                        
                        <div style="background:#D32F2F;padding:20px;text-align:center;color:#fff;">
                            ${attachments.length ? '<img src="cid:rwg-logo" width="70"/>' : ''}
                            <h2>Ride With Guide</h2>
                            <p>Profile Rejected ❌</p>
                        </div>

                        <div style="padding:30px;">
                            <h3>Hello ${rider.name || "Rider"} 👋</h3>

                            <p>We regret to inform you that your profile has been 
                            <strong style="color:red;">rejected</strong> by our admin team.</p>

                            <div style="background:#FFEBEE;padding:15px;border-left:4px solid red;margin:20px 0;">
                                Please review your details and re-submit your profile with correct information.
                            </div>

                            <p>If you think this is a mistake, you can contact support.</p>
                        </div>

                        <div style="background:#000;color:#aaa;text-align:center;padding:10px;">
                            © ${new Date().getFullYear()} Ride With Guide
                        </div>
                    </div>
                </div>
                `;
            }

            // =========================
            // 📧 SEND EMAIL (only if template exists)
            // =========================
            if (subject && html) {
                try {
                    await sendEmail(rider.email, subject, html, attachments);
                } catch (emailError) {
                    console.error("Failed to send email:", emailError.message);
                    // Continue without failing the request
                }
            }
        }

        res.status(200).json({
            success: true,
            data: rider
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};



export const getPendingRiders = async (req, res) => {
    try {
        const riders = await getPendingRidersService();
        res.status(200).json({ success: true, data: riders });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


export const deleteRider = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteRiderService(id);
        res.status(200).json({ success: true, message: "Rider deleted successfully." });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

