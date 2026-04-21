const razorpay = require("../../config/razorpay");
const Payment = require("../../models/payment.model");

const createOrderService = async (amount) => {

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: "receipt_" + Date.now()
  };

  const order = await razorpay.orders.create(options);

  await Payment.create({
    orderId: order.id,
    amount: amount,
    status: "created"
  });

  return order;
};

module.exports = {
  createOrderService
};