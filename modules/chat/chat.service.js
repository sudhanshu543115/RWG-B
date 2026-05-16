import Conversation from "../../models/chat/Conversation.js";
import Message from "../../models/chat/Message.js";

export async function createConversation(data) {
  return await Conversation.create(data);
}

export async function getMessages(conversationId) {
  return await Message.find({
    conversationId
  }).sort({ createdAt: 1 });
}