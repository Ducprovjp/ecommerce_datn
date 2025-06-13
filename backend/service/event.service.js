const Shop = require("../model/shop.model");
const Event = require("../model/event.model");
const Order = require("../model/order.model");
const ErrorHandler = require("../utils/ErrorHandler");
const fs = require("fs");

const eventService = {
  async createEvent(eventData, files, res, next) {
    try {
      const shopId = eventData.shopId;
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      }

      const imageUrls = files.map((file) => `${file.filename}`);
      eventData.images = imageUrls;
      eventData.shop = shop;

      const event = await Event.create(eventData);
      res.status(201).json({
        success: true,
        product: event,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  },

  async getAllEvents(res, next) {
    try {
      const events = await Event.find();
      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  },

  async getShopEvents(shopId, res, next) {
    try {
      const events = await Event.find({ shopId });
      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  },

  async deleteShopEvent(eventId, res, next) {
    try {
      const eventData = await Event.findById(eventId);
      eventData.images.forEach((imageUrl) => {
        const filename = imageUrl;
        const filePath = `uploads/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
          }
        });
      });

      const event = await Event.findByIdAndDelete(eventId);
      if (!event) {
        return next(new ErrorHandler("Event not found with this id!", 500));
      }

      res.status(201).json({
        success: true,
        message: "Event Deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  },

  async getAllEventsForAdmin(res, next) {
    try {
      const events = await Event.find().sort({ createdAt: -1 });
      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async createNewReview({ user, rating, comment, productId, orderId }, reqUser, res, next) {
    try {
      const event = await Event.findById(productId);
      const review = { user, rating, comment, productId };
      const isReviewed = event.reviews.find((rev) => rev.user._id === reqUser._id);

      if (isReviewed) {
        event.reviews.forEach((rev) => {
          if (rev.user._id === reqUser._id) {
            rev.rating = rating;
            rev.comment = comment;
            rev.user = user;
          }
        });
      } else {
        event.reviews.push(review);
      }

      let avg = 0;
      event.reviews.forEach((rev) => {
        avg += rev.rating;
      });
      event.ratings = avg / event.reviews.length;

      await event.save({ validateBeforeSave: false });
      await Order.findByIdAndUpdate(
        orderId,
        { $set: { "cart.$[elem].isReviewed": true } },
        { arrayFilters: [{ "elem._id": productId }], new: true }
      );

      res.status(200).json({
        success: true,
        message: "Reviewed successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  }
};

module.exports = eventService;