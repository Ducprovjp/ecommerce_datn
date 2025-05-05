const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const Shipper = require("../model/shipper");
const { isAuthenticated, isShipper, isAdmin } = require("../middleware/auth");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const sendShipperToken = require("../utils/shipperToken");

// Create shipper account
router.post(
  "/create-shipper",
  upload.single("file"),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const existingShipper = await Shipper.findOne({ email });

      if (existingShipper) {
        const filename = req.file.filename;
        const filePath = `uploads/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
            res.status(500).json({ message: "Error deleting file" });
          }
        });
        return next(new ErrorHandler("User already exists", 400));
      }

      const filename = req.file.filename;
      const fileUrl = path.join(filename);

      const shipper = {
        name: req.body.name,
        email: email,
        password: req.body.password,
        avatar: fileUrl,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
      };

      const activationToken = createActivationToken(shipper);
      const activationUrl = `${process.env.REACT_APP_FRONT_END_URL}/shipper/activation/${activationToken}`;

      try {
        await sendMail({
          email: shipper.email,
          subject: "Activate your Shipper Account",
          message: `Hello ${shipper.name}, please click on the link to activate your account: ${activationUrl}`,
        });
        res.status(201).json({
          success: true,
          message: `please check your email: ${shipper.email} to activate your account!`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Create activation token
const createActivationToken = (shipper) => {
  return jwt.sign(shipper, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

// Activate shipper account
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;
      const newShipper = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newShipper) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar, address, phoneNumber } =
        newShipper;

      let shipper = await Shipper.findOne({ email });
      if (shipper) {
        return next(new ErrorHandler("User already exists", 400));
      }

      shipper = await Shipper.create({
        name,
        email,
        avatar,
        password,
        address,
        phoneNumber,
      });

      sendShipperToken(shipper, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Shipper login
router.post(
  "/login-shipper",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("Please provide all fields!", 400));
      }

      const user = await Shipper.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("User doesn't exist!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }

      sendShipperToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get shipper info
router.get(
  "/getShipper",
  isShipper,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shipper = await Shipper.findById(req.shipper._id);
      if (!shipper) {
        return next(new ErrorHandler("User doesn't exist", 400));
      }

      res.status(200).json({ success: true, shipper });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Logout shipper
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("shipper_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: process.env.NODE_ENV === "PRODUCTION", // HTTPS trong PRODUCTION
        sameSite: process.env.NODE_ENV === "PRODUCTION" ? "none" : "lax", // Cross-origin trong production
        path: "/", // Áp dụng cho toàn bộ domain
      });
      res.status(201).json({ success: true, message: "Logout successful!" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get shipper info
router.get(
  "/get-shipper-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shipper = await Shipper.findById(req.params.id);
      res.status(201).json({
        success: true,
        shipper,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update shipper profile picture
router.put(
  "/update-shipper-avatar",
  isShipper,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const existsUser = await Shipper.findById(req.shipper._id);

      if (existsUser.avatar) {
        const existAvatarPath = `uploads/${existsUser.avatar}`;
        fs.unlinkSync(existAvatarPath);
      }

      const fileUrl = path.join(req.file.filename);
      const shipper = await Shipper.findByIdAndUpdate(req.shipper._id, {
        avatar: fileUrl,
      });

      res.status(200).json({
        success: true,
        shipper,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update shipper info
router.put(
  "/update-shipper-info",
  isShipper,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, phoneNumber, address } = req.body;

      const shipper = await Shipper.findById(req.shipper._id);
      if (!shipper) {
        return next(new ErrorHandler("Shipper not found", 400));
      }

      shipper.name = name;
      shipper.phoneNumber = phoneNumber;
      shipper.address = address;

      await shipper.save();
      res.status(201).json({ success: true, shipper });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update shipper delivery area
router.post(
  "/update-shipper-delivered-area",
  isShipper,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shipper = await Shipper.findById(req.shipper._id);
      const existsDeliveredArea = shipper.deliveredArea.find(
        (delivered_area) => delivered_area._id === req.body._id
      );

      if (existsDeliveredArea) {
        Object.assign(existsDeliveredArea, req.body);
      } else {
        // add the new delivery area to the array
        shipper.deliveredArea.push(req.body);
      }

      await shipper.save();

      res.status(200).json({
        success: true,
        shipper,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.delete(
  "/delete-shipper-delivered-area/:id",
  isShipper,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shipperId = req.shipper._id;
      const deliveredAreaId = req.params.id;

      //   console.log(deliveredAreaId);

      await Shipper.updateOne(
        {
          _id: shipperId,
        },
        { $pull: { deliveredArea: { _id: deliveredAreaId } } }
      );

      const shipper = await Shipper.findById(shipperId);

      res.status(200).json({ success: true, shipper });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get all shippers (admin only)
router.get(
  "/admin-all-shippers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shippers = await Shipper.find().sort({ createdAt: -1 });
      res.status(201).json({ success: true, shippers });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete shipper (admin only)
router.delete(
  "/delete-shipper/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shipper = await Shipper.findById(req.params.id);
      if (!shipper) {
        return next(new ErrorHandler("Shipper not found with this ID", 400));
      }

      await Shipper.findByIdAndDelete(req.params.id);
      res
        .status(201)
        .json({ success: true, message: "Shipper deleted successfully!" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
