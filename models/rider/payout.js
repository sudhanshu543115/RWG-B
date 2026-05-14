const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const payoutSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    amount: {
        type: Number,
        required: true,
    },
    upiaccount: {
        upi: {
            type: String,
        },
        accountNumber: {
            type: String,
        },
        name: {
            type: String,
        },
    },

    accountdetail: {
        type: Schema.Types.ObjectId,
        ref: "Account",
        accountNumber: {
            type: String,
            ref: "Account"
        },
        bankname: {
            type: String,
            ref: "Account"
        },                                                                                                                                                                                                                                                                                                                                                      
        accountHolderName: {
            type: String,
            ref: "Account"
        },
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Payout = mongoose.model("Payout", payoutSchema);
module.exports = Payout;