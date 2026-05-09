import { getAdminEarningsService } from "./earnings.service.js";



export const getAdminEarnings = async (req, res) => {
    try {
        const data = await getAdminEarningsService();
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};