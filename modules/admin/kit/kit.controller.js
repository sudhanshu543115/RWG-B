import KitOrder from "../../../models/rider/KitOrder.js";

export const getAllKitOrders = async (req, res) => {
  try {
    const orders = await KitOrder.find()
      .populate("riderId", "name phone profileImage verificationStatus city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching kit orders for admin:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateKitOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const kitOrder = await KitOrder.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("riderId", "name phone profileImage verificationStatus city");

    if (!kitOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: kitOrder,
    });
  } catch (error) {
    console.error("Error updating kit order status:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
