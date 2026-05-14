import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema({
   riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      required: true
   },

   type: {
      type: String,
      enum: ["upi", "bank", "paytm"],
      required: true
   },

   isDefault: {
      type: Boolean,
      default: false
   },

   upiId: {
      type: String,
      default: ""
   },

   bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifsc: String,
      bankName: String
   },

   mobileNumber: {
      type: String,
      default: ""
   }

}, { timestamps: true });

export default mongoose.model(
   "PaymentMethod",
   paymentMethodSchema
);