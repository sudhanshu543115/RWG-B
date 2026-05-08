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

// --- City Management ---
export const addCity = async (req, res) => {
  try {
    const config = await PlatformConfig.findOne().sort({ createdAt: -1 });
    if (!config) throw new Error("Config not found");

    const newCity = req.body; // { id, name, demand, tagline, lat, lng }
    
    // Check if city ID already exists
    if (config.CITIES.some(c => c.id === newCity.id)) {
      return res.status(400).json({ success: false, message: "City ID already exists" });
    }

    config.CITIES.push(newCity);
    
    // Initialize empty stops for this city in CITY_STOPS map
    if (!config.CITY_STOPS) config.CITY_STOPS = new Map();
    config.CITY_STOPS.set(newCity.id, []);

    await config.save();
    res.status(200).json({ success: true, data: config.CITIES });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCity = async (req, res) => {
  try {
    const { cityId } = req.params;
    const config = await PlatformConfig.findOne().sort({ createdAt: -1 });
    if (!config) throw new Error("Config not found");

    config.CITIES = config.CITIES.filter(c => c.id !== cityId);
    
    // Also remove stops for this city
    if (config.CITY_STOPS && config.CITY_STOPS.has(cityId)) {
      config.CITY_STOPS.delete(cityId);
    }

    await config.save();
    res.status(200).json({ success: true, message: "City deleted successfully", data: config.CITIES });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Stop Management ---
export const addStopToCity = async (req, res) => {
  try {
    const { cityId } = req.params;
    const newStop = req.body; // { name, duration, category, lat, lng }
    
    const config = await PlatformConfig.findOne().sort({ createdAt: -1 });
    if (!config) throw new Error("Config not found");

    // Get the current stops for the city
    let stops = config.CITY_STOPS.get(cityId) || [];
    stops.push(newStop);
    
    // Update the map
    config.CITY_STOPS.set(cityId, stops);

    await config.save();
    res.status(200).json({ success: true, data: stops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStopFromCity = async (req, res) => {
  try {
    const { cityId, stopName } = req.params;
    
    const config = await PlatformConfig.findOne().sort({ createdAt: -1 });
    if (!config) throw new Error("Config not found");

    let stops = config.CITY_STOPS.get(cityId) || [];
    stops = stops.filter(s => s.name !== stopName);
    
    config.CITY_STOPS.set(cityId, stops);

    await config.save();
    res.status(200).json({ success: true, message: "Stop removed", data: stops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



