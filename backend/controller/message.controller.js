const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { upload } = require("../multer");
const messageService = require("../service/message.service");

const router = express.Router();

// Create new message
router.post(
  "/create-new-message",
  upload.single("images"),
  catchAsyncErrors(async (req, res, next) => {
    const messageData = req.body;
    const file = req.file;
    await messageService.createMessage(messageData, file, res, next);
  })
);

// Get all messages with conversation id
router.get(
  "/get-all-messages/:id",
  catchAsyncErrors(async (req, res, next) => {
    const conversationId = req.params.id;
    await messageService.getMessagesByConversationId(conversationId, res, next);
  })
);

module.exports = router;