const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const paymentService = require("../service/payment.service");

const router = express.Router();

// Process Stripe payment
router.post(
  "/process",
  catchAsyncErrors(async (req, res, next) => {
    const { amount } = req.body;
    await paymentService.processStripePayment(amount, res, next);
  })
);

// Get Stripe API key
router.get(
  "/stripeapikey",
  catchAsyncErrors(async (req, res, next) => {
    await paymentService.getStripeApiKey(res, next);
  })
);

// Process VNPay payment
router.post(
  "/vnpay",
  catchAsyncErrors(async (req, res, next) => {
    const { totalPrice, cart, shippingAddress, user, couponCodePerShop } = req.body;
    await paymentService.processVNPayPayment({ totalPrice, cart, shippingAddress, user, couponCodePerShop }, res, next);
  })
);

module.exports = router;