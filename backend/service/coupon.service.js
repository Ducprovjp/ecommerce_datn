const CoupounCode = require("../model/coupon.model");
const ErrorHandler = require("../utils/ErrorHandler");

const couponService = {
  async createCouponCode(couponData, seller, res, next) {
    try {
      const isCoupounCodeExists = await CoupounCode.find({ name: couponData.name });
      if (isCoupounCodeExists.length !== 0) {
        return next(new ErrorHandler("Coupoun code already exists!", 400));
      }

      const coupounCode = await CoupounCode.create({ ...couponData, shopId: seller.id });
      res.status(201).json({
        success: true,
        coupounCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  },

  async getShopCoupons(shopId, res, next) {
    try {
      const couponCodes = await CoupounCode.find({ shopId });
      res.status(201).json({
        success: true,
        couponCodes,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  },

  async getAllAvailableCoupons(res, next) {
    try {
      const currentDate = new Date(Date.now() + 7 * 60 * 60 * 1000);
      console.log("Current Date:", currentDate.toISOString());

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
  },

  async deleteCoupon(couponId, res, next) {
    try {
      const couponCode = await CoupounCode.findByIdAndDelete(couponId);
      if (!couponCode) {
        return next(new ErrorHandler("Coupon code doesn't exist!", 400));
      }
      res.status(201).json({
        success: true,
        message: "Coupon code deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  },

  async getCouponValue(couponName, res, next) {
    try {
      const couponCode = await CoupounCode.findOne({ name: couponName });
      res.status(200).json({
        success: true,
        couponCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  }
};

module.exports = couponService;