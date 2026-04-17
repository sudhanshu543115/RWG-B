import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    phone: String,
    name: String
});

export default mongoose.models.User || mongoose.model("User", userSchema);
