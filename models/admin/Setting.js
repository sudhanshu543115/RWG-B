import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    autoAssign: { type: Boolean, default: false }
});

export default mongoose.model("Settings", settingsSchema);
