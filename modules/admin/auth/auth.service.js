import Admin from "../../../models/admin/Admin.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../config/env.js";

export const registerAdminService = async (adminData) => {
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) throw new Error("Admin with this email already exists.");

    const admin = new Admin(adminData);
    await admin.save();
    return admin;
};

export const loginAdminService = async (email, password) => {
    const admin = await Admin.findOne({ email });
    if (!admin) throw new Error("Invalid email or password.");

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) throw new Error("Invalid email or password.");

    const token = jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
    return { admin, token };
};
