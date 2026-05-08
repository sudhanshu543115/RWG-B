import mongoose from "mongoose";
import { MONGO_URI } from "./env.js";
import seedConfig from "./seedConfig.js";

const connectDB = () => {
    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log("MongoDB connected");
            seedConfig();
        })
        .catch((err) => {
            console.log(err);
        });
};

export default connectDB;
