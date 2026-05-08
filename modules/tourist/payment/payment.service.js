import crypto from "crypto";
import Booking from "../../../models/tourist/Booking.js";
import razorpay from "../../../config/razorpay.js";

export const createRazorpayOrder = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    // Amount in paise
    const amount = Math.round(booking.pricing.advanceAmount * 100);

    const options = {
      amount: amount,
      currency: "INR",
      receipt: booking._id.toString(),
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
};

export const verifyRazorpayPayment = async (razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId) => {
  try {
    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.TEST_API_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      throw new Error("Invalid payment signature");
    }

    // Confirm status with Razorpay and get payment details
    const payment = await razorpay.payments.fetch(razorpayPaymentId);
    
    if (payment.status !== 'captured' && payment.status !== 'authorized') {
        throw new Error("Payment not successful on Razorpay");
    }

    // --- UPDATE BOOKING STATUS ---
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found to update.");

    // Update the payment sub-object correctly
    booking.payment = {
        ...booking.payment,
        status: "partial_paid", // Initial 30% advance
        method: payment.method === "card" ? "Card" : (payment.method === "upi" ? "UPI" : "Net Banking"),
        amountPaid: (booking.payment.amountPaid || 0) + (payment.amount / 100),
        transactionId: razorpayPaymentId,
        paidAt: new Date()
    };

    booking.bookingStatus = "searching"; // Broadcast to riders
    booking.assignmentStatus = "waiting_for_riders";
    await booking.save();

    return { success: true, booking };
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};

export const getPaymentHistoryService = async (userId) => {
    try {
        // Find all bookings for this user that are marked as 'paid'
        const history = await Booking.find({ 
            touristId: userId, 
            "payment.status": "paid" 
        }).sort({ updatedAt: -1 });

        return history;
    } catch (error) {
        console.error("Error fetching payment history:", error);
        throw error;
    }
};
