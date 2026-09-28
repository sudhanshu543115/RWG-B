import mongoose from "mongoose";
import { MONGO_URI } from "./env.js";
import seedConfig from "./seedConfig.js";

const connectDB = () => {
    mongoose.connect(MONGO_URI, {
        maxPoolSize: 100, // Up to 100 concurrent DB queries per instance
        minPoolSize: 10,  // Keeps 10 warm connections ready
        serverSelectionTimeoutMS: 5000,
    })
        .then(() => {

            console.log("MongoDB connected");
            seedConfig();
        })
        .catch((err) => {
            console.log(err);
        });
};

export default connectDB;
