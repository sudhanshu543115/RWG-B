import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://sudhanshu:228145@cluster0.ktq8scj.mongodb.net/?appName=Cluster0";

const conversationSchema = new mongoose.Schema({
  bookingId: mongoose.Schema.Types.ObjectId,
  touristId: String,
  riderId: String,
});

const messageSchema = new mongoose.Schema({
  conversationId: mongoose.Schema.Types.ObjectId,
  senderId: String,
  senderRole: String,
  receiverId: String,
  message: String,
  createdAt: Date,
});

const Conversation = mongoose.model("Conversation", conversationSchema);
const Message = mongoose.model("Message", messageSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  const bookingId = "6a0d4e821214fe1015921db0";
  const conversation = await Conversation.findOne({ bookingId });
  console.log("Conversation details for booking:", bookingId, conversation);

  if (conversation) {
    const messages = await Message.find({ conversationId: conversation._id });
    console.log("Total messages stored:", messages.length);
    messages.forEach((msg) => {
      console.log(`[${msg.senderRole} -> ${msg.receiverId}]: ${msg.message} (at ${msg.createdAt})`);
    });
  } else {
    console.log("No conversation found in DB for booking ID:", bookingId);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
