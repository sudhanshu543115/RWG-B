import mongoose from "mongoose";
import { MONGO_URI } from "./env.js";

const connectDB = () => {
    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log("MongoDB connected");
        })
        .catch((err) => {
            console.log(err);
        });
};

export default connectDB;
