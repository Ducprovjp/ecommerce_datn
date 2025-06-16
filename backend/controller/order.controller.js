const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isSeller, isShipper, isAdmin } = require("../middleware/auth");
const orderService = require("../service/order.service");

const router = express.Router();

// Create new order
router.post(
  "/create-order",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;
    await orderService.createOrder({ cart, shippingAddress, user, totalPrice, paymentInfo }, res, next);
  })
);

// Delete order
router.put(
  "/delete-order/:id",
  catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;
    await orderService.deleteOrder(orderId, res, next);
  })
);

// VNPay success callback
router.get(
  "/vnpay-success",
  catchAsyncErrors(async (req, res, next) => {
    await orderService.handleVNPaySuccess(req.query, res, next);
  })
);

router.post(
  "/cancel-vnpay-order",
  catchAsyncErrors(async (req, res, next) => {
    const { orderId } = req.body;
    await orderService.cancelVNPayOrder(orderId, res, next);
  })
);

// Get all orders of user
router.get(
  "/get-all-orders/:userId",
  catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.userId;
    await orderService.getUserOrders(userId, res, next);
  })
);

// Get all orders of seller
router.get(
  "/get-seller-all-orders/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    const shopId = req.params.shopId;
    await orderService.getSellerOrders(shopId, res, next);
  })
);

// Get all orders of shipper
router.get(
  "/get-shipper-all-orders/:shipperId",
  catchAsyncErrors(async (req, res, next) => {
    const shipperId = req.params.shipperId;
    await orderService.getShipperOrders(shipperId, res, next);
  })
);

// Update order status by shipper
router.put(
  "/update-order-status-by-shipper/:id",
  isShipper,
  catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;
    const { status } = req.body;
    await orderService.updateOrderStatusByShipper(orderId, status, req.shipper, res, next);
  })
);

// Update order status by seller
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;
    const { status } = req.body;
    await orderService.updateOrderStatus(orderId, status, req.seller, res, next);
  })
);

// Request order refund
router.put(
  "/order-refund/:id",
  catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;
    const { status, refundReason } = req.body; 
    await orderService.requestOrderRefund(orderId, status, refundReason, res, next);
  })
);

// Request order cancel
router.put(
  "/order-cancel/:id",
  catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;
    const { status, cancelReason } = req.body;
    await orderService.cancelOrder(orderId, status, cancelReason, res, next);
  })
);

// Accept order refund by seller
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;
    const { status } = req.body;
    await orderService.acceptOrderRefund(orderId, status, res, next);
  })
);

// Get all orders for admin
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    await orderService.getAllOrdersForAdmin(res, next);
  })
);

module.exports = router;