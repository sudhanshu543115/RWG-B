import PlatformConfig from "../../../models/admin/PlatformConfig.js";

export const getRiderCities = async (req, res) => {
  try {
    const config = await PlatformConfig.findOne().sort({ createdAt: -1 });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        cities: config.CITIES || [],
        languages: config.LANGUAGES || []
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
