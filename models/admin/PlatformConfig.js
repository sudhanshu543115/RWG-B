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
