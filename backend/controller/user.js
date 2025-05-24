const express = require("express");
const path = require("path");
const User = require("../model/user");
const cloudinary = require("../cloudinary");
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();

// Create user account
router.post(
  "/create-user",
  upload.single("file"),
  catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;
    console.log("Received signup request:", {
      name,
      email,
      hasFile: !!req.file,
    });

    // Validate required fields
    if (!name) return next(new ErrorHandler("Name is required", 400));
    if (!email) return next(new ErrorHandler("Email is required", 400));
    if (!password) return next(new ErrorHandler("Password is required", 400));
    if (password.length < 4) {
      return next(new ErrorHandler("Password must be at least 4 characters", 400));
    }

    // Check if email already exists
    const userEmail = await User.findOne({ email });
    if (userEmail) {
      if (req.file) {
        // Xóa ảnh trên Cloudinary nếu email đã tồn tại
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (err) {
          console.error("Lỗi xóa ảnh trên Cloudinary:", err);
        }
      }
      return next(new ErrorHandler("User already exists", 400));
    }

    // Handle avatar
    let fileUrl = "default-avatar.png";
    if (req.file) {
      // Lấy URL công khai từ Cloudinary
      fileUrl = req.file.path; // URL đầy đủ từ Cloudinary
      console.log("Uploaded file URL:", fileUrl);
    }

    const user = {
      name,
      email,
      password,
      avatar: fileUrl,
    };

    // Create activation token
    const createActivationToken = (user) => {
      if (!process.env.ACTIVATION_SECRET) {
        throw new Error("ACTIVATION_SECRET chưa được cấu hình");
      }
      return jwt.sign(user, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
      });
    };

    const activationToken = createActivationToken(user);

    // Use dynamic domain for activation URL
    const domain = process.env.REACT_APP_FRONT_END_URL;
    const activationUrl = `${domain}/activation/${activationToken}`;

    const message = `Hello ${user.name}, please click on the link to activate your account: <a href="${activationUrl}" style="text-decoration: underline; color: blue; font-weight: bold;">ACTIVATE</a>`;

    // Send email to user
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
      // Clean up uploaded file on Cloudinary if email fails
      if (req.file) {
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (err) {
          console.error("Lỗi xóa ảnh trên Cloudinary:", err);
        }
      }
      return next(new ErrorHandler("Failed to send activation email", 500));
    }
  })
);

// Kích hoạt tài khoản người dùng (giữ nguyên từ file gốc)
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    const { activation_token } = req.body;
    console.log("Received activation request:", { activation_token });

    if (!activation_token) {
      return next(new ErrorHandler("Activation token is required", 400));
    }

    try {
      if (!process.env.ACTIVATION_SECRET) {
        throw new Error("ACTIVATION_SECRET chưa được cấu hình");
      }

      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );
      console.log("Decoded token:", newUser);

      const { name, email, password, avatar } = newUser;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(new ErrorHandler("User already exists", 400));
      }

      // Create user
      console.log("Tạo người dùng:", email);
      const user = await User.create({
        name,
        email,
        password: password || undefined, // Handle undefined password
        avatar: avatar || "default-avatar.png", // Default avatar
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
  })
);

// Login user
router.post(
  "/login-user",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide all fields", 400));
      }
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User doesn't exist", 400));
      }

      // Compare password with database password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(new ErrorHandler("Incorrect password", 400));
      }
      sendToken(user, 201, res);
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

      // Check if user exists, or create a new one
      let user = await User.findOne({ googleId });

      if (!user) {
        user = await User.findOne({ email });
        if (user) {
          // Link Google ID to existing user
          user.googleId = googleId;
          if (picture) user.avatar = picture; // Update avatar if available
          await user.save();
        } else {
          // Create new user
          console.log("Creating new user:", email);
          user = await User.create({
            googleId,
            email,
            name,
            avatar: picture || "default-avatar.png", // Default avatar if none provided
          });
        }
      }

      sendToken(user, 201, res);
    } catch (error) {
      console.error("Google authentication error:", error);
      return next(new ErrorHandler("Google authentication failed: " + error.message, 400));
    }
  })
);

