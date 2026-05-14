import { getRiderEarningsService,  } from "./earnings.service.js";

export const getRiderEarnings = async (req, res) => {
    try {
        const data = await getRiderEarningsService(req.user._id);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


export const insertRiderEarning = async (req, res) => {
    try {
        const data = await insertRiderEarningService(req.user._id, req.body);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
