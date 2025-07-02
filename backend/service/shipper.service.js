const Shipper = require("../model/shipper.model");
const cloudinary = require("../cloudinary");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendShipperToken = require("../utils/shipperToken");
const ErrorHandler = require("../utils/ErrorHandler");
const { OAuth2Client } = require("google-auth-library");

const shipperService = {
  async createShipper(req, res, next) {
    const { email, name, password, phoneNumber, address } = req.body;
    console.log("Received shipper creation request:", {
      email,
      name,
      password: password ? "[REDACTED]" : undefined,
      hasFile: !!req.file,
      phoneNumber,
      address
    });

    if (!email) return next(new ErrorHandler("Email là bắt buộc", 400));
    if (!password) return next(new ErrorHandler("Mật khẩu là bắt buộc", 400));
    if (password.length < 6) {
      return next(new ErrorHandler("Mật khẩu phải có ít nhất 6 ký tự", 400));
    }
    if (!name || name.trim() === "") return next(new ErrorHandler("Tên shipper là bắt buộc", 400));

    const existingShipper = await Shipper.findOne({ email });
    if (existingShipper) {
      if (req.file) {
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (err) {
          console.error("Lỗi xóa ảnh trên Cloudinary:", err);
        }
      }
      return next(new ErrorHandler("Shipper đã tồn tại", 400));
    }

    let //

 fileUrl = "default-avatar.png";
    if (req.file) {
      fileUrl = req.file.path;
      console.log("Uploaded file URL:", fileUrl);
    }

    const shipper = {
      email,
      password,
      name: name.trim(),
      phoneNumber: phoneNumber || "",
      address: address || "",
      avatar: fileUrl
    };

    const createActivationToken = (shipper) => {
      if (!process.env.ACTIVATION_SECRET) {
        throw new Error("ACTIVATION_SECRET chưa được cấu hình");
      }
      return jwt.sign(shipper, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });
    };

    const activationToken = createActivationToken(shipper);
    const domain = process.env.REACT_APP_FRONT_END_URL;
    const activationUrl = `${domain}/shipper/activation/${activationToken}`;
    const message = `Xin chào ${shipper.name}, vui lòng nhấp vào liên kết để kích hoạt tài khoản shipper của bạn: <a href="${activationUrl}" style="text-decoration: underline; color: blue; font-weight: bold;">KÍCH HOẠT</a>`;

    console.log("Gửi email kích hoạt đến:", shipper.email);
    try {
      await sendMail({
        email: shipper.email,
        subject: "Kích hoạt tài khoản Shipper của bạn",
        html: message,
      });
      res.status(201).json({
        success: true,
        message: `Vui lòng kiểm tra email (${shipper.email}) để kích hoạt tài khoản của bạn!`,
      });
    } catch (err) {
      if (req.file) {
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (err2) {
          console.error("Lỗi xóa ảnh trên Cloudinary:", err2);
        }
      }
      console.error("Lỗi gửi email:", err);
      return next(new ErrorHandler("Không thể gửi email kích hoạt", 500));
    }
  },

  async activateShipper(activation_token, res, next) {
    console.log("Received shipper activation request:", { activation_token });
    if (!activation_token) {
      return next(new ErrorHandler("Token kích hoạt là bắt buộc", 400));
    }

    try {
      if (!process.env.ACTIVATION_SECRET) {
        throw new Error("ACTIVATION_SECRET chưa được cấu hình");
      }

      const newShipper = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
      console.log("Decoded token:", newShipper);

      const { name, email, password, avatar, phoneNumber, address } = newShipper;
      if (!name || name.trim() === "") {
        return next(new ErrorHandler("Tên shipper là bắt buộc trong token", 400));
      }

      const existingShipper = await Shipper.findOne({ email });
      if (existingShipper) {
        return next(new ErrorHandler("Shipper đã tồn tại", 400));
      }

      console.log("Tạo shipper:", email);
      const shipper = await Shipper.create({
        name: name.trim(),
        email,
        password: password || undefined,
        phoneNumber: phoneNumber || "",
        address: address || "",
        avatar: avatar || "default-avatar.png"
      });

      console.log("Shipper đã được tạo:", shipper.email);
      sendShipperToken(shipper, 201, res);
    } catch (err) {
      console.error("Lỗi kích hoạt:", err);
      if (err.name === "TokenExpiredError") {
        return next(new ErrorHandler("Token kích hoạt đã hết hạn", 400));
      }
      return next(new ErrorHandler("Kích hoạt thất bại: " + err.message, 400));
    }
  },

  async googleLogin(id_token, res, next) {
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      if (!id_token) {
        console.error("Không cung cấp ID token");
        return next(new ErrorHandler("ID token là bắt buộc", 400));
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

      let shipper = await Shipper.findOne({ googleId });
      if (!shipper) {
        shipper = await Shipper.findOne({ email });
        if (shipper) {
          shipper.googleId = googleId;
          if (picture) shipper.avatar = picture;
          await shipper.save();
        } else {
          console.log("Tạo shipper mới:", email);
          shipper = await Shipper.create({
            googleId,
            email,
            name,
            avatar: picture || "default-avatar.png",
            phoneNumber: "",
            address: "",
            role: "Shipper"
          });
        }
      }
      sendShipperToken(shipper, 201, res);
    } catch (error) {
      console.error("Lỗi xác thực Google:", error);
      return next(new ErrorHandler("Xác thực Google thất bại: " + error.message, 400));
    }
  },

  async loginShipper(email, password, res, next) {
    try {
      if (!email || !password) {
        return next(new ErrorHandler("Vui lòng cung cấp đầy đủ các trường", 400));
      }

      const user = await Shipper.findOne({ email }).select("+password");
        if (!user) {
        return next(new ErrorHandler("Shipper không tồn tại", 400));
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(new ErrorHandler("Mật khẩu không đúng", 400));
      }

      sendShipperToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async refreshToken(refreshToken, res, next) {
    if (!refreshToken) {
      return next(new ErrorHandler("Không tìm thấy refresh token", 401));
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET || process.env.JWT_SECRET_KEY);
      const shipper = await Shipper.findById(decoded.id);

      if (!shipper || shipper.refreshToken !== refreshToken) {
        return next(new ErrorHandler("Refresh token không hợp lệ", 401));
      }

      sendShipperToken(shipper, 200, res);
    } catch (error) {
      return next(new ErrorHandler("Refresh token không hợp lệ hoặc đã hết hạn", 401));
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
          // Nếu refresh token không hợp lệ, không cần làm gì
        }
      }

      res.status(200).json({
        success: true,
        message: "Đăng xuất thành công",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async getShipper(shipperId, res, next) {
    try {
      const shipper = await Shipper.findById(shipperId);
      if (!shipper) {
        return next(new ErrorHandler("Shipper không tồn tại", 400));
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
      console.log("Cập nhật avatar request nhận được cho shipper:", req.shipper?._id);
      const shipper = await Shipper.findById(req.shipper._id);
      if (!shipper) {
        console.log("Không tìm thấy shipper:", req.shipper._id);
        return next(new ErrorHandler("Shipper không tồn tại", 404));
      }

      if (!req.file) {
        console.log("Không có ảnh được cung cấp trong request");
        return next(new ErrorHandler("Không có ảnh được cung cấp", 400));
      }

      console.log("Chi tiết file Cloudinary:", req.file);
      if (shipper.avatar && shipper.avatar !== "default-avatar.png") {
        try {
          const publicId = shipper.avatar.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`avatars/${publicId}`);
          console.log("Xóa avatar cũ từ Cloudinary:", publicId);
        } catch (err) {
          console.error("Lỗi xóa avatar cũ từ Cloudinary:", err);
        }
      }

      const fileUrl = req.file.path;
      console.log("Avatar mới được tải lên Cloudinary:", fileUrl);

      const updatedShipper = await Shipper.findByIdAndUpdate(
        req.shipper._id,
        { avatar: fileUrl },
        { new: true }
      );

      console.log("Avatar đã được cập nhật cho shipper:", updatedShipper.email);
      res.status(200).json({
        success: true,
        shipper: updatedShipper,
      });
    } catch (error) {
      console.error("Lỗi cập nhật avatar:", error);
      return next(new ErrorHandler(error.message || "Cập nhật avatar thất bại", 500));
    }
  },

  async updateShipperInfo({ name, phoneNumber, address }, shipper, res, next) {
    try {
      const existingShipper = await Shipper.findById(shipper._id);
      if (!existingShipper) {
        return next(new ErrorHandler("Shipper không tồn tại", 400));
      }

      existingShipper.name = name || existingShipper.name;
      existingShipper.phoneNumber = phoneNumber || existingShipper.phoneNumber;
      existingShipper.address = address || existingShipper.address;

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

  async deleteShipmentDeliveredArea(shipperId, deliveredAreaId, res, next) {
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
        return next(new ErrorHandler("Shipper không tồn tại", 400));
      }
      await Shipper.findByIdAndDelete(shipperId);
      res.status(201).json({ success: true, message: "Shipper đã được xóa thành công" });
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