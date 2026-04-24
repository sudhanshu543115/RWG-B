import mongoose from "mongoose";

const riderSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    vehicleType: { type: String, default: "" },
    vehicleModel: { type: String, default: "" },
    vehicleNumber: { type: String, default: "" },
    licenseNumber: { type: String, default: "" },
    licenseExpiry: { type: Date, default: null },
    vehicleImage: { type: String, default: "" },
    licenseImage: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    profileCompleted: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
}, {
    timestamps: true
});

export default mongoose.models.Rider || mongoose.model("Rider", riderSchema);
