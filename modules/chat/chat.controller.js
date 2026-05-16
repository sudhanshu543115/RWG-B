import Conversation from "../../models/chat/Conversation.js";
import Message from "../../models/chat/Message.js";

export const createConversation = async (req, res) => {
  try {
    const { bookingId, touristId, riderId } = req.body;

    let conversation = await Conversation.findOne({
      bookingId
    });

    if (!conversation) {
      conversation = await Conversation.create({
        bookingId,
        touristId,
        riderId
      });
    }

    res.json({
      success: true,
      data: conversation
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.id
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: messages
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};