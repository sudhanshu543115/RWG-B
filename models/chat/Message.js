import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true
    },

    senderId: {
      type: String,
      required: true
    },

    senderRole: {
      type: String,
      enum: ["tourist", "rider"],
      required: true
    },

    receiverId: {
      type: String,
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

// Index for instant chat history lookup
messageSchema.index({ conversationId: 1, createdAt: 1 });


export default mongoose.model(
  "Message",
  messageSchema
);