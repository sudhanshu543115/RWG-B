import Wallet from "../../../models/tourist/Wallet.js";
import Transaction from "../../../models/tourist/transaction.js";

export const getWalletService = async (userId) => {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
        wallet = await Wallet.create({ userId, balance: 0 });
    }
    return wallet;
};

export const addMoneyService = async (userId, amount) => {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
        wallet = await Wallet.create({ userId, balance: 0 });
    }

    wallet.balance += Number(amount);
    await wallet.save();

    // Create a transaction record
    await Transaction.create({
        userId,
        type: "credit",
        amount: Number(amount),
        description: "Money added to wallet",
        status: "success"
    });

    return wallet;
};

export const debitMoneyService = async (userId, amount, bookingId = null) => {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
        wallet = await Wallet.create({ userId, balance: 0 });
    }

    if (wallet.balance < amount) {
        throw new Error("Insufficient balance in wallet.");
    }

    wallet.balance -= Number(amount);
    await wallet.save();

    // Create a transaction record
    await Transaction.create({
        userId,
        type: "debit",
        amount: Number(amount),
        description: bookingId ? `Booking Payment` : "Money debited from wallet",
        bookingId: bookingId,
        status: "success"
    });

    return wallet;
};

export const getTransactionsService = async (userId) => {
    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
    return transactions;
};
