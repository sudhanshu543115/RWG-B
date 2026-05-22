import Notification from "../../models/Notification/Notification.js";
import { getIO } from "../../core/socket.events.js";

/**
 * Create a notification, save to DB, and push via socket in real-time
 */
export const createNotification = async ({
  recipientId,
  recipientRole,
  type,
  title,
  message,
  bookingId,
  metadata = {},
}) => {
  const notification = await Notification.create({
    recipientId,
    recipientRole,
    type,
    title,
    message,
    bookingId,
    metadata,
  });

  // Push in real-time via socket
  try {
    const io = getIO();
    const room =
      recipientRole === "admin"
        ? "admin"
        : `${recipientRole}:${recipientId}`;

    io.to(room).emit("new-notification", notification);
  } catch (err) {
    console.error("❌ Notification socket push error:", err.message);
  }

  return notification;
};

/**
 * Get all notifications for a user (paginated)
 */
export const getNotifications = async (recipientId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipientId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ recipientId }),
    Notification.countDocuments({ recipientId, isRead: false }),
  ]);

  return { notifications, total, unreadCount, page, limit };
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (notificationId, recipientId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipientId },
    { isRead: true },
    { new: true }
  );
};

/**
 * Mark ALL notifications as read for a user
 */
export const markAllAsRead = async (recipientId) => {
  return Notification.updateMany(
    { recipientId, isRead: false },
    { isRead: true }
  );
};
