import mongoose from "mongoose";

const refundRequestSchema = new mongoose.Schema({
  touristId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
  cancellation: {
    chargeAmount: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },
    refundStatus: { 
      type: String, 
      enum: ['pending', 'processing', 'processed', 'failed', 'rejected'],
      default: 'pending' 
    },
    cancelledAt: { type: Date },
    cancelledBy: { 
      type: String, 
      enum: ['tourist', 'rider', 'admin'] 
    },
    reason: { type: String }
  },
  refundDetails: {
    paymentMethod: {
      type: String,
      enum: ['upi', 'bank_transfer', 'original_payment_method'],
      default: 'original_payment_method'
    },
    upiId: { type: String },
    bankAccount: {
      accountNumber: { type: String },
      accountHolder: { type: String },
      ifsc: { type: String },
      bankName: { type: String }
    },
    originalPaymentMethod: {
      transactionId: { type: String },
      method: { type: String }
    }
  },
  adminNotes: { type: String },
  razorpayRefundId: { type: String },
  processedAt: { type: Date },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  }
}, { timestamps: true });

export default mongoose.models.RefundRequest || mongoose.model("RefundRequest", refundRequestSchema);