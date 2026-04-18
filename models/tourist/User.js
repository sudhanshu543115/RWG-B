import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    phone: String,
    name: String,
    profileCompleted: { type: Boolean, default: false }
});

export default mongoose.models.User || mongoose.model("User", userSchema);
