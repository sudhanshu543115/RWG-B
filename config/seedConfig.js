import PlatformConfig from '../models/admin/PlatformConfig.js';

const seedConfig = async () => {
  try {
    const existing = await PlatformConfig.findOne();
    if (existing) {
      console.log('Platform configuration already seeded.');
      return;
    }

    const initialConfig = {
      GLOBAL_RATES: {
        base: 100,
        perKm: 15,
        perHour: 150,
        guideFee: 300
      },
      CITIES: [
        { id: 'jaipur', name: 'Jaipur', demand: 1.1, tagline: 'The Pink City', lat: 26.9124, lng: 75.7873 },
        { id: 'delhi', name: 'Delhi', demand: 1.25, tagline: 'The Capital', lat: 28.6139, lng: 77.2090 },
        { id: 'agra', name: 'Agra', demand: 1.15, tagline: 'City of Taj Mahal', lat: 27.1767, lng: 78.0081 },
        { id: 'goa', name: 'Goa', demand: 1.4, tagline: 'Pearl of Orient', lat: 15.2993, lng: 74.1240 },
        { id: 'mumbai', name: 'Mumbai', demand: 1.3, tagline: 'City of Dreams', lat: 19.0760, lng: 72.8777 },
        { id: 'udaipur', name: 'Udaipur', demand: 1.1, tagline: 'City of Lakes', lat: 24.5854, lng: 73.7125 },
        { id: 'varanasi', name: 'Varanasi', demand: 1.0, tagline: 'Spiritual Capital', lat: 25.3176, lng: 82.9739 },
        { id: 'mysore', name: 'Mysore', demand: 1.05, tagline: 'City of Palaces', lat: 12.2958, lng: 76.6394 },
      ],

      PRICING_CONFIG: {
        ROAD_FACTOR: 1.2,
        ADVANCE_PERCENT: 0.3,
        ADMIN_COMMISSION_PERCENT: 0.3,
        DESCRIPTION: "Total = (Distance Charge + Time Charge + Base Fee + Guide Fee) * City Demand Factor",
        FORMULA: "((km * globalPerKm) + (hours * globalPerHour) + globalBase + globalGuide) * cityDemand"
      },
      RIDE_TYPES: [
        { id: '2hr', label: '2-Hour', sub: 'City Highlights', hours: 2, emoji: '⚡', desc: 'Quick iconic spots' },
        { id: '5hr', label: 'Half Day', sub: '5 Hours', hours: 5, emoji: '🗺', desc: 'Best of the city' },
        { id: 'fullday', label: 'Full Day', sub: '8 Hours', hours: 8, emoji: '🌟', desc: 'Deep-dive experience' },
        { id: 'custom', label: 'Custom', sub: 'Your schedule', hours: 0, emoji: '✦', desc: 'Build your itinerary' },
      ],
      LANGUAGES: ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Punjabi', 'Rajasthani', 'French', 'German', 'Japanese', 'Chinese', 'Spanish', 'Italian', 'Russian', 'Korean'],
      NATIONALITIES: ['Indian', 'American', 'British', 'Australian', 'Canadian', 'French', 'German', 'Japanese', 'Chinese', 'Korean', 'Russian', 'Italian', 'Spanish', 'Brazilian', 'Mexican', 'Dutch', 'Swedish', 'Singaporean', 'UAE / Emirati', 'South African'],
      PAYMENT_METHODS: [
        { id: 'upi', label: 'UPI', sub: 'PhonePe · GPay · Paytm · BHIM', icon: '⚡' },
        { id: 'card', label: 'Credit/Debit Card', sub: 'Visa · Mastercard · RuPay', icon: '💳' },
       // { id: 'wallet', label: 'RwG Wallet', sub: 'Instant · Zero charges', icon: '👜' },
        { id: 'netbank', label: 'Net Banking', sub: 'All major Indian banks', icon: '🏦' },
      ],
      UPI_APPS: [
        { id: 'phonepe', name: 'PhonePe', color: '#5f259f' }, { id: 'gpay', name: 'GPay', color: '#4285F4' },
        { id: 'paytm', name: 'Paytm', color: '#002970' }, { id: 'bhim', name: 'BHIM', color: '#00529B' },
        { id: 'navi', name: 'Navi', color: '#E63838' }, { id: 'other', name: 'Other UPI', color: '#6B7280' },
      ],
      BOOKING_STATUS: {
        pending: { label: 'Pending', color: 'amber', dot: '#D97706' },
        searching: { label: 'Searching', color: 'amber', dot: '#D97706' },
        assigned: { label: 'Assigned', color: 'green', dot: '#16A34A' },
        confirmed: { label: 'Confirmed', color: 'green', dot: '#16A34A' },
        ongoing: { label: 'Ongoing', color: 'brand', dot: '#F59000' },
        completed: { label: 'Completed', color: 'neutral', dot: '#9B9890' },
        cancelled: { label: 'Cancelled', color: 'red', dot: '#DC2626' },
      },
      CITY_STOPS: {
        jaipur: [ 
          { name: 'Amber Fort', duration: 90, category: 'Heritage', lat: 26.9855, lng: 75.8513 },
          { name: 'Hawa Mahal', duration: 45, category: 'Monument', lat: 26.9239, lng: 75.8267 },
          { name: 'City Palace', duration: 75, category: 'Royal', lat: 26.9258, lng: 75.8237 },
          { name: 'Jantar Mantar', duration: 45, category: 'Science', lat: 26.9247, lng: 75.8237 },
          { name: 'Nahargarh Fort', duration: 60, category: 'Heritage', lat: 26.9448, lng: 75.8024 },
          { name: 'Johri Bazaar', duration: 60, category: 'Shopping', lat: 26.9168, lng: 75.8258 },
          { name: 'Jal Mahal', duration: 30, category: 'Scenic', lat: 26.9508, lng: 75.8413 },
        ],
        delhi: [
          { name: 'Red Fort', duration: 90, category: 'Heritage', lat: 28.6562, lng: 77.2410 },
          { name: 'India Gate', duration: 45, category: 'Monument', lat: 28.6129, lng: 77.2295 },
          { name: 'Qutub Minar', duration: 60, category: 'Heritage', lat: 28.5245, lng: 77.1855 },
          { name: "Humayun's Tomb", duration: 60, category: 'Mughal', lat: 28.5933, lng: 77.2507 },
          { name: 'Chandni Chowk', duration: 90, category: 'Market', lat: 28.6505, lng: 77.2303 },
          { name: 'Lotus Temple', duration: 45, category: 'Spiritual', lat: 28.5535, lng: 77.2588 },
          { name: "Pari Chowk", duration: 45, category: 'Spiritual', lat: 28.465258, lng: 77.510928 },
        ],
        agra: [
          { name: 'Taj Mahal', duration: 120, category: 'Wonder', lat: 27.1751, lng: 78.0421 },
          { name: 'Agra Fort', duration: 90, category: 'Heritage', lat: 27.1800, lng: 78.0219 },
          { name: 'Mehtab Bagh', duration: 45, category: 'Garden', lat: 27.1759, lng: 78.0344 },
          { name: 'Fatehpur Sikri', duration: 90, category: 'Heritage', lat: 27.0945, lng: 77.6601 },
        ],
        goa: [
          { name: 'Baga Beach', duration: 90, category: 'Beach', lat: 15.5557, lng: 73.7523 },
          { name: 'Old Goa Churches', duration: 60, category: 'Heritage', lat: 15.5009, lng: 73.9118 },
          { name: 'Anjuna Market', duration: 75, category: 'Market', lat: 15.5803, lng: 73.7450 },
          { name: 'Chapora Fort', duration: 45, category: 'Fort', lat: 15.6094, lng: 73.7380 },
        ],
      }
    };

    const config = new PlatformConfig(initialConfig);
    await config.save();
    console.log('Platform configuration seeded successfully.');
  } catch (error) {
    console.error('Error seeding platform configuration:', error);
  }
};

export default seedConfig;
