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
    const amountPaid = payment.amount / 100;
    const paymentMethod = payment.method === "card" ? "Card" : (payment.method === "upi" ? "UPI" : "Net Banking");

    booking.payment = {
        ...booking.payment,
        status: "partial_paid", // Initial 30% advance
        method: paymentMethod,
        amountPaid: (booking.payment.amountPaid || 0) + amountPaid,
        transactionId: razorpayPaymentId,
        paidAt: new Date()
    };

    // Record transaction
    booking.transactions.push({
        transactionId: razorpayPaymentId,
        amount: amountPaid,
        method: paymentMethod,
        paymentType: "advance",
        status: "success",
        paidAt: new Date()
    });

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
        // Find all bookings for this user that have at least one payment
        const bookings = await Booking.find({ 
            touristId: userId, 
            "payment.status": { $in: ["partial_paid", "paid"] }
        })
        .populate("riderId", "name phone profileImage")
        .sort({ updatedAt: -1 });

        // Add fallback for legacy bookings that don't have the transactions array yet
        const history = bookings.map(booking => {
            const bookingObj = booking.toObject();
            
            // If transactions array is empty but payment is made, add a fallback entry
            if (!bookingObj.transactions || bookingObj.transactions.length === 0) {
                bookingObj.transactions = [{
                    _id: booking._id,
                    transactionId: booking.payment.transactionId,
                    amount: booking.payment.amountPaid,
                    method: booking.payment.method,
                    paymentType: booking.payment.status === "paid" ? "full" : "advance",
                    status: "success",
                    paidAt: booking.payment.paidAt || booking.updatedAt
                }];
            }

            return bookingObj;
        });

        return history;
    } catch (error) {
        console.error("Error fetching payment history:", error);
        throw error;
    }
};
