const Shipper = require("../model/shipper.model");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendShipperToken = require("../utils/shipperToken");
const ErrorHandler = require("../utils/ErrorHandler");

const shipperService = {
  async createShipper(req, res, next) {
    try {
      const { email, name, password, address, phoneNumber } = req.body;
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
        name,
        email,
        password,
        avatar: fileUrl,
        address,
        phoneNumber,
      };

      const activationToken = this.createActivationToken(shipper);
      const activationUrl = `${process.env.REACT_APP_FRONT_END_URL}/shipper/activation/${activationToken}`;

      try {
        await sendMail({
          email: shipper.email,
          subject: "Activate your Shipper Account",
          message: `Hello ${shipper.name}, please click on the link to activate your account: ${activationUrl}`,
        });
        res.status(201).json({
          success: true,
          message: `Please check your email: ${shipper.email} to activate your account!`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  },

  async activateShipper(activation_token, res, next) {
    try {
      const newShipper = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
      if (!newShipper) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar, address, phoneNumber } = newShipper;

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
  },

  async loginShipper(email, password, res, next) {
    try {
      if (!email || !password) {
        return next(new ErrorHandler("Please provide all fields", 400));
      }

      const user = await Shipper.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("User doesn't exist", 400));
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(new ErrorHandler("Incorrect password", 400));
      }

      sendShipperToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async refreshToken(refreshToken, res, next) {
    if (!refreshToken) {
      return next(new ErrorHandler("Refresh token not found", 401));
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET || process.env.JWT_SECRET_KEY);
      const shipper = await Shipper.findById(decoded.id);

      if (!shipper || shipper.refreshToken !== refreshToken) {
        return next(new ErrorHandler("Invalid refresh token", 401));
      }

      sendShipperToken(shipper, 200, res);
    } catch (error) {
      return next(new ErrorHandler("Invalid or expired refresh token", 401));
    }
  },

  async logoutShipper(refreshToken, res, next) {
    try {
      if (refreshToken) {
        try {
          const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET || process.env.JWT_SECRET_KEY);
          const shipper = await Shipper.findById(decoded.id);
          if (shipper && shipper.refreshToken === refreshToken) {
            shipper.refreshToken = null;
            await shipper.save({ validateBeforeSave: false });
          }
        } catch (error) {
          // If refresh token is invalid, no action needed
        }
      }

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async getShipper(shipperId, res, next) {
    try {
      const shipper = await Shipper.findById(shipperId);
      if (!shipper) {
        return next(new ErrorHandler("User doesn't exist", 400));
      }

      res.status(200).json({ success: true, shipper });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async getShipperInfo(shipperId, res, next) {
    try {
      const shipper = await Shipper.findById(shipperId);
      res.status(201).json({
        success: true,
        shipper,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async updateShipperAvatar(req, res, next) {
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
  },

  async updateShipperInfo({ name, phoneNumber, address }, shipper, res, next) {
    try {
      const existingShipper = await Shipper.findById(shipper._id);
      if (!existingShipper) {
        return next(new ErrorHandler("Shipper not found", 400));
      }

      existingShipper.name = name;
      existingShipper.phoneNumber = phoneNumber;
      existingShipper.address = address;

      await existingShipper.save();
      res.status(201).json({ success: true, shipper: existingShipper });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async updateShipperDeliveredArea(deliveredAreaData, shipper, res, next) {
    try {
      const existingShipper = await Shipper.findById(shipper._id);
      const existsDeliveredArea = existingShipper.deliveredArea.find(
        (delivered_area) => delivered_area._id === deliveredAreaData._id
      );

      if (existsDeliveredArea) {
        Object.assign(existsDeliveredArea, deliveredAreaData);
      } else {
        existingShipper.deliveredArea.push(deliveredAreaData);
      }

      await existingShipper.save();
      res.status(200).json({
        success: true,
        shipper: existingShipper,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async deleteShipperDeliveredArea(shipperId, deliveredAreaId, res, next) {
    try {
      const shipper = await Shipper.findById(shipperId);
      await Shipper.updateOne(
        { _id: shipperId },
        { $pull: { deliveredArea: { _id: deliveredAreaId } } }
      );
      const updatedShipper = await Shipper.findById(shipperId);
      res.status(200).json({ success: true, shipper: updatedShipper });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async getAllShippers(res, next) {
    try {
      const shippers = await Shipper.find().sort({ createdAt: -1 });
      res.status(201).json({ success: true, shippers });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async deleteShipper(shipperId, res, next) {
    try {
      const shipper = await Shipper.findById(shipperId);
      if (!shipper) {
        return next(new ErrorHandler("Shipper not found", 400));
      }
      await Shipper.findByIdAndDelete(shipperId);
      res.status(201).json({ success: true, message: "Shipper deleted successfully" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  createActivationToken(shipper) {
    return jwt.sign(shipper, process.env.ACTIVATION_SECRET, {
      expiresIn: "5m",
    });
  }
};

module.exports = shipperService;