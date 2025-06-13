const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isSeller } = require("../middleware/auth");
const couponService = require("../service/coupon.service");

const router = express.Router();

// Create coupon code
router.post(
  "/create-coupon-code",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    await couponService.createCouponCode(req.body, req.seller, res, next);
  })
);

// Get all coupons of a shop
router.get(
  "/get-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    await couponService.getShopCoupons(req.seller.id, res, next);
  })
);

// Get all available coupon codes for a user
router.get(
  "/get-all-available-coupons",
  catchAsyncErrors(async (req, res, next) => {
    await couponService.getAllAvailableCoupons(res, next);
  })
);

// Delete coupon code of a shop
router.delete(
  "/delete-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const couponId = req.params.id;
    await couponService.deleteCoupon(couponId, res, next);
  })
);

// Get coupon code value by its name
router.get(
  "/get-coupon-value/:name",
  catchAsyncErrors(async (req, res, next) => {
    const couponName = req.params.name;
    await couponService.getCouponValue(couponName, res, next);
  })
);

module.exports = router;