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

      // Xử lý hình ảnh giống như product service
      let imageUrls = [];
      
      // Nếu có files được upload qua multer (trường hợp upload với file mới)
      if (files && files.length > 0) {
        imageUrls = files.map((file) => file.path);
      }
      
      // Nếu có imageUrls được gửi từ FormData (trường hợp create với URLs đã upload trước)
      if (eventData.imageUrls) {
        // imageUrls có thể là string hoặc array
        if (typeof eventData.imageUrls === 'string') {
          try {
            imageUrls = JSON.parse(eventData.imageUrls);
          } catch (e) {
            imageUrls = [eventData.imageUrls];
          }
        } else if (Array.isArray(eventData.imageUrls)) {
          imageUrls = eventData.imageUrls;
        }
      }
      
      // Kiểm tra có hình ảnh không
      // if (!imageUrls || imageUrls.length === 0) {
      //   return next(new ErrorHandler("No images uploaded!", 400));
      // }

      eventData.images = imageUrls;
      eventData.shop = shop;

      const event = await Event.create(eventData);
      res.status(201).json({
        success: true,
        event: event, // Sửa từ 'product' thành 'event'
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
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
      return next(new ErrorHandler(error.message, 400));
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
      return next(new ErrorHandler(error.message, 400));
    }
  },

  async deleteShopEvent(eventId, res, next) {
    try {
      const eventData = await Event.findById(eventId);
      if (!eventData) {
        return next(new ErrorHandler("Event not found with this id!", 404));
      }

      // Xóa hình ảnh từ cloudinary hoặc local storage
      if (eventData.images && eventData.images.length > 0) {
        eventData.images.forEach((imageUrl) => {
          // Nếu dùng cloudinary, imageUrl sẽ là full URL
          // Nếu dùng local storage, cần xử lý khác
          if (imageUrl.includes('cloudinary')) {
            // Xử lý xóa từ cloudinary nếu cần
            console.log('Should delete from cloudinary:', imageUrl);
          } else {
            // Xử lý xóa file local
            const filename = imageUrl;
            const filePath = `uploads/${filename}`;
            fs.unlink(filePath, (err) => {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      }

      const event = await Event.findByIdAndDelete(eventId);
      if (!event) {
        return next(new ErrorHandler("Event not found with this id!", 500));
      }

      res.status(201).json({
        success: true,
        message: "Event Deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
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
      if (!event) {
        return next(new ErrorHandler("Event not found!", 404));
      }

      const review = { user, rating, comment, productId };
      const isReviewed = event.reviews.find((rev) => rev.user._id.toString() === reqUser._id.toString());

      if (isReviewed) {
        event.reviews.forEach((rev) => {
          if (rev.user._id.toString() === reqUser._id.toString()) {
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
      return next(new ErrorHandler(error.message, 400));
    }
  }
};

module.exports = eventService;