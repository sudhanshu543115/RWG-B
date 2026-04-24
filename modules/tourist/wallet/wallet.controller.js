import { getWalletService, addMoneyService, debitMoneyService, getTransactionsService } from "./wallet.service.js";

export const getWallet = async (req, res) => {
    try {
        const wallet = await getWalletService(req.user._id);
        return res.status(200).json({
            success: true,
            message: "Wallet retrieved successfully.",
            data: wallet
        });
    } catch (error) {
        console.error("Error in getWallet:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to retrieve wallet."
        });
    }
};

export const addMoney = async (req, res) => {
    try {
        const wallet = await addMoneyService(req.user._id, req.body.amount);
        return res.status(200).json({
            success: true,
            message: "Money added successfully.",
            data: wallet
        });
    } catch (error) {
        console.error("Error in addMoney:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to add money."
        });
    }
};

export const debitMoney = async (req, res) => {
    try {
        const { amount, bookingId } = req.body;
        const wallet = await debitMoneyService(req.user._id, amount, bookingId);
        return res.status(200).json({
            success: true,
            message: "Money debited successfully.",
            data: wallet
        });
    } catch (error) {
        console.error("Error in debitMoney:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to debit money."
        });
    }
};

export const getTransactions = async (req, res) => {
    try {
        const transactions = await getTransactionsService(req.user._id);
        return res.status(200).json({
            success: true,
            message: "Transactions retrieved successfully.",
            data: transactions
        });
    } catch (error) {
        console.error("Error in getTransactions:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to retrieve transactions."
        });
    }
};