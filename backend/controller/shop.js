const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const Shop = require("../model/shop");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const { upload } = require("../multer");
const cloudinary = require("../cloudinary");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const sendShopToken = require("../utils/shopToken");
const { OAuth2Client } = require("google-auth-library");

// Create shop
router.post(
  "/create-shop",
  upload.single("file"),
  catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, address, phoneNumber, zipCode } = req.body;
    console.log("Received shop creation request:", {
      name,
      email,
      hasFile: !!req.file,
      address,
      phoneNumber,
      zipCode,
    });

    // Validate required fields
    if (!name) return next(new ErrorHandler("Name is required", 400));
    if (!email) return next(new ErrorHandler("Email is required", 400));
    if (!password) return next(new ErrorHandler("Password is required", 400));
    if (password.length < 4) {
      return next(new ErrorHandler("Password must be at least 4 characters", 400));
    }
    if (!address) return next(new ErrorHandler("Address is required", 400));
    if (!phoneNumber) return next(new ErrorHandler("Phone number is required", 400));
    if (!zipCode) return next(new ErrorHandler("Zip code is required", 400));

    // Check if email already exists
    const sellerEmail = await Shop.findOne({ email });
    if (sellerEmail) {
      if (req.file) {
        // Delete image from Cloudinary if email already exists
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (err) {
          console.error("Error deleting image from Cloudinary:", err);
        }
      }
      return next(new ErrorHandler("Shop already exists", 400));
    }

    // Handle avatar
    let fileUrl = "default-avatar.png";
    if (req.file) {
      // Get public URL from Cloudinary
      fileUrl = req.file.path; // Full URL from Cloudinary
      console.log("Uploaded file URL:", fileUrl);
    }

    const seller = {
      name,
      email,
      password,
      avatar: fileUrl,
      address,
      phoneNumber,
      zipCode,
    };

    // Create activation token
    const createActivationToken = (seller) => {
      if (!process.env.ACTIVATION_SECRET) {
        throw new Error("ACTIVATION_SECRET not configured");
      }
      return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
      });
    };

    const activationToken = createActivationToken(seller);

    // Use dynamic domain for activation URL
    const domain = process.env.REACT_APP_FRONT_END_URL;
    const activationUrl = `${domain}/seller/activation/${activationToken}`;

    const message = `Hello ${seller.name}, please click on the link to activate your shop: <a href="${activationUrl}" style="text-decoration: underline; color: blue; font-weight: bold;">ACTIVATE</a>`;

    // Send email
    console.log("Sending activation email to:", seller.email);
    try {
      await sendMail({
        email: seller.email,
        subject: "Activate your shop",
        html: message,
      });
      res.status(201).json({
        success: true,
        message: `Please check your email (${seller.email}) to activate your shop!`,
      });
    } catch (err) {
      // Delete image from Cloudinary if email sending fails
      if (req.file) {
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (err) {
          console.error("Error deleting image from Cloudinary:", err);
        }
      }
      return next(new ErrorHandler("Failed to send activation email", 500));
    }
  })
);

// Activate shop
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    const { activation_token } = req.body;
    console.log("Received shop activation request:", { activation_token });

    if (!activation_token) {
      return next(new ErrorHandler("Activation token is required", 400));
    }

    try {
      if (!process.env.ACTIVATION_SECRET) {
        throw new Error("ACTIVATION_SECRET not configured");
      }

      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );
      console.log("Decoded token:", newSeller);

      const { name, email, password, avatar, zipCode, address, phoneNumber } = newSeller;

      // Check if shop already exists
      const existingSeller = await Shop.findOne({ email });
      if (existingSeller) {
        return next(new ErrorHandler("Shop already exists", 400));
      }

      // Create shop
      console.log("Creating shop:", email);
      const seller = await Shop.create({
        name,
        email,
        password: password || undefined, // Handle undefined password
        avatar: avatar || "default-avatar.png", // Default avatar
        zipCode,
        address,
        phoneNumber,
      });

      console.log("Shop created:", seller.email);
      sendShopToken(seller, 201, res);
    } catch (err) {
      console.error("Activation error:", err);
      if (err.name === "TokenExpiredError") {
        return next(new ErrorHandler("Activation token has expired", 400));
      }
      return next(new ErrorHandler("Invalid activation token", 400));
    }
  })
);

// Login shop
router.post(
  "/login-shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide all fields", 400));
      }

      const user = await Shop.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User doesn't exist", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(new ErrorHandler("Incorrect password", 400));
      }

      sendShopToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Login with Google
router.post(
  "/auth/google",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const { id_token } = req.body;

      if (!id_token) {
        console.error("No ID token provided");
        return next(new ErrorHandler("ID token is required", 400));
      }

      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const googleId = payload["sub"];
      const email = payload["email"];
      const name = payload["name"];
      const picture = payload["picture"]; // Google profile picture

      // Check if seller exists, or create a new one
      let seller = await Shop.findOne({ googleId });

      if (!seller) {
        seller = await Shop.findOne({ email });
        if (seller) {
          // Link Google ID to existing seller
          seller.googleId = googleId;
          if (picture) seller.avatar = picture; // Update avatar if available
          await seller.save();
        } else {
          // Create new seller
          console.log("Creating new seller:", email);
          seller = await Shop.create({
            googleId,
            email,
            name,
            avatar: picture || "default-avatar.png", // Default avatar if none provided
          });
        }
      }

      sendShopToken(seller, 201, res);
    } catch (error) {
      console.error("Google authentication error:", error);
      return next(new ErrorHandler("Google authentication failed: " + error.message, 400));
    }
  })
);

// Refresh token for shop
router.post(
  "/refresh-token",
  catchAsyncErrors(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new ErrorHandler("Refresh token not found", 401));
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
      const shop = await Shop.findById(decoded.id);

      if (!shop || shop.refreshToken !== refreshToken) {
        return next(new ErrorHandler("Invalid refresh token", 401));
      }

      sendShopToken(shop, 200, res);
    } catch (error) {
      return next(new ErrorHandler("Invalid or expired refresh token", 401));
    }
  })
);

// Logout shop
router.post(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        try {
          const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
          const shop = await Shop.findById(decoded.id);
          if (shop && shop.refreshToken === refreshToken) {
            shop.refreshToken = null;
            await shop.save({ validateBeforeSave: false });
          }
        } catch (error) {
          // Nếu refresh token không hợp lệ, không cần làm gì thêm
        }
      }

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get shop info
router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Load shop
router.get(
  "/getSeller",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("User doesn't exist", 400));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update shop profile picture
router.put(
  "/update-avatar",
  isSeller,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("Update avatar request received for seller:", req.seller?.id);
      const seller = await Shop.findById(req.seller.id);
      if (!seller) {
        console.log("Seller not found:", req.seller.id);
        return next(new ErrorHandler("Seller not found", 404));
      }

      if (!req.file) {
        console.log("No image provided in request");
        return next(new ErrorHandler("No image provided", 400));
      }

      console.log("Cloudinary file details:", req.file);

      if (seller.avatar && seller.avatar !== "default-avatar.png") {
        try {
          const publicId = seller.avatar.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`avatars/${publicId}`);
          console.log("Deleted old avatar from Cloudinary:", publicId);
        } catch (err) {
          console.error("Error deleting old avatar from Cloudinary:", err);
        }
      }

      const fileUrl = req.file.path;
      console.log("New avatar uploaded to Cloudinary:", fileUrl);

      const updatedSeller = await Shop.findByIdAndUpdate(
        req.seller.id,
        { avatar: fileUrl },
        { new: true }
      );

      console.log("Avatar updated for seller:", updatedSeller.email);

      res.status(200).json({
        success: true,
        seller: updatedSeller,
      });
    } catch (error) {
      console.error("Update avatar error:", error);
      return next(new ErrorHandler(error.message || "Failed to update avatar", 500));
    }
  })
);

// Update seller info
router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      const shop = await Shop.findOne(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler("User not found", 400));
      }

      shop.name = name;
      shop.description = description;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;

      await shop.save();

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// All sellers --- for admin
router.get(
  "/admin-all-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sellers = await Shop.find().sort({ createdAt: -1 });
      res.status(201).json({
        success: true,
        sellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete seller --- admin
router.delete(
  "/delete-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found", 400));
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "Seller deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update seller withdraw methods --- sellers
router.put(
  "/update-payment-methods",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        withdrawMethod,
      });

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete seller withdraw methods --- only seller
router.delete(
  "/delete-withdraw-method",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found", 400));
      }

      seller.withdrawMethod = null;

      await seller.save();

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;