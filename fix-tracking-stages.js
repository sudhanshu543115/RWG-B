import mongoose from "mongoose";
import Booking from "./models/tourist/Booking.js";
import dotenv from "dotenv";

dotenv.config();

const fixTrackingStages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const validStages = [
      "assigned",
      "heading_to_pickup",
      "arrived_at_pickup",
      "trip_started",
      "heading_to_stop",
      "arrived_at_stop",
      "completed_stop",
      "heading_to_drop",
      "completed"
    ];

    const invalidBookings = await Booking.find({
      "tracking.currentStage": { $nin: validStages }
    });

    console.log(`🔍 Found ${invalidBookings.length} bookings with invalid tracking stages`);

    let fixedCount = 0;
    for (const booking of invalidBookings) {
      const invalidStage = booking.tracking?.currentStage;
      console.log(`📝 Found invalid stage: "${invalidStage}" in booking ${booking._id}`);
      
      // Fix invalid stages
      if (invalidStage === "payment_pending") {
        booking.tracking.currentStage = "trip_started";
      } else {
        // Default to trip_started for unknown stages
        booking.tracking.currentStage = "trip_started";
      }
      
      await booking.save();
      fixedCount++;
      console.log(`✅ Fixed booking ${booking._id}`);
    }

    console.log(`\n✅ Successfully fixed ${fixedCount} bookings`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixTrackingStages();