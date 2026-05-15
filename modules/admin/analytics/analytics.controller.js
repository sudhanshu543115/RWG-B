import { getOverviewStatsService } from "./analytics.service.js";

export const getOverviewStats = async (req, res) => {
    try {
        const data = await getOverviewStatsService();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Error in getOverviewStats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch overview stats",
            error: error.message
        });
    }
};
