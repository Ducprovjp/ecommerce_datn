const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ecommerce_products", // Thư mục trên Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"],
    public_id: (req, file) => file.originalname.split(".")[0],
  },
});

exports.upload = multer({ storage: storage });
