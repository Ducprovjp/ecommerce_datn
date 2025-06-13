const express = require("express");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const userService = require("../service/user.service");

const router = express.Router();

// Create user account
router.post(
  "/create-user",
  upload.single("file"),
  catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;
    await userService.createUser(req, res, next);
  })
);

// Activate user account
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    const { activation_token } = req.body;
    await userService.activateUser(activation_token, res, next);
  })
);

// Login user
router.post(
  "/login-user",
  catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    await userService.loginUser(email, password, res, next);
  })
);

// Login with Google
router.post(
  "/auth/google",
  catchAsyncErrors(async (req, res, next) => {
    const { id_token } = req.body;
    await userService.googleLogin(id_token, res, next);
  })
);

// Refresh token for user
router.post(
  "/refresh-token",
  catchAsyncErrors(async (req, res, next) => {
    const { refreshToken } = req.body;
    await userService.refreshToken(refreshToken, res, next);
  })
);

// Forgot password
router.post(
  "/forgot-password",
  catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;
    await userService.forgotPassword(email, res, next);
  })
);

// Reset password
router.post(
  "/reset-password",
  catchAsyncErrors(async (req, res, next) => {
    const { reset_token, newPassword } = req.body;
    await userService.resetPassword(reset_token, newPassword, res, next);
  })
);

// Load user
router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    await userService.getUser(req.user.id, res, next);
  })
);

// Logout user
router.post(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    const { refreshToken } = req.body;
    await userService.logoutUser(refreshToken, req, res, next);
  })
);

// Update user info
router.put(
  "/update-user-info",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { email, password, phoneNumber, name } = req.body;
    await userService.updateUserInfo({ email, password, phoneNumber, name }, req.user, res, next);
  })
);

// Update user avatar
router.put(
  "/update-avatar",
  isAuthenticated,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    await userService.updateAvatar(req, res, next);
  })
);

// Update user addresses
router.put(
  "/update-user-addresses",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    await userService.updateUserAddresses(req.body, req.user, res, next);
  })
);

// Delete user address
router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const addressId = req.params.id;
    await userService.deleteUserAddress(req.user._id, addressId, res, next);
  })
);

// Update user password
router.put(
  "/update-user-password",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    await userService.updateUserPassword(req.user.id, oldPassword, newPassword, confirmPassword, res, next);
  })
);

// Find user information with the userId
router.get(
  "/user-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.id;
    await userService.getUserInfo(userId, res, next);
  })
);

// All users --- for admin
router.get(
  "/admin-all-users",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    await userService.getAllUsers(res, next);
  })
);

// Delete users --- admin
router.delete(
  "/delete-user/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.id;
    await userService.deleteUser(userId, res, next);
  })
);

module.exports = router;