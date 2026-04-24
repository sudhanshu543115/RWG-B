import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.TEST_API_KEY,
  key_secret: process.env.TEST_API_SECRET
});

export default razorpay;