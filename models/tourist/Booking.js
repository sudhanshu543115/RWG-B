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

  // 💰 STEP 3: PRICE BREAKDOWN
  pricing: {
    baseFare: { type: Number, default: 0 },
    distanceCost: { type: Number, default: 0 },
    timeCharge: { type: Number, default: 0 },
    guideServiceFee: { type: Number, default: 0 },
    demandMultiplier: { type: Number, default: 1 },

    estimatedRange: {
      min: Number,
      max: Number
    },

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
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    amountPaid: { type: Number, default: 0 },
    paidAt: Date
  },

  // 🚦 BOOKING STATUS
  status: {
    type: String,
    enum: [
      "pending",     // waiting for guide acceptance
      "confirmed",   // guide accepted and advance paid
      "ongoing",
      "booked",     // trip started
      "completed",   // trip finished
      "cancelled"
    ],
    default: "pending"
  },

  // 🔐 OTP
  rideOTP: {
    type: String
  },

  // 📡 LIVE TRACKING
  liveLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },


  
interestedRiders: [{
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: "Rider" },
    interestedAt: { type: Date, default: Date.now }
}],
rejectedRiders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rider"
}],




}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);