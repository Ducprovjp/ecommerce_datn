const sendShopToken = async (user, statusCode, res) => {
  const accessToken = user.getJwtToken();
  const refreshToken = user.getRefreshToken();

  // Lưu refresh token vào database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Trả token trong response body
  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
    refreshToken,
  });
};

module.exports = sendShopToken;