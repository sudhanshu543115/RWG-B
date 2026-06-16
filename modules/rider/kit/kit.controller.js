import crypto from "crypto";
import KitOrder from "../../../models/rider/KitOrder.js";
import razorpay from "../../../config/razorpay.js";

// We'll use process.env.TEST_API_SECRET or fallback
const getRazorpaySecret = () => process.env.TEST_API_SECRET || "fallback_secret";

export const createKitOrder = async (req, res) => {
  try {
    const riderId = req.user._id; // Assuming protectRider middleware sets req.rider
    const amount = 500;

    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `kit_${riderId.toString().slice(-4)}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const kitOrder = await KitOrder.create({
      riderId,
      amount,
      razorpayOrderId: order.id,
    });

    res.status(201).json({
      success: true,
      data: {
        order,
        kitOrderId: kitOrder._id,
      },
    });
  } catch (error) {
    console.error("Error creating kit order:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const verifyKitPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const riderId = req.user._id;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", getRazorpaySecret())
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const kitOrder = await KitOrder.findOneAndUpdate(
      { razorpayOrderId, riderId },
      { status: "PAID", razorpayPaymentId },
      { new: true }
    );

    if (!kitOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: kitOrder,
    });
  } catch (error) {
    console.error("Error verifying kit payment:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateDeliveryLocation = async (req, res) => {
  try {
    const { kitOrderId, lat, lng, address, receiverName, phone, houseNumber, landmark } = req.body;
    const riderId = req.user._id;

    const kitOrder = await KitOrder.findOneAndUpdate(
      { _id: kitOrderId, riderId, status: "PAID" },
      {
        $set: {
          deliveryLocation: {
            lat,
            lng,
            address,
            receiverName,
            phone,
            houseNumber,
            landmark,
          },
        },
      },
      { new: true }
    );

    if (!kitOrder) {
      return res.status(404).json({ success: false, message: "Valid paid order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Delivery location updated",
      data: kitOrder,
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getRiderKitOrder = async (req, res) => {
  try {
    const riderId = req.user._id;
    // We get the most recent kit order for this rider
    const kitOrder = await KitOrder.findOne({ riderId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: kitOrder,
    });
  } catch (error) {
    console.error("Error fetching rider kit order:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
