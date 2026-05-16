import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    senderRole: {
      type: String,
      enum: ["tourist", "rider"],
      required: true
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    seen: {
      type: Boolean,
      default: false
    }

  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "Message",
  messageSchema
);