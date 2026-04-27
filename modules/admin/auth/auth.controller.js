import { registerAdminService, loginAdminService } from "./auth.service.js";


export const registerAdmin = async (req, res) => {
    try {
        const admin = await registerAdminService(req.body);
        res.status(201).json({ success: true, data: admin });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { admin, token } = await loginAdminService(email, password);

        // Optional: Set cookie
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

        res.status(200).json({ success: true, token, data: admin });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
