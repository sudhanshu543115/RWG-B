import sendEmail from "./mailer.js";

export const sendTouristRefundEmail = async (userEmail, refundAmount) => {
  if (!userEmail) {
    console.log("No tourist email provided. Skipping refund email.");
    return { sent: false, skipped: true, reason: "no_email" };
  }

  const subject = "Your Ride With Guide Refund is Processing";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #3b82f6; color: #fff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 24px;">Refund Processed</h2>
      </div>
      <div style="padding: 20px;">
        <p style="font-size: 16px;">Hello,</p>
        <p style="font-size: 16px;">
          Your recent booking cancellation has been confirmed, and your refund of 
          <strong>₹${refundAmount}</strong> has been successfully processed.
        </p>
        <p style="font-size: 16px; margin-top: 20px;">
          <strong>When will I get it?</strong><br/>
          Your refund has been initiated to your original payment method. Please allow up to <strong>1 hour</strong> for the funds to reflect in your account.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 14px; color: #777; text-align: center;">
          If you have any questions, feel free to contact our support team.<br/>
          Thank you for choosing Ride With Guide!
        </p>
      </div>
    </div>
  `;

  try {
    const result = await sendEmail(userEmail, subject, html);
    console.log("Tourist refund email sent to:", userEmail);
    return { sent: true, data: result };
  } catch (error) {
    console.error("Failed to send tourist refund email:", error.message);
    return { sent: false, error: error.message };
  }
};
