const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const withdrawService = require("../service/withdraw.service");

const router = express.Router();

// Create withdraw request
router.post(
  "/create-withdraw-request",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const { amount } = req.body;
    await withdrawService.createWithdrawRequest(amount, req.seller, res, next);
  })
);

// Get all withdraw requests
router.get(
  "/get-all-withdraw-request",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    await withdrawService.getAllWithdrawRequests(res, next);
  })
);

// Update withdraw request
router.put(
  "/update-withdraw-request/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    const withdrawId = req.params.id;
    const { sellerId } = req.body;
    await withdrawService.updateWithdrawRequest(withdrawId, sellerId, res, next);
  })
);

module.exports = router;