import express from "express";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notification.controller.js";

const router = express.Router();

// GET  /api/notifications         → Get all my notifications (paginated)
router.get("/", getMyNotifications);

// PATCH /api/notifications/:id/read → Mark single notification read
router.patch("/:id/read", markNotificationRead);

// PATCH /api/notifications/read-all → Mark ALL notifications read
router.patch("/read-all", markAllNotificationsRead);

export default router;
