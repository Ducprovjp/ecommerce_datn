const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { upload } = require("../multer");
const { isSeller, isAdmin, isAuthenticated } = require("../middleware/auth");
const eventService = require("../service/event.service");

const router = express.Router();

// Create event
router.post(
  "/create-event",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    const eventData = req.body;
    await eventService.createEvent(eventData, req.files, res, next);
  })
);

// Get all events
router.get(
  "/get-all-events",
  catchAsyncErrors(async (req, res, next) => {
    await eventService.getAllEvents(res, next);
  })
);

// Get all events of a shop
router.get(
  "/get-all-events/:id",
  catchAsyncErrors(async (req, res, next) => {
    const shopId = req.params.id;
    await eventService.getShopEvents(shopId, res, next);
  })
);

// Delete event of a shop
router.delete(
  "/delete-shop-event/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const eventId = req.params.id;
    await eventService.deleteShopEvent(eventId, res, next);
  })
);

// All events for admin
router.get(
  "/admin-all-events",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    await eventService.getAllEventsForAdmin(res, next);
  })
);

// Review for an event
router.put(
  "/create-new-review-event",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { user, rating, comment, productId, orderId } = req.body;
    await eventService.createNewReview({ user, rating, comment, productId, orderId }, req.user, res, next);
  })
);

module.exports = router;