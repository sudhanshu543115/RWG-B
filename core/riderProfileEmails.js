import fs from "fs";
import path from "path";
import sendEmail from "./mailer.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getLogoAttachments = () => {
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  if (!fs.existsSync(logoPath)) return [];

  return [
    {
      filename: "logo.png",
      path: logoPath,
      cid: "rwg-logo",
    },
  ];
};

const buildEmailShell = ({ color, title, subtitle, rider, body }) => {
  const attachments = getLogoAttachments();
  const riderName = escapeHtml(rider?.name || "Rider");
  const riderEmail = escapeHtml(rider?.email || "");
  const riderPhone = escapeHtml(rider?.phone || "N/A");

  return {
    attachments,
    html: `
      <div style="margin:0;padding:24px;background:#F5F4F0;font-family:Arial,Helvetica,sans-serif;color:#1A1918;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #eee;">
          <div style="background:${color};padding:26px 24px;text-align:center;color:#ffffff;">
            ${attachments.length ? '<img src="cid:rwg-logo" width="72" alt="Ride With Guide" style="margin:0 auto 10px;display:block;" />' : ""}
            <h1 style="margin:0;font-size:24px;line-height:1.2;">Ride With Guide</h1>
            <p style="margin:8px 0 0;font-size:14px;opacity:.92;">${subtitle}</p>
          </div>

          <div style="padding:30px 28px;">
            <h2 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:#1A1918;">Hello ${riderName},</h2>
            ${body}

            <div style="margin-top:24px;padding:16px;border-radius:14px;background:#FAF9F6;border:1px solid #ECE8DD;">
              <p style="margin:0 0 8px;font-size:13px;"><strong>Email:</strong> ${riderEmail || "N/A"}</p>
              <p style="margin:0;font-size:13px;"><strong>Phone:</strong> ${riderPhone}</p>
            </div>
          </div>

          <div style="background:#111111;color:#b8b8b8;text-align:center;padding:14px;font-size:12px;">
            ${escapeHtml(title)} - ${new Date().getFullYear()} Ride With Guide
          </div>
        </div>
      </div>
    `,
  };
};

const sendRiderEmail = async ({ rider, subject, color, title, subtitle, body }) => {
  const to = rider?.email?.trim();
  if (!to) {
    return { sent: false, skipped: true, reason: "missing_rider_email" };
  }

  const { html, attachments } = buildEmailShell({
    color,
    title,
    subtitle,
    rider,
    body,
  });

  await sendEmail(to, subject, html, attachments);
  return { sent: true, to };
};

export const sendRiderProfileUnderReviewEmail = async (rider) => {
  return sendRiderEmail({
    rider,
    subject: "Your Profile is Under Review | Ride With Guide",
    color: "#F59000",
    title: "Profile Under Review",
    subtitle: "Your rider profile has been submitted",
    body: `
      <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#4A4840;">
        Your rider profile has been submitted successfully and is now under admin review.
      </p>
      <div style="background:#FFF3E0;padding:16px;border-left:4px solid #F59000;margin:20px 0;border-radius:10px;">
        <p style="margin:0;font-size:14px;line-height:1.6;color:#4A4840;">
          Our team usually reviews profiles within 24 to 48 hours. You will receive another email after approval or rejection.
        </p>
      </div>
    `,
  });
};

export const sendRiderVerificationDecisionEmail = async (rider, status) => {
  if (status === "approved") {
    return sendRiderEmail({
      rider,
      subject: "Profile Approved | Ride With Guide",
      color: "#16A34A",
      title: "Profile Approved",
      subtitle: "Your rider account is active",
      body: `
        <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#4A4840;">
          Your profile has been approved by our admin team.
        </p>
        <div style="background:#E8F5E9;padding:16px;border-left:4px solid #16A34A;margin:20px 0;border-radius:10px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#4A4840;">
            You can now go online, accept bookings, and start using Ride With Guide as a verified rider.
          </p>
        </div>
      `,
    });
  }

  if (status === "rejected") {
    return sendRiderEmail({
      rider,
      subject: "Profile Rejected | Ride With Guide",
      color: "#DC2626",
      title: "Profile Rejected",
      subtitle: "Your rider profile needs attention",
      body: `
        <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#4A4840;">
          Your profile has been rejected by our admin team after review.
        </p>
        <div style="background:#FFEBEE;padding:16px;border-left:4px solid #DC2626;margin:20px 0;border-radius:10px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#4A4840;">
            Please review your details and documents, then contact support or resubmit correct information where required.
          </p>
        </div>
      `,
    });
  }

  return { sent: false, skipped: true, reason: "unsupported_status" };
};
