const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const Shop = require("../model/shop.model");
const Shipper = require("../model/shipper.model");

// Check if user is authenticated or not
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const accessToken = authHeader.split(" ")[1];
  if (!accessToken) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return next(new ErrorHandler("User not found", 401));
    }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token has expired", 401));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token", 401));
    }
    return next(new ErrorHandler("Authentication failed", 401));
  }
});

// Các hàm khác giữ nguyên
exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const seller_accessToken = authHeader.split(" ")[1];
  if (!seller_accessToken) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  try {
    const decoded = jwt.verify(seller_accessToken, process.env.JWT_SECRET_KEY);
    req.seller = await Shop.findById(decoded.id);
    if (!req.seller) {
      return next(new ErrorHandler("Seller not found", 401));
    }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token has expired", 401));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token", 401));
    }
    return next(new ErrorHandler("Authentication failed", 401));
  }
});

exports.isShipper = catchAsyncErrors(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const shipper_accessToken = authHeader.split(" ")[1];
  if (!shipper_accessToken) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  try {
    const decoded = jwt.verify(shipper_accessToken, process.env.JWT_SECRET_KEY);
    req.shipper = await Shipper.findById(decoded.id);
    if (!req.shipper) {
      return next(new ErrorHandler("Shipper not found", 401));
    }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token has expired", 401));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token", 401));
    }
    return next(new ErrorHandler("Authentication failed", 401));
  }
});

exports.isAdmin = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`${req.user.role} can not access this resources!`, 403)
      );
    }
    next();
  };
};