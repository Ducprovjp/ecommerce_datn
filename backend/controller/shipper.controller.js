const express = require("express");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isShipper, isAdmin } = require("../middleware/auth");
const shipperService = require("../service/shipper.service");

const router = express.Router();

// Create shipper account
router.post(
  "/create-shipper",
  upload.single("file"),
  catchAsyncErrors(async (req, res, next) => {
    await shipperService.createShipper(req, res, next);
  })
);

// Activate shipper account
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    const { activation_token } = req.body;
    await shipperService.activateShipper(activation_token, res, next);
  })
);

// Shipper login
router.post(
  "/login-shipper",
  catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    await shipperService.loginShipper(email, password, res, next);
  })
);

// Refresh token for shipper
router.post(
  "/refresh-token",
  catchAsyncErrors(async (req, res, next) => {
    const { refreshToken } = req.body;
    await shipperService.refreshToken(refreshToken, res, next);
  })
);

// Logout shipper
router.post(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    const { refreshToken } = req.body;
    await shipperService.logoutShipper(refreshToken, res, next);
  })
);

// Get shipper info
router.get(
  "/getShipper",
  isShipper,
  catchAsyncErrors(async (req, res, next) => {
    await shipperService.getShipper(req.shipper._id, res, next);
  })
);

// Get shipper info by ID
router.get(
  "/get-shipper-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    const shipperId = req.params.id;
    await shipperService.getShipperInfo(shipperId, res, next);
  })
);

// Update shipper profile picture
router.put(
  "/update-shipper-avatar",
  isShipper,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    await shipperService.updateShipperAvatar(req, res, next);
  })
);

// Update shipper info
router.put(
  "/update-shipper-info",
  isShipper,
  catchAsyncErrors(async (req, res, next) => {
    const { name, phoneNumber, address } = req.body;
    await shipperService.updateShipperInfo({ name, phoneNumber, address }, req.shipper, res, next);
  })
);

// Update shipper delivery area
router.post(
  "/update-shipper-delivered-area",
  isShipper,
  catchAsyncErrors(async (req, res, next) => {
    await shipperService.updateShipperDeliveredArea(req.body, req.shipper, res, next);
  })
);

// Delete shipper delivery area
router.delete(
  "/delete-shipper-delivered-area/:id",
  isShipper,
  catchAsyncErrors(async (req, res, next) => {
    const deliveredAreaId = req.params.id;
    await shipperService.deleteShipperDeliveredArea(req.shipper._id, deliveredAreaId, res, next);
  })
);

// Get all shippers (admin only)
router.get(
  "/admin-all-shippers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    await shipperService.getAllShippers(res, next);
  })
);

// Delete shipper (admin only)
router.delete(
  "/delete-shipper/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    const shipperId = req.params.id;
    await shipperService.deleteShipper(shipperId, res, next);
  })
);

module.exports = router;