import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema({

   riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      required: true
   },

   paymentMethodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod"
   },

   amount: {
      type: Number,
      required: true
   },

   snapshot: {
      type: Object
   },

   razorpayPayoutId: String,

   status: {
      type: String,
      enum: [
         "pending",
         "processing",
         "completed",
         "failed",
         "rejected"
      ],
      default: "pending"
   }

}, { timestamps: true });

export default mongoose.model("Payout", payoutSchema);