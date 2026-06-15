import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: function() { return this.recipientRole !== 'admin'; },
      index: true,
    },
    recipientRole: {
      type: String,
      enum: ["tourist", "rider", "admin"],
      required: true,
    },
    type: {
      type: String,
      enum: [
        "booking_created",
        "rider_assigned",
        "ride_started",
        "ride_completed",
        "payment_received",
        "booking_cancelled",
        "new_booking",
        "payout_processed",
        "payout_rejected",
        "rider_interested",
        "general",
        "emergency_sos"
      ],
      default: "general",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for fast queries: unread notifications for a user
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
