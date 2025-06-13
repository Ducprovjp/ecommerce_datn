const User = require("../model/user.model");
const cloudinary = require("../cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const { OAuth2Client } = require("google-auth-library");

const userService = {
  async createUser(req, res, next) {
    const { name, email, password } = req.body;
    console.log("Received signup request:", {
      name,
      email,
      hasFile: !!req.file,
    });

    if (!name) return next(new ErrorHandler("Name is required", 400));
    if (!email) return next(new ErrorHandler("Email is required", 400));
    if (!password) return next(new ErrorHandler("Password is required", 400));
    if (password.length < 4) {
      return next(new ErrorHandler("Password must be at least 4 characters", 400));
    }

    const userEmail = await User.findOne({ email });
    if (userEmail) {
      if (req.file) {
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (err) {
          console.error("Lỗi xóa ảnh trên Cloudinary:", err);
        }
      }
      return next(new ErrorHandler("User already exists", 400));
    }

    let fileUrl = "default-avatar.png";
    if (req.file) {
      fileUrl = req.file.path;
      console.log("Uploaded file URL:", fileUrl);
    }

    const user = { name, email, password, avatar: fileUrl };

    const createActivationToken = (user) => {
      if (!process.env.ACTIVATION_SECRET) {
        throw new Error("ACTIVATION_SECRET chưa được cấu hình");
      }
      return jwt.sign(user, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
      });
    };

    const activationToken = createActivationToken(user);
    const domain = process.env.REACT_APP_FRONT_END_URL;
    const activationUrl = `${domain}/activation/${activationToken}`;
    const message = `Hello ${user.name}, please click on the link to activate your account: <a href="${activationUrl}" style="text-decoration: underline; color: blue; font-weight: bold;">ACTIVATE</a>`;

    console.log("Gửi email kích hoạt đến:", user.email);
    try {
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        html: message,
      });
      res.status(201).json({
        success: true,
        message: `Please check your email (${user.email}) to activate your account!`,
      });
    } catch (err) {
      if (req.file) {
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (err) {
          console.error("Lỗi xóa ảnh trên Cloudinary:", err);
        }
      }
      return next(new ErrorHandler("Failed to send activation email", 500));
    }
  },

  async activateUser(activation_token, res, next) {
    console.log("Received activation request:", { activation_token });
    if (!activation_token) {
      return next(new ErrorHandler("Activation token is required", 400));
    }

    try {
      if (!process.env.ACTIVATION_SECRET) {
        throw new Error("ACTIVATION_SECRET chưa được cấu hình");
      }

      const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
      console.log("Decoded token:", newUser);

      const { name, email, password, avatar } = newUser;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(new ErrorHandler("User already exists", 400));
      }

      console.log("Tạo người dùng:", email);
      const user = await User.create({
        name,
        email,
        password: password || undefined,
        avatar: avatar || "default-avatar.png",
      });

      console.log("Người dùng đã được tạo:", user.email);
      sendToken(user, 201, res);
    } catch (err) {
      console.error("Lỗi kích hoạt:", err);
      if (err.name === "TokenExpiredError") {
        return next(new ErrorHandler("Activation token has expired", 400));
      }
      return next(new ErrorHandler("Invalid activation token", 400));
    }
  },

  async loginUser(email, password, res, next) {
    try {
      if (!email || !password) {
        return next(new ErrorHandler("Please provide all fields", 400));
      }
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("User doesn't exist", 400));
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(new ErrorHandler("Incorrect password", 400));
      }
      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async googleLogin(id_token, res, next) {
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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
      const picture = payload["picture"];

      let user = await User.findOne({ googleId });
      if (!user) {
        user = await User.findOne({ email });
        if (user) {
          user.googleId = googleId;
          if (picture) user.avatar = picture;
          await user.save();
        } else {
          console.log("Creating new user:", email);
          user = await User.create({
            googleId,
            email,
            name,
            avatar: picture || "default-avatar.png",
          });
        }
      }
      sendToken(user, 201, res);
    } catch (error) {
      console.error("Google authentication error:", error);
      return next(new ErrorHandler("Google authentication failed: " + error.message, 400));
    }
  },

  async refreshToken(refreshToken, res, next) {
    if (!refreshToken) {
      return next(new ErrorHandler("Refresh token not found", 401));
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
      const user = await User.findById(decoded.id);
      if (!user || user.refreshToken !== refreshToken) {
        return next(new ErrorHandler("Invalid refresh token", 401));
      }
      sendToken(user, 200, res);
    } catch (error) {
      return next(new ErrorHandler("Invalid or expired refresh token", 401));
    }
  },

  async forgotPassword(email, res, next) {
    try {
      if (!email) {
        return next(new ErrorHandler("Please provide an email", 400));
      }

      const user = await User.findOne({ email });
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const resetToken = jwt.sign(
        { id: user._id },
        process.env.JWT_RESET_PASSWORD_SECRET,
        { expiresIn: "10m" }
      );

      user.resetPasswordToken = resetToken;
      user.resetPasswordTime = Date.now() + 10 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      const domain = process.env.REACT_APP_FRONT_END_URL;
      const resetUrl = `${domain}/reset-password/${resetToken}`;
      const message = `Hello ${user.name}, please click on the link to reset your password: <a href="${resetUrl}" style="text-decoration: underline; color: blue; font-weight: bold;">RESET PASSWORD</a>`;

      try {
        await sendMail({
          email: user.email,
          subject: "Reset your password",
          html: message,
        });
        res.status(200).json({
          success: true,
          message: `Please check your email (${user.email}) to reset your password!`,
        });
      } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordTime = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler("Failed to send reset email", 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async resetPassword(reset_token, newPassword, res, next) {
    try {
      if (!reset_token) {
        return next(new ErrorHandler("Reset token is required", 400));
      }
      if (!newPassword) {
        return next(new ErrorHandler("New password is required", 400));
      }
      if (newPassword.length < 4) {
        return next(new ErrorHandler("Password must be at least 4 characters", 400));
      }

      const decoded = jwt.verify(reset_token, process.env.JWT_RESET_PASSWORD_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      if (
        user.resetPasswordToken !== reset_token ||
        user.resetPasswordTime < Date.now()
      ) {
        return next(new ErrorHandler("Invalid or expired reset token", 400));
      }

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordTime = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(new ErrorHandler("Reset token has expired", 400));
      }
      return next(new ErrorHandler("Invalid reset token", 400));
    }
  },

  async getUser(userId, res, next) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User doesn't exist", 400));
      }
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async logoutUser(refreshToken, req, res, next) {
    try {
      if (refreshToken) {
        try {
          const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
          const user = await User.findById(decoded.id);
          if (user && user.refreshToken === refreshToken) {
            user.refreshToken = null;
            await user.save({ validateBeforeSave: false });
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
  },

  async updateUserInfo({ email, password, phoneNumber, name }, user, res, next) {
    try {
      if (!email || !password || !name) {
        return next(new ErrorHandler("Missing required fields", 400));
      }

      const existingUser = await User.findOne({ email }).select("+password");
      if (!existingUser) {
        return next(new ErrorHandler("User not found", 400));
      }

      const isPasswordValid = await existingUser.comparePassword(password);
      if (!isPasswordValid) {
        return next(new ErrorHandler("Incorrect password", 400));
      }

      existingUser.name = name;
      existingUser.email = email;
      existingUser.phoneNumber = phoneNumber;
      await existingUser.save();

      res.status(201).json({
        success: true,
        user: existingUser,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async updateAvatar(req, res, next) {
    try {
      console.log("Update avatar request received for user:", req.user?.id);
      const user = await User.findById(req.user.id);
      if (!user) {
        console.log("User not found:", req.user.id);
        return next(new ErrorHandler("User not found", 404));
      }

      if (!req.file) {
        console.log("No image provided in request");
        return next(new ErrorHandler("No image provided", 400));
      }

      console.log("Cloudinary file details:", req.file);
      if (user.avatar && user.avatar !== "default-avatar.png") {
        try {
          const publicId = user.avatar.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`avatars/${publicId}`);
          console.log("Deleted old avatar from Cloudinary:", publicId);
        } catch (err) {
          console.error("Error deleting old avatar from Cloudinary:", err);
        }
      }

      const fileUrl = req.file.path;
      console.log("New avatar uploaded to Cloudinary:", fileUrl);

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: fileUrl },
        { new: true }
      );

      console.log("Avatar updated for user:", updatedUser.email);
      res.status(200).json({
        success: true,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update avatar error:", error);
      return next(new ErrorHandler(error.message || "Failed to update avatar", 500));
    }
  },

  async updateUserAddresses(addressData, user, res, next) {
    try {
      const currentUser = await User.findById(user.id);
      const sameTypeAddress = currentUser.addresses.find(
        (address) => address.addressType === addressData.addressType
      );
      if (sameTypeAddress) {
        return next(new ErrorHandler(`${addressData.addressType} address already exists`, 400));
      }

      const existsAddress = currentUser.addresses.find(
        (address) => address._id === addressData._id
      );

      if (existsAddress) {
        Object.assign(existsAddress, addressData);
      } else {
        currentUser.addresses.push(addressData);
      }

      await currentUser.save();
      res.status(200).json({
        success: true,
        user: currentUser,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async deleteUserAddress(userId, addressId, res, next) {
    try {
      const user = await User.findById(userId);
      await User.updateOne(
        { _id: userId },
        { $pull: { addresses: { _id: addressId } } }
      );
      const updatedUser = await User.findById(userId);
      res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async updateUserPassword(userId, oldPassword, newPassword, confirmPassword, res, next) {
    try {
      const user = await User.findById(userId).select("+password");
      const isPasswordMatched = await user.comparePassword(oldPassword);
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect!", 400));
      }

      if (newPassword !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
      }

      user.password = newPassword;
      await user.save();
      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async getUserInfo(userId, res, next) {
    try {
      const user = await User.findById(userId);
      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async getAllUsers(res, next) {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      res.status(201).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async deleteUser(userId, res, next) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }
      await User.findByIdAndDelete(userId);
      res.status(201).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
};

module.exports = userService;