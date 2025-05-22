const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");
const Shipper = require("../model/shipper");

// Check if user is authenticated or not
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { accessToken } = req.cookies;
  if (!accessToken) {
    return next(new ErrorHandler("Please login to continue", 401));
  }
  const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

  req.user = await User.findById(decoded.id);
  if (!req.user) {
    return next(new ErrorHandler("User not found", 401));
  }
  next();
});

exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  const { seller_accessToken } = req.cookies;
  if (!seller_accessToken) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const decoded = jwt.verify(seller_accessToken, process.env.JWT_SECRET_KEY);

  req.seller = await Shop.findById(decoded.id);

  next();
});

exports.isShipper = catchAsyncErrors(async (req, res, next) => {
  const { shipper_accessToken } = req.cookies;
  if (!shipper_accessToken) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const decoded = jwt.verify(shipper_accessToken, process.env.JWT_SECRET_KEY);

  req.shipper = await Shipper.findById(decoded.id);

  next();
});

exports.isAdmin = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`${req.user.role} can not access this resources!`)
      );
    }
    next();
  };
};

// Why this auth?
// This auth is for the user to login and get the token
// This token will be used to access the protected routes like create, update, delete, etc. (autharization)
