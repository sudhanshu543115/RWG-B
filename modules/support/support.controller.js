import SupportQuery from "../../models/SupportQuery/SupportQuery.js";
import Tourist from "../../models/tourist/User.js";
import Rider from "../../models/rider/Rider.js";

// @desc    Create a new support query
// @route   POST /api/support
// @access  Private (Tourist/Rider)
export const createSupportQuery = async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;
    let userRole = req.user.role === "rider" ? "Rider" : "Tourist";
    let userName = "User";
    let userPhone = "";
    let userEmail = "";

    const userId = req.user._id;

    if (userRole === "Tourist") {
      const tourist = await Tourist.findById(userId);
      if (tourist) {
        userName = tourist.name || "Tourist";
        userPhone = tourist.phone || "";
        userEmail = tourist.email || "";
      }
    } else if (userRole === "Rider") {
      const rider = await Rider.findById(userId);
      if (rider) {
        userName = rider.name || "Rider";
        userPhone = rider.phone || "";
        userEmail = rider.email || "";
      }
    }

    const query = await SupportQuery.create({
      userId,
      userRole,
      userName,
      userPhone,
      userEmail,
      subject,
      message,
      category,
      priority,
    });

    res.status(201).json({
      success: true,
      message: "Query submitted successfully",
      data: query,
    });
  } catch (error) {
    console.error("Error creating support query:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get current user's queries
// @route   GET /api/support/my-queries
// @access  Private (Tourist/Rider)
export const getUserQueries = async (req, res) => {
  try {
    const userId = req.user._id;
    const queries = await SupportQuery.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: queries,
    });
  } catch (error) {
    console.error("Error fetching user queries:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all queries for admin
// @route   GET /api/support/admin
// @access  Private (Admin)
export const getAllQueries = async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.userRole = role;

    const queries = await SupportQuery.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: queries,
    });
  } catch (error) {
    console.error("Error fetching all queries:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update query status & admin reply
// @route   PATCH /api/support/admin/:id
// @access  Private (Admin)
export const updateQueryStatus = async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    const query = await SupportQuery.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ success: false, message: "Query not found" });
    }

    if (status) query.status = status;
    if (adminReply !== undefined) query.adminReply = adminReply;

    await query.save();

    res.status(200).json({
      success: true,
      message: "Query updated successfully",
      data: query,
    });
  } catch (error) {
    console.error("Error updating query:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete a query
// @route   DELETE /api/support/admin/:id
// @access  Private (Admin)
export const deleteQuery = async (req, res) => {
  try {
    const query = await SupportQuery.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ success: false, message: "Query not found" });
    }

    await query.deleteOne();

    res.status(200).json({
      success: true,
      message: "Query deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting query:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
