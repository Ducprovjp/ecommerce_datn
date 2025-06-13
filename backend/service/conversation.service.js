const Conversation = require("../model/conversation.model");
const ErrorHandler = require("../utils/ErrorHandler");

const conversationService = {
  async createConversation({ groupTitle, userId, sellerId }, res, next) {
    try {
      const isConversationExist = await Conversation.findOne({ groupTitle });
      if (isConversationExist) {
        res.status(201).json({
          success: true,
          conversation: isConversationExist,
        });
      } else {
        const conversation = await Conversation.create({
          members: [userId, sellerId],
          groupTitle,
        });
        res.status(201).json({
          success: true,
          conversation,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async getSellerConversations(sellerId, res, next) {
    try {
      const conversations = await Conversation.find({
        members: { $in: [sellerId] },
      }).sort({ updatedAt: -1, createdAt: -1 });
      res.status(201).json({
        success: true,
        conversations,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  },

  async getUserConversations(userId, res, next) {
    try {
      const conversations = await Conversation.find({
        members: { $in: [userId] },
      }).sort({ updatedAt: -1, createdAt: -1 });
      res.status(201).json({
        success: true,
        conversations,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  },

  async updateLastMessage(conversationId, { lastMessage, lastMessageId }, res, next) {
    try {
      const conversation = await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage,
        lastMessageId,
      });
      res.status(201).json({
        success: true,
        conversation,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  }
};

module.exports = conversationService;