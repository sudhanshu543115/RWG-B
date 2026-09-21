import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    nationality: { type: String, default: "" },
    preferredLanguage: { type: String, default: "" },
    bio: { type: String, default: "" },
    gender: { type: String, enum: ["Male", "Female", "Prefer_not_to_say", "Other", ""], default: "" },
    profileCompleted: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    tripsCount: { type: Number, default: 0 },
    profileImage: { type: String,  default: "" },
    refundDetails: {
        paymentMethod: { type: String, enum: ['upi', 'bank_transfer', 'original_payment_method'], default: 'original_payment_method' },
        upiId: { type: String, default: "" },
        bankAccount: {
            accountNumber: { type: String, default: "" },
            accountHolder: { type: String, default: "" },
            ifsc: { type: String, default: "" },
            bankName: { type: String, default: "" }
        }
    }
}, {
    timestamps: true
});

export default mongoose.models.User || mongoose.model("User", userSchema);
