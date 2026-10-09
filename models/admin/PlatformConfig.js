import mongoose from 'mongoose';

const platformConfigSchema = new mongoose.Schema({
  GLOBAL_RATES: {
    base: { type: Number, default: 100 },
    perKm: { type: Number, default: 15 },
    perHour: { type: Number, default: 150 },
    guideFee: { type: Number, default: 300 }
  },
  CITIES: [{
    id: String,
    name: String,
    demand: Number,
    tagline: String,
    lat: Number,
    lng: Number
  }],

  PRICING_CONFIG: {
    ROAD_FACTOR: { type: Number, default: 1.2 },
    ADVANCE_PERCENT: { type: Number, default: 0.3 },
    ADMIN_COMMISSION_PERCENT: { type: Number, default: 0.3 },
    DESCRIPTION: String,
    FORMULA: String
  },

  // ── Cancellation Policy (Scenario-Based) ───────────────
  CANCELLATION_POLICY: {
    // 1. Free cancel window in minutes (e.g. 5 mins after booking)
    FREE_CANCEL_WINDOW_MINS: { type: Number, default: 5 },

    // 2. Rider on the way (heading_to_pickup)
    ON_THE_WAY_FEE: { type: Number, default: 50 },
    ON_THE_WAY_RIDER_COMPENSATION: { type: Number, default: 35 },

    // 3. Rider arrived at location (arrived_at_pickup)
    ARRIVED_FEE: { type: Number, default: 100 },
    ARRIVED_RIDER_COMPENSATION: { type: Number, default: 70 },

    // 4. Tourist No-Show
    NO_SHOW_WAIT_MINS: { type: Number, default: 15 },
    NO_SHOW_RIDER_SHARE_PERCENT: { type: Number, default: 70 },

    // 5. Rider / Guide Cancel
    RIDER_CANCEL_PENALTY: { type: Number, default: 100 },

    // Legacy fallback fields
    FREE_CANCEL_PERCENT: { type: Number, default: 0.30 },
    TOURIST_CANCEL_CHARGE_PERCENT: { type: Number, default: 0.03 },
    RIDER_CANCEL_CHARGE_PERCENT: { type: Number, default: 0.03 },
  },
  RIDE_TYPES: [{
    id: String,
    label: String,
    sub: String,
    hours: Number,
    emoji: String,
    desc: String
  }],
  LANGUAGES: [String],
  NATIONALITIES: [String],
  PAYMENT_METHODS: [{
    id: String,
    label: String,
    sub: String,
    icon: String
  }],
  UPI_APPS: [{
    id: String,
    name: String,
    color: String
  }],
  BOOKING_STATUS: {
    type: Map,
    of: {
      label: String,
      color: String,
      dot: String
    }
  },
  CITY_STOPS: {
    type: Map,
    of: [{
      name: String,
      duration: Number,
      category: String,
      lat: Number,
      lng: Number
    }]
  }
}, { timestamps: true });

const PlatformConfig = mongoose.model('PlatformConfig', platformConfigSchema);

export default PlatformConfig;
