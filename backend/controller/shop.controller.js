const express = require("express");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const shopService = require("../service/shop.service");

const router = express.Router();

// Create shop
router.post(
  "/create-shop",
  upload.single("file"),
  catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, phoneNumber, zipCode, province, district, ward, address1 } = req.body;
    await shopService.createShop(req, res, next);
  })
);

// Activate shop
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    const { activation_token } = req.body;
    await shopService.activateShop(activation_token, res, next);
  })
);

// Login shop
router.post(
  "/login-shop",
  catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    await shopService.loginShop(email, password, res, next);
  })
);

// Login with Google
router.post(
  "/auth/google",
  catchAsyncErrors(async (req, res, next) => {
    const { id_token } = req.body;
    await shopService.googleLogin(id_token, res, next);
  })
);

// Refresh token for shop
router.post(
  "/refresh-token",
  catchAsyncErrors(async (req, res, next) => {
    const { refreshToken } = req.body;
    await shopService.refreshToken(refreshToken, res, next);
  })
);

// Logout shop
router.post(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    const { refreshToken } = req.body;
    await shopService.logoutShop(refreshToken, res, next);
  })
);

// Get shop info
router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    const shopId = req.params.id;
    await shopService.getShopInfo(shopId, res, next);
  })
);

// Load shop
router.get(
  "/getSeller",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    await shopService.getSeller(req.seller._id, res, next);
  })
);

// Update shop profile picture
router.put(
  "/update-avatar",
  isSeller,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    await shopService.updateAvatar(req, res, next);
  })
);

// Update seller info
router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const { name, description, phoneNumber, addresses } = req.body;
    await shopService.updateSellerInfo({ name, description, phoneNumber, addresses }, req.seller, res, next);
  })
);

// All sellers --- for admin
router.get(
  "/admin-all-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    await shopService.getAllSellers(res, next);
  })
);

// Delete seller --- admin
router.delete(
  "/delete-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    const sellerId = req.params.id;
    await shopService.deleteSeller(sellerId, res, next);
  })
);

// Update seller withdraw methods --- sellers
router.put(
  "/update-payment-methods",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const { withdrawMethod } = req.body;
    await shopService.updatePaymentMethods(withdrawMethod, req.seller, res, next);
  })
);

// Delete seller withdraw methods --- only seller
router.delete(
  "/delete-withdraw-method",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    await shopService.deleteWithdrawMethod(req.seller, res, next);
  })
);

module.exports = router;