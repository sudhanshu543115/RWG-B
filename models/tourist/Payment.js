const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  orderId: String,
  paymentId: String,
  amount: Number,
  currency: {
    type: String,
    default: "INR"
  },
  status: {
    type: String,
    default: "created"
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);