import mongoose from "mongoose";

const stopSchema = new mongoose.Schema({
  name: String,
  location: {
    address: String,
    lat: Number,
    lng: Number
  },
  duration: Number, // estimated minutes at stop
  type: String // e.g., 'Religious', 'Beach', 'Heritage'
});

const bookingSchema = new mongoose.Schema({
  touristId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  vehicleType: {
    type: String,
    enum: ["bike", "bike-light", "cab", "auto"],
    default: "bike"
  },


  // This is the "Guide" assigned to the booking. 
  // In the folder structure, these are referred to as "Riders".
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rider"
  },

  // 🌍 STEP 1: TRIP DETAILS
  city: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  startTime: {
    type: String,
    required: true
  },

  endTime: {
    type: String
  },

  durationType: {
    type: String,
    enum: ["5-hour", "2-hour", "half-day", "full-day", "custom"],
    required: true
  },

  totalHours: Number,

  pickupLocation: {
    address: String,
    lat: Number,
    lng: Number
  },

  language: {
    type: String,
    default: "English"
  },

  genderPreference: {
    type: String,
    enum: ["Female guide preferred", "Male guide preferred", "No preference"],
    default: "No preference"
  },

  // 📍 STEP 2: STOPS
  stops: [stopSchema],

  specialRequest: String,

  pricing: {
    baseFare: { type: Number, default: 0 },
    distanceCost: { type: Number, default: 0 },
    timeCharge: { type: Number, default: 0 },
    guideServiceFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    rideFee: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 },
    distanceSegments: [{
      from: String,
      to: String,
      distance: Number
    }],
    demandMultiplier: { type: Number, default: 1 },
    advanceAmount: Number // 30% advance
  },

  // 💳 PAYMENT
  payment: {
    transactionId: String,
    method: {
      type: String,
      enum: ["UPI", "Card", "Wallet", "Net Banking", "None"],
      default: "None"
    },
    status: {
      type: String,
      enum: ["pending", "partial_paid", "paid", "failed"],
      default: "pending"
    },
    amountPaid: { type: Number, default: 0 },
    remainingOrderId: { type: String },
    remainingAmount: { type: Number, default: 0 },
    paidAt: Date
  },

  // 🚦 BOOKING STATUS
  bookingStatus: {
    type: String,
    enum: [
      "pending",        // booking created
      "searching",      // broadcast to riders
      "assigned",       // rider assigned
      "ongoing",        // ride started
      "completed",      // ride finished
      "cancelled"
    ],
    default: "pending"
  },

  cancellationReason: {
    type: String
  },

  cancelledBy: {
    type: String,
    enum: ["tourist", "rider", "admin"]
  },

  // 🕐 When rider was assigned (needed for 30% free cancel window calculation)
  assignedAt: { type: Date },

  // 💸 Cancellation charge details
  cancellation: {
    chargePercent:  { type: Number, default: 0 },      // snapshot of policy at cancel time
    chargeAmount:   { type: Number, default: 0 },      // ₹ deducted (tourist) or penalty (rider)
    refundAmount:   { type: Number, default: 0 },      // ₹ refunded to tourist
    riderPenalty:   { type: Number, default: 0 },      // ₹ deducted from rider wallet
    refundId:       { type: String },                  // Razorpay refund ID
    refundStatus:   { type: String, enum: ['pending', 'processed', 'failed', 'not_applicable'] },
    cancelledAt:    { type: Date }
  },

  assignmentStatus: {
    type: String,
    enum: [
      "not_assigned",
      "waiting_for_riders",
      "rider_selected",
      "admin_assigned"
    ],
    default: "not_assigned"
  },

  // 🔐 OTP
  rideOTP: {
    type: String
  },
  endRideOTP: {
    type: String
  },

  // 📡 LIVE TRACKING
  liveLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },

  // 🛤️ DETAILED RIDE TRACKING
  tracking: {
    currentStage: {
      type: String,
      enum: [
        "assigned",
        "heading_to_pickup",
        "arrived_at_pickup",
        "trip_started",
        "heading_to_stop",
        "arrived_at_stop",
        "completed_stop",
        "heading_to_drop",
        "completed"
      ],
      default: "assigned"
    },
    stages: [{
      stage: String,
      timestamp: { type: Date, default: Date.now },
      lat: Number,
      lng: Number,
      stopId: mongoose.Schema.Types.ObjectId
    }],
    completedStops: [{ type: mongoose.Schema.Types.ObjectId }],
    endOtpVerified: { type: Boolean, default: false },
    endOtpVerifiedAt: Date
  },

  interestedRiders: [{
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: "Rider" },
    interestedAt: { type: Date, default: Date.now }
  }],
  rejectedRiders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rider"
  }],

    // Inside your Schema
  review: {
    rating: { type: Number, min: 1, max: 5 },
    isReviewed: { type: Boolean, default: false },
    reviewedAt: { type: Date }
  },

  transactions: [{
    transactionId: String,
    amount: Number,
    method: String,
    paymentType: { type: String, enum: ["advance", "final", "full"] },
    status: { type: String, default: "success" },
    paidAt: { type: Date, default: Date.now }
  }],





}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
