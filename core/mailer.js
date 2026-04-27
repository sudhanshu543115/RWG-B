import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, html, attachments = []) => {
    console.log("EMAIL RECEIVER =>", to);

    if (!to) {
        throw new Error("Recipient email missing");
    }

    const mailOptions = {
        from: `"Ride With Guide" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    };

    if (attachments.length > 0) {
        mailOptions.attachments = attachments;
    }

    await transporter.sendMail(mailOptions);
};

export default sendEmail;