const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");
const path = require("path");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ecommerce_products",
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
    transformation: [{ quality: "auto", fetch_format: "auto" }], // Tối ưu hóa ảnh
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return `${file.originalname.split(".")[0]}-${uniqueSuffix}`;
    },
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    console.log("File validation:", {
      mimetype,
      extname,
      file: file.originalname,
    });

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only .jpg, .jpeg, .png, .gif files are allowed"));
  },
});

module.exports = { upload };