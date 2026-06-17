import {
  getAllRidersService,
  updateRiderStatusService,
  getPendingRidersService,
  deleteRiderService,
  getRiderCompleteHistoryService
} from "./riders.service.js";
import { sendRiderVerificationDecisionEmail } from "../../../core/riderProfileEmails.js";

const getStatusFromRequest = (req) => {
  if (req.body?.status) return req.body.status;

  const url = req.originalUrl || "";
  if (url.endsWith("/approve")) return "approved";
  if (url.endsWith("/reject")) return "rejected";

  return "";
};

export const getAllRiders = async (req, res) => {
  try {
    const { status } = req.query;
    const riders = await getAllRidersService(status);
    res.status(200).json({ success: true, data: riders });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateRiderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = getStatusFromRequest(req);

    const rider = await updateRiderStatusService(id, status);
    let emailResult = { sent: false, skipped: true, reason: "not_attempted" };

    try {
      emailResult = await sendRiderVerificationDecisionEmail(rider, status);
    } catch (emailError) {
      emailResult = { sent: false, error: emailError.message };
      console.error("Failed to send rider verification email:", emailError.message);
    }

    res.status(200).json({
      success: true,
      data: rider,
      email: emailResult
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getPendingRiders = async (req, res) => {
  try {
    const riders = await getPendingRidersService();
    res.status(200).json({ success: true, data: riders });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteRider = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteRiderService(id);
    res.status(200).json({ success: true, message: "Rider deleted successfully." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getRiderCompleteHistoryController = async (req, res) => {
  try {
    const { riderId } = req.params;
    const data = await getRiderCompleteHistoryService(riderId);

    return res.status(200).json({
      success: true,
      message: "Rider complete history fetched successfully",
      data
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
