import PlatformConfig from "../../../models/admin/PlatformConfig.js";
import { geocodeLocation } from "../../../core/geocodeLocation.js";

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
    const { name, duration, category, lat, lng } = req.body;

    if (!name || !duration || !category) {
      return res.status(400).json({
        success: false,
        message: "name, duration, and category are required"
      });
    }

    const config = await PlatformConfig.findOne().sort({ createdAt: -1 });

    if (!config) {
      throw new Error("Config not found");
    }

    // Find city name
    const city = config.CITIES.find(c => c.id === cityId);

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found"
      });
    }

    // Use coordinates from request body (map picker) if provided,
    // otherwise fall back to geocoding
    let finalLat = lat;
    let finalLng = lng;

    if (!finalLat || !finalLng) {
      const coordinates = await geocodeLocation(name, city.name);
      if (!coordinates) {
        return res.status(400).json({
          success: false,
          message: "Unable to fetch coordinates. Please select a location on the map."
        });
      }
      finalLat = coordinates.lat;
      finalLng = coordinates.lng;
    }

    const newStop = {
      name,
      duration,
      category,
      lat: finalLat,
      lng: finalLng
    };

    let stops = config.CITY_STOPS.get(cityId) || [];

    stops.push(newStop);

    config.CITY_STOPS.set(cityId, stops);
    config.markModified('CITY_STOPS');

    await config.save();

    res.status(200).json({
      success: true,
      data: stops
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
  
};

export const deleteStopFromCity = async (req, res) => {
  try {
    const { cityId } = req.params;
    const stopName = decodeURIComponent(req.params.stopName);

    if (!stopName || !cityId) {
      return res.status(400).json({ success: false, message: "cityId and stopName are required" });
    }

    console.log(`[DELETE STOP] cityId="${cityId}", stopName="${stopName}"`);

    const config = await PlatformConfig.findOne().sort({ createdAt: -1 });
    if (!config) throw new Error("Config not found");

    let stops = config.CITY_STOPS.get(cityId) || [];
    const originalLength = stops.length;
    stops = stops.filter(s => s.name !== stopName);

    if (stops.length === originalLength) {
      return res.status(404).json({ success: false, message: `Stop "${stopName}" not found in ${cityId}` });
    }

    config.CITY_STOPS.set(cityId, stops);
    config.markModified('CITY_STOPS');

    await config.save();
    res.status(200).json({ success: true, message: "Stop removed", data: stops });
  } catch (error) {
    console.error("[DELETE STOP ERROR]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



