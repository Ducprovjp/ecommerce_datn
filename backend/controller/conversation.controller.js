const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isSeller, isAuthenticated } = require("../middleware/auth");
const conversationService = require("../service/conversation.service");

const router = express.Router();

// Create a new conversation
router.post(
  "/create-new-conversation",
  catchAsyncErrors(async (req, res, next) => {
    const { groupTitle, userId, sellerId } = req.body;
    await conversationService.createConversation({ groupTitle, userId, sellerId }, res, next);
  })
);

// Get seller conversations
router.get(
  "/get-all-conversation-seller/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const sellerId = req.params.id;
    await conversationService.getSellerConversations(sellerId, res, next);
  })
);

// Get user conversations
router.get(
  "/get-all-conversation-user/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.id;
    await conversationService.getUserConversations(userId, res, next);
  })
);

// Update the last message
router.put(
  "/update-last-message/:id",
  catchAsyncErrors(async (req, res, next) => {
    const conversationId = req.params.id;
    const { lastMessage, lastMessageId } = req.body;
    await conversationService.updateLastMessage(conversationId, { lastMessage, lastMessageId }, res, next);
  })
);

module.exports = router;