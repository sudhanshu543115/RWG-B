import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    type: {
        type: String,
        enum: ["credit", "debit"]
    },

  // ✅ ADD THIS
  remainingAmount: {
    type: Number,
    default: 0
  },

    amount: Number,

    description: String, // "Added money", "Booking payment"

    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    },

    status: {
        type: String,
        enum: ["success", "failed"],
        default: "success"
    }

}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);