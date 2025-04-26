const express = require("express");
const moment = require("moment-timezone");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller } = require("../middleware/auth");
const CoupounCode = require("../model/coupounCode");
const router = express.Router();

// create coupoun code
router.post(
  "/create-coupon-code",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const isCoupounCodeExists = await CoupounCode.find({
        name: req.body.name,
      });

      if (isCoupounCodeExists.length !== 0) {
        return next(new ErrorHandler("Coupoun code already exists!", 400));
      }

      const coupounCode = await CoupounCode.create(req.body);

      res.status(201).json({
        success: true,
        coupounCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all coupons of a shop
router.get(
  "/get-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCodes = await CoupounCode.find({ shopId: req.seller.id });
      res.status(201).json({
        success: true,
        couponCodes,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all available coupon codes for a user
router.get(
  "/get-all-available-coupons",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Lấy thời gian UTC và thêm 7 giờ (UTC+7)
      const currentDate = new Date(Date.now() + 7 * 60 * 60 * 1000);
      console.log("Current Date:", currentDate.toISOString());

      // Tìm tất cả mã giảm giá đang hoạt động, chưa hết hạn và đã bắt đầu
      const couponCodes = await CoupounCode.find({
        isActive: true,
        endDate: { $gt: currentDate },
        startDate: { $lte: currentDate },
        $or: [
          { usageLimit: 0 },
          { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
        ],
      });

      console.log("Coupons found:", couponCodes);

      res.status(200).json({
        success: true,
        couponCodes,
        debug: {
          currentDate: currentDate.toISOString(),
          totalCouponsFound: couponCodes.length,
        },
      });
    } catch (error) {
      console.error("Error fetching coupons:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// delete coupoun code of a shop
router.delete(
  "/delete-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findByIdAndDelete(req.params.id);

      if (!couponCode) {
        return next(new ErrorHandler("Coupon code dosen't exists!", 400));
      }
      res.status(201).json({
        success: true,
        message: "Coupon code deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get coupon code value by its name
router.get(
  "/get-coupon-value/:name",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findOne({ name: req.params.name });

      res.status(200).json({
        success: true,
        couponCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

module.exports = router;
