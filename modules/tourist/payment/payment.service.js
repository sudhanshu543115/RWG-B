import crypto from "crypto";
import Booking from "../../../models/tourist/Booking.js";
import RefundRequest from "../../../models/tourist/RefundRequest.js";
import User from "../../../models/tourist/User.js";
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

const paymentMethod =
  payment.method === "card"
    ? "Card"
    : payment.method === "upi"
    ? "UPI"
    : "Net Banking";

// ✅ Total paid till now
const totalPaid =
  (booking.payment.amountPaid || 0) + amountPaid;

// ✅ Remaining amount
const remainingAmount =
  booking.pricing.totalAmount - totalPaid;

    booking.payment = {
  ...booking.payment,

  status:
    remainingAmount <= 0
      ? "paid"
      : "partial_paid",

  method: paymentMethod,

  amountPaid: totalPaid,

  // ✅ SAVE REMAINING
  remainingAmount: remainingAmount,

  transactionId: razorpayPaymentId,

  paidAt: new Date()
};

    // Record transaction
  booking.transactions.push({
  transactionId: razorpayPaymentId,

  amount: amountPaid,

  method: paymentMethod,

  paymentType:
    remainingAmount <= 0
      ? "full"
      : "advance",

  status: "success",

  // ✅ SAVE SNAPSHOT
  remainingAmount: remainingAmount,

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

            return {
  ...bookingObj,

  totalAmount:
    booking.pricing.totalAmount,

  advanceAmount:
    booking.pricing.advanceAmount,

  paidAmount:
    booking.payment.amountPaid || 0,

  // ✅ RETURN REMAINING AMOUNT
  remainingAmount:
    booking.payment.remainingAmount ||
    (
      booking.pricing.totalAmount -
      (booking.payment.amountPaid || 0)
    ),

  paymentStatus:
    booking.payment.status,

  paymentMethod:
    booking.payment.method
};
        });

        return history;
    } catch (error) {
        console.error("Error fetching payment history:", error);
        throw error;
    }
};

export const createRefundRequest = async (touristId, bookingId, refundDetails) => {
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw new Error("Booking not found");
        
        if (booking.touristId.toString() !== touristId.toString()) {
            throw new Error("You don't have permission to request refund for this booking");
        }

        if (!booking.cancellation || booking.cancellation.refundStatus === 'processed') {
            throw new Error("This booking is not eligible for refund request");
        }

        const refundRequest = new RefundRequest({
            touristId,
            bookingId,
            cancellation: {
                chargeAmount: booking.cancellation.chargeAmount || 0,
                refundAmount: booking.cancellation.refundAmount || 0,
                refundStatus: 'pending',
                cancelledAt: booking.cancellation.cancelledAt,
                cancelledBy: booking.cancellation.cancelledBy,
                reason: booking.cancellation.reason
            },
            refundDetails: {
                ...refundDetails,
                originalPaymentMethod: {
                    transactionId: booking.payment.transactionId,
                    method: booking.payment.method
                }
            }
        });

        await refundRequest.save();
        return refundRequest;
    } catch (error) {
        console.error("Error creating refund request:", error);
        throw error;
    }
};

export const getRefundRequests = async (touristId) => {
    try {
        const refundRequests = await RefundRequest.find({ touristId })
            .populate('bookingId', 'city date startTime durationType pricing payment')
            .sort({ createdAt: -1 });
        return refundRequests;
    } catch (error) {
        console.error("Error fetching refund requests:", error);
        throw error;
    }
};

export const updateRefundRequest = async (refundRequestId, adminId, refundStatus, razorpayRefundId, adminNotes) => {
    try {
        const refundRequest = await RefundRequest.findById(refundRequestId);
        if (!refundRequest) throw new Error("Refund request not found");

        refundRequest.cancellation.refundStatus = refundStatus;
        refundRequest.razorpayRefundId = razorpayRefundId;
        refundRequest.adminNotes = adminNotes;
        refundRequest.processedBy = adminId;
        refundRequest.processedAt = new Date();

        await refundRequest.save();
        return refundRequest;
    } catch (error) {
        console.error("Error updating refund request:", error);
        throw error;
    }
};

export const saveRefundDetailsService = async (touristId, refundDetails) => {
    try {
        const user = await User.findById(touristId);
        if (!user) throw new Error("User not found");

        user.refundDetails = {
            paymentMethod: refundDetails.paymentMethod || 'original_payment_method',
            upiId: refundDetails.upiId || '',
            bankAccount: refundDetails.bankAccount || {
                accountNumber: '',
                accountHolder: '',
                ifsc: '',
                bankName: ''
            }
        };

        await user.save();
        return user;
    } catch (error) {
        console.error("Error saving refund details:", error);
        throw error;
    }
};

// Helper function to fix existing refund requests with missing cancelledBy and reason
export const fixExistingRefundRequests = async () => {
    try {
        const Booking = (await import("../../../models/tourist/Booking.js")).default;
        const refundRequests = await RefundRequest.find({
            $or: [
                { 'cancellation.cancelledBy': { $exists: false } },
                { 'cancellation.cancelledBy': null },
                { 'cancellation.reason': { $exists: false } },
                { 'cancellation.reason': null }
            ]
        });

        for (const refundRequest of refundRequests) {
            const booking = await Booking.findById(refundRequest.bookingId);
            if (booking) {
                if (!refundRequest.cancellation.cancelledBy) {
                    refundRequest.cancellation.cancelledBy = booking.cancelledBy || booking.cancellation?.cancelledBy || 'Unknown';
                }
                if (!refundRequest.cancellation.reason) {
                    refundRequest.cancellation.reason = booking.cancellationReason || booking.cancellation?.reason || 'No reason provided';
                }
                await refundRequest.save();
            }
        }

        console.log(`✅ Fixed ${refundRequests.length} existing refund requests`);
        return refundRequests.length;
    } catch (error) {
        console.error("Error fixing existing refund requests:", error);
        throw error;
    }
};