// Refresh token
router.post(
  "/refresh-token",
  catchAsyncErrors(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new ErrorHandler("Refresh token not found", 401));
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET || process.env.JWT_SECRET_KEY);
      const user = await User.findById(decoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        return next(new ErrorHandler("Invalid refresh token", 401));
      }

      // Tạo access token mới
      sendToken(user, 200, res);
    } catch (error) {
      return next(new ErrorHandler("Invalid or expired refresh token", 401));
    }
  })
);

// Forgot password
router.post(
  "/forgot-password",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return next(new ErrorHandler("Please provide an email", 400));
      }

      const user = await User.findOne({ email });
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Create reset password token
      const resetToken = jwt.sign(
        { id: user._id },
        process.env.JWT_RESET_PASSWORD_SECRET,
        { expiresIn: "10m" }
      );

      // Save token and expiry to user
      user.resetPasswordToken = resetToken;
      user.resetPasswordTime = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save({ validateBeforeSave: false });

      // Send reset password email
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
        // Clear token if email fails
        user.resetPasswordToken = undefined;
        user.resetPasswordTime = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler("Failed to send reset email", 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Reset password
router.post(
  "/reset-password",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { reset_token, newPassword } = req.body;

      if (!reset_token) {
        return next(new ErrorHandler("Reset token is required", 400));
      }
      if (!newPassword) {
        return next(new ErrorHandler("New password is required", 400));
      }
      if (newPassword.length < 4) {
        return next(new ErrorHandler("Password must be at least 4 characters", 400));
      }

      // Verify reset token
      const decoded = jwt.verify(reset_token, process.env.JWT_RESET_PASSWORD_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Check token validity and expiry
      if (
        user.resetPasswordToken !== reset_token ||
        user.resetPasswordTime < Date.now()
      ) {
        return next(new ErrorHandler("Invalid or expired reset token", 400));
      }

      // Update password
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
  })
);

// Load user
router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

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
  })
);

// Logout user
router.post(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        try {
          const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET || process.env.JWT_SECRET_KEY);
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
  })
);

// Update user info
router.put(
  "/update-user-info",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password, phoneNumber, name } = req.body;

      if (!email || !password || !name) {
        return next(new ErrorHandler("Missing required fields", 400));
      }

      /* The line `const user = await User.findOne({ email }).select("+password");` is querying the database
      to find a user with the specified email address. The `select("+password")` part is used to include
      the password field in the returned user object. By default, the password field is not selected when
      querying the database for security reasons. However, in this case, the password field is needed to
      compare the provided password with the stored password for authentication purposes. */
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(new ErrorHandler("Incorrect password", 400));
      }

      user.name = name;
      user.email = email;
      user.phoneNumber = phoneNumber;

      await user.save();

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update user avatar
router.put(
  "/update-avatar",
  isAuthenticated,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
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
  })
);

// Update user addresses
router.put(
  "/update-user-addresses",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      const sameTypeAddress = user.addresses.find(
        (address) => address.addressType === req.body.addressType
      );
      if (sameTypeAddress) {
        return next(new ErrorHandler(`${req.body.addressType} address already exists`, 400));
      }

      const existsAddress = user.addresses.find(
        (address) => address._id === req.body._id
      );

      if (existsAddress) {
        Object.assign(existsAddress, req.body);
      } else {
        // Add the new address to the array
        user.addresses.push(req.body);
      }

      await user.save();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete user address
router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;

      //   console.log(addressId);

      await User.updateOne(
        { _id: userId },
        { $pull: { addresses: { _id: addressId } } }
      );

      const user = await User.findById(userId);

      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update user password
router.put(
  "/update-user-password",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("+password");

      const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

      if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect!", 400));
      }

      /* The line `if (req.body.newPassword !== req.body.confirmPassword)` is checking if the value of
      `newPassword` in the request body is not equal to the value of `confirmPassword` in the request
      body. This is used to ensure that the new password entered by the user matches the confirmation
      password entered by the user. If the two values do not match, it means that the user has entered
      different passwords and an error is returned. */
      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
      }
      user.password = req.body.newPassword;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Find user information with the userId
router.get(
  "/user-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// All users --- for admin
router.get(
  "/admin-all-users",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      res.status(201).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete users --- admin
router.delete(
  "/delete-user/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }

      await User.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;