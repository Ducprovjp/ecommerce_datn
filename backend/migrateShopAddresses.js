const mongoose = require("mongoose");
const Shop = require("./model/shop.model");

async function migrateShopAddresses() {
  try {
    // Kết nối tới MongoDB
    await mongoose.connect("mongodb+srv://ducprovjp2612:ducprovjp2612@typescript-mern-ecommer.n4k9g.mongodb.net/", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Đã kết nối tới MongoDB");

    // Lấy tất cả shop
    const shops = await Shop.find({});

    for (const shop of shops) {
      // Kiểm tra nếu shop có trường address hoặc addresses không hợp lệ
      if (shop.address) {
        // Phân tích chuỗi địa chỉ
        const addressParts = shop.address.split(", ");
        if (addressParts.length >= 4) {
          const newAddress = {
            address1: addressParts[0].trim(), // Đảm bảo không có khoảng trắng thừa
            ward: addressParts[1].replace("Phường ", "").trim(),
            district: addressParts[2].replace("Quận ", "").trim(),
            province: addressParts[3].replace("Thành phố ", "").trim(),
            addressType: "Default",
          };

          // Cập nhật mảng addresses
          shop.addresses = [newAddress];
          shop.address = undefined; // Xóa trường address
          shop.isProfileComplete = true;

          await shop.save();
          console.log(`Đã di chuyển địa chỉ cho shop: ${shop.email}`);
        } else {
          console.log(`Định dạng địa chỉ không hợp lệ cho shop: ${shop.email}`);
        }
      } else if (shop.addresses && shop.addresses.length > 0) {
        // Kiểm tra và sửa lỗi trong addresses nếu cần
        const currentAddress = shop.addresses[0];
        if (currentAddress.address1 === "162 Đê La Thành nhỏ") {
          currentAddress.address1 = "160 Đê La Thành nhỏ"; // Sửa lỗi sai lệch
          shop.addresses[0] = currentAddress;
          shop.address = undefined;
          await shop.save();
          console.log(`Đã sửa địa chỉ cho shop: ${shop.email}`);
        }
      }
    }

    console.log("Hoàn tất di chuyển dữ liệu");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi di chuyển dữ liệu:", error);
    process.exit(1);
  }
}

migrateShopAddresses();