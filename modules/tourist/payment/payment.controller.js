const { createOrderValidation } = require("./payment.validation");
const { createOrderService } = require("./payment.service");

const createOrder = async (req, res) => {
  try {
    const { error } = createOrderValidation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { amount } = req.body;

    const order = await createOrderService(amount);

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
};

module.exports = {
  createOrder
};