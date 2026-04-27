// ── Booking ───────────────────────────────────────────
export const BOOKING_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
});

// ── Trip ──────────────────────────────────────────────
export const TRIP_STATUS = Object.freeze({
  ACCEPTED: 'accepted',
  STARTED: 'started',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

// ── Ride types ────────────────────────────────────────
export const RIDE_TYPES = Object.freeze({
  TWO_HR: '2hr',
  FIVE_HR: '5hr',
  FULLDAY: 'fullday',
  CUSTOM: 'custom',
});

// ── Ride hours map ────────────────────────────────────
export const RIDE_HOURS = Object.freeze({
  '2hr': 2,
  '5hr': 5,
  'fullday': 8,
  'custom': 0,
});

// ── Payment ───────────────────────────────────────────
export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
});

export const PAYMENT_METHODS = Object.freeze({
  UPI: 'upi',
  CARD: 'card',
  WALLET: 'wallet',
  NETBANK: 'netbank',
});

// ── Wallet ────────────────────────────────────────────
export const TXN_TYPE = Object.freeze({
  CREDIT: 'credit',
  DEBIT: 'debit',
});

export const TXN_SOURCE = Object.freeze({
  BOOKING: 'booking',
  REFUND: 'refund',
  TOPUP: 'topup',
  WELCOME_BONUS: 'welcome_bonus',
  EARNING: 'earning',
  WITHDRAWAL: 'withdrawal',
  COMMISSION: 'commission',
});

// ── Rider ─────────────────────────────────────────────
export const VERIFICATION_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

export const VEHICLE_TYPES = Object.freeze([
  'Bike', 'Auto Rickshaw', 'Hatchback', 'Sedan', 'SUV', 'Tempo Traveller',
]);

// ── Payout ────────────────────────────────────────────
export const PAYOUT_STATUS = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
});

// ── Admin ─────────────────────────────────────────────
export const ADMIN_ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  SUPPORT: 'support',
});

// ── Notification types ────────────────────────────────
export const NOTIFICATION_TYPE = Object.freeze({
  BOOKING_REQUEST: 'booking_request',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  TRIP_STARTED: 'trip_started',
  TRIP_COMPLETED: 'trip_completed',
  PAYMENT_SUCCESS: 'payment_success',
  PAYOUT_PROCESSED: 'payout_processed',
  ACCOUNT_APPROVED: 'account_approved',
  ACCOUNT_REJECTED: 'account_rejected',
  GENERAL: 'general',
});

// ── Socket events ─────────────────────────────────────
export const SOCKET_EVENTS = Object.freeze({
  RIDER_LOCATION: 'rider:location',
  TOURIST_LOCATION: 'tourist:location',

  BOOKING_NEW_REQUEST: 'booking:new_request',
  BOOKING_ACCEPTED: 'booking:accepted',
  BOOKING_DECLINED: 'booking:declined',
  BOOKING_CANCELLED: 'booking:cancelled',

  TRIP_OTP_VERIFIED: 'trip:otp_verified',
  TRIP_STARTED: 'trip:started',
  TRIP_COMPLETED: 'trip:completed',
  TRIP_STOP_ADDED: 'trip:stop_added',

  CHAT_MESSAGE: 'chat:message',
  CHAT_TYPING: 'chat:typing',

  JOIN_ROOM: 'join:room',
  LEAVE_ROOM: 'leave:room',
});

// ── Platform ──────────────────────────────────────────
export const PLATFORM = Object.freeze({
  COMMISSION_RATE: 0.15,
  RIDER_SHARE: 0.85,
  ADVANCE_RATE: 0.30,
  WELCOME_BONUS: 500,
  MAX_STOPS_PER_BOOKING: 10,
  OTP_LENGTH: 4,
  OTP_EXPIRY_MINUTES: 10,
  BOOKING_EXPIRY_MINUTES: 90,
  MIN_BOOKING_HOURS_AHEAD: 2,
  MAX_BOOKING_DAYS_AHEAD: 30,
  MIN_BOOKING_AMOUNT: 100,
  DEMAND_MULTIPLIERS: {
    jaipur: 1.1, delhi: 1.2, agra: 1.15,
    goa: 1.3, mumbai: 1.25, udaipur: 1.05,
    varanasi: 1.0, mysore: 1.0,
  },
});

// ── City rates ────────────────────────────────────────
export const CITY_RATES = Object.freeze({
  jaipur: { base: 80, perKm: 14, perHour: 120, guideFee: 250 },
  delhi: { base: 100, perKm: 16, perHour: 150, guideFee: 300 },
  agra: { base: 80, perKm: 13, perHour: 110, guideFee: 250 },
  goa: { base: 90, perKm: 15, perHour: 130, guideFee: 280 },
  mumbai: { base: 120, perKm: 18, perHour: 180, guideFee: 350 },
  udaipur: { base: 75, perKm: 12, perHour: 100, guideFee: 220 },
  varanasi: { base: 70, perKm: 11, perHour: 95, guideFee: 200 },
  mysore: { base: 75, perKm: 12, perHour: 100, guideFee: 210 },
});