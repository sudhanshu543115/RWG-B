import { getRiderStatsService } from "./stats.service.js";

export const getRiderStats = async (req, res) => {
    try {
        const stats = await getRiderStatsService(req.user._id);
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
