import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true
    },

    touristId: {
      type: String,
      required: true
    },

    riderId: {
      type: String,
      required: true
    },

    lastMessage: {
      type: String,
      default: ""
    },

    lastMessageAt: Date
  },
  { timestamps: true }
);

export default mongoose.model(
  "Conversation",
  conversationSchema
);