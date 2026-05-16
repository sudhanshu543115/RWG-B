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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tourist",
      required: true
    },

    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
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