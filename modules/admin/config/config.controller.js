import PlatformConfig from "../../../models/admin/PlatformConfig.js";

export const getPlatformConfig = async (req, res) => {
  try {
    let config = await PlatformConfig.findOne().sort({ createdAt: -1 });
    if (!config) {
      return res.status(404).json({ success: false, message: "Configuration not found" });
    }
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePlatformConfig = async (req, res) => {
  try {
    let config = await PlatformConfig.findOne().sort({ createdAt: -1 });
    if (config) {
      config = await PlatformConfig.findByIdAndUpdate(config._id, req.body, { new: true });
    } else {
      config = new PlatformConfig(req.body);
      await config.save();
    }
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
