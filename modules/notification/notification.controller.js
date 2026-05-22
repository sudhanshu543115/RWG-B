import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "./notification.service.js";

export const getMyNotifications = async (req, res) => {
  try {
    const recipientId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const data = await getNotifications(recipientId, page, limit);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch notifications.",
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await markAsRead(req.params.id, req.user._id);

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found." });
    }

    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark notification.",
    });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await markAllAsRead(req.user._id);
    return res
      .status(200)
      .json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark all notifications.",
    });
  }
};
