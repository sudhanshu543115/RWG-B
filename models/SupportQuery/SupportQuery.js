import mongoose from "mongoose";

const supportQuerySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userRole",
      index: true,
    },
    userRole: {
      type: String,
      enum: ["Tourist", "Rider"],
      required: true,
    },
    userName: { type: String, required: true },
    userPhone: { type: String },
    userEmail: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ["booking", "payment", "ride", "account", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    adminReply: { type: String, default: "" },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { timestamps: true }
);

supportQuerySchema.index({ status: 1, createdAt: -1 });
supportQuerySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("SupportQuery", supportQuerySchema);
