const express = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { upload } = require("../multer");
const productService = require("../service/product.service");

const router = express.Router();

// Upload image
router.post(
  "/upload-image",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    await productService.uploadImage(req.files, res, next);
  })
);

// Create product
router.post(
  "/create-product",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    const productData = req.body;
    await productService.createProduct(productData, req.files, res, next);
  })
);

// Update product
router.put(
  "/update-product/:id",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    const productId = req.params.id;
    const updatedData = req.body;
    await productService.updateProduct(productId, updatedData, req.files, res, next);
  })
);

// Get all products of a shop
router.get(
  "/get-all-products-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    const shopId = req.params.id;
    await productService.getAllProductsShop(shopId, res, next);
  })
);

// Delete product of a shop
router.delete(
  "/delete-shop-product/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const productId = req.params.id;
    await productService.deleteShopProduct(productId, res, next);
  })
);

// Get all products
router.get(
  "/get-all-products",
  catchAsyncErrors(async (req, res, next) => {
    const { minPrice, maxPrice, category, sort, page, limit } = req.query;
    await productService.getAllProducts({ minPrice, maxPrice, category, sort, page, limit }, res, next);
  })
);

// Review for a product
router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { user, rating, comment, productId, orderId } = req.body;
    await productService.createNewReview({ user, rating, comment, productId, orderId }, req.user, res, next);
  })
);

// All products for admin
router.get(
  "/admin-all-products",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    await productService.getAllProductsForAdmin(res, next);
  })
);

module.exports = router;