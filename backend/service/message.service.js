const Messages = require("../model/messages.model");
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
      res.status(201).json({
        success: true,
        message,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async getMessagesByConversationId(conversationId, res, next) {
    try {
      const messages = await Messages.find({ conversationId });
      res.status(201).json({
        success: true,
        messages,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
};

module.exports = messageService;