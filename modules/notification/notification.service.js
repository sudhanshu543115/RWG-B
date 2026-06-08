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
 * Get all notifications based on query (paginated)
 */
export const getNotifications = async (query, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ ...query, isRead: false }),
  ]);

  return { notifications, total, unreadCount, page, limit };
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (notificationId, query) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, ...query },
    { isRead: true },
    { new: true }
  );
};

/**
 * Mark ALL notifications as read
 */
export const markAllAsRead = async (query) => {
  return Notification.updateMany(
    { ...query, isRead: false },
    { isRead: true }
  );
};
