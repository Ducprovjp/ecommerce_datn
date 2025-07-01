const Messages = require("../model/messages.model");
const Conversation = require("../model/conversation.model");
const ErrorHandler = require("../utils/ErrorHandler");
const path = require("path");

const messageService = {
  async createMessage(messageData, file, res, next) {
    try {
      if (file) {
        const filename = file.filename;
        const fileUrl = path.join(filename);
        messageData.images = fileUrl;
      }

      const message = new Messages({
        conversationId: messageData.conversationId,
        text: messageData.text,
        sender: messageData.sender,
        images: messageData.images ? messageData.images : undefined,
      });

      await message.save();

      // Update conversation's last message
      await Conversation.findByIdAndUpdate(messageData.conversationId, {
        lastMessage: messageData.text,
        lastMessageId: message._id,
        updatedAt: new Date()
      });

      // Populate sender information if needed
      const populatedMessage = await Messages.findById(message._id)
        .populate('sender', 'name avatar') // Adjust fields as needed
        .populate('conversationId');

      res.status(201).json({
        success: true,
        message: populatedMessage,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async getMessagesByConversationId(conversationId, res, next) {
    try {
      const messages = await Messages.find({ conversationId })
        .populate('sender', 'name avatar') // Populate sender info
        .sort({ createdAt: 1 }); // Sort by creation time

      res.status(200).json({
        success: true,
        messages,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
};

module.exports = messageService;