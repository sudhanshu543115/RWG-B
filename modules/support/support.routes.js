import {
  createSupportQuery,
  getUserQueries,
  getAllQueries,
  updateQueryStatus,
  deleteQuery
} from "./support.controller.js";
import express from "express";
import { protectTourist } from "../../middleware/auth.middleware.js";
import { protectRider } from "../../middleware/auth.middleware.js";
import { protectAdmin } from "../../middleware/auth.middleware.js";
import { protectAny } from "../../middleware/auth.middleware.js";

const router = express.Router();

// User routes (Tourist and Rider)
router.post("/", protectAny, createSupportQuery);
router.get("/my-queries", protectAny, getUserQueries);

 
// Admin routes
router.get("/admin", protectAdmin, getAllQueries);
router.patch("/admin/:id", protectAdmin, updateQueryStatus);
router.delete("/admin/:id", protectAdmin, deleteQuery);

export default router;
