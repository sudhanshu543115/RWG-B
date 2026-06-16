import mongoose from "mongoose";

const kitOrderSchema = new mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 500,
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "DISPATCHED", "DELIVERED"],
      default: "PENDING",
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    deliveryLocation: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
      receiverName: { type: String },
      phone: { type: String },
      houseNumber: { type: String },
      landmark: { type: String },
    },
    items: {
      type: [String],
      default: ["T-shirt", "Bag", "Bottle", "ID"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("KitOrder", kitOrderSchema);
