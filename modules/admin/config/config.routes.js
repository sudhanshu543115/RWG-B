import { 
  getPlatformConfig, 
  updatePlatformConfig, 
  addCity, 
  updateCity,
  deleteCity, 
  addStopToCity, 
  deleteStopFromCity 
} from "./config.controller.js";
import { protectAdmin } from "../../../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

// GET is public
router.get("/", getPlatformConfig);

// Admin protected routes for entire config
router.put("/", protectAdmin, updatePlatformConfig);
//router.post("/", protectAdmin, updatePlatformConfig);

// --- Specific City Management ---
router.post("/cities", protectAdmin, addCity);
router.put("/cities/:cityId", protectAdmin, updateCity);
router.delete("/cities/:cityId", protectAdmin, deleteCity);

// --- Specific Stop Management ---
router.post("/cities/:cityId/stops", protectAdmin, addStopToCity);
router.delete("/cities/:cityId/stops/:stopName", protectAdmin, deleteStopFromCity);

export default router;
