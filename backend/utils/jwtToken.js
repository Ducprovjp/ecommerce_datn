const sendToken = async (user, statusCode, res) => {
  const accessToken = user.getJwtToken();
  const refreshToken = user.getRefreshToken();

  // Lưu refresh token vào database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Options cho access token cookie
  const accessTokenOptions = {
    expires: new Date(Date.now() + 30 * 60 * 1000), // 15 phút
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };

  // Options cho refresh token cookie
  const refreshTokenOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };

  res
    .status(statusCode)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json({
      success: true,
      user,
      accessToken,
    });
};

module.exports = sendToken;