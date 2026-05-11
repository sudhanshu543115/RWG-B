import mongoose from "mongoose";

const riderSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    //password: { type: String, default: "" }, 
    
    // Step 1: Personal
    city: { type: String, default: "" },
    gender: { type: String, default: "" },
    profileImage: { type: String, default: "" },

    // Step 2: Vehicle & Expertise
    vehicleType: { 
        type: String, 
        enum: ["bike", "bike-light", "cab", "auto", ""], 
        default: "" 
    },
    vehicleModel: { type: String, default: "" },
    vehicleNumber: { type: String, default: "" },
    languages: { type: [String], default: [] },
    expertise: { type: [String], default: [] },
    bio: { type: String, default: "" },

    // Step 3: Documents
    aadhaarNumber: { type: String, default: "" },
    aadhaarImage: { type: String, default: "" },
    licenseNumber: { type: String, default: "" },
    licenseExpiry: { type: Date, default: null },
    licenseImage: { type: String, default: "" },
    rcImage: { type: String, default: "" },
    insuranceImage: { type: String, default: "" },
    vehicleImage: { type: String, default: "" }, 
    selfieImage: { type: String, default: "" },

    // Status & Verification
    profileCompleted: { type: Boolean, default: false },
    verificationStatus: { 
        type: String, 
        enum: ["pending", "approved", "rejected"], 
        default: "pending" 
    },
    isVerified: { type: Boolean, default: false }, // Sync with approved status
    
    // Runtime
    isOnline: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
    totalRides: { type: Number, default: 0 },
}, {
    timestamps: true
});

export default mongoose.models.Rider || mongoose.model("Rider", riderSchema);
