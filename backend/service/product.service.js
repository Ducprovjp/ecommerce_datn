const Product = require("../model/product.model");
const Shop = require("../model/shop.model");
const Order = require("../model/order.model");
const ErrorHandler = require("../utils/ErrorHandler");
const fs = require("fs");

const productService = {
  async uploadImage(files, res, next) {
    try {
      const imageUrls = files.map((file) => file.path);
      res.status(200).json({
        success: true,
        imageUrls,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  },

  async createProduct(productData, files, res, next) {
    try {
      const shopId = productData.shopId;
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      }

      // Xử lý hình ảnh
      let imageUrls = [];
      
      // Nếu có files được upload qua multer (trường hợp update với file mới)
      if (files && files.length > 0) {
        imageUrls = files.map((file) => file.path);
      }
      
      // Nếu có imageUrls được gửi từ FormData (trường hợp create với URLs đã upload trước)
      if (productData.imageUrls) {
        // imageUrls có thể là string hoặc array
        if (typeof productData.imageUrls === 'string') {
          try {
            imageUrls = JSON.parse(productData.imageUrls);
          } catch (e) {
            imageUrls = [productData.imageUrls];
          }
        } else if (Array.isArray(productData.imageUrls)) {
          imageUrls = productData.imageUrls;
        }
      }
      
      // Kiểm tra có hình ảnh không
      if (!imageUrls || imageUrls.length === 0) {
        return next(new ErrorHandler("No images uploaded!", 400));
      }

      productData.images = imageUrls;
      productData.shop = shop;

      const product = await Product.create(productData);
      res.status(201).json({
        success: true,
        product,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  },

  async updateProduct(productId, updatedData, files, res, next) {
    try {
      if (files && files.length > 0) {
        const imageUrls = files.map((file) => file.path);
        const oldImages = updatedData.oldImages ? JSON.parse(updatedData.oldImages) : [];
        updatedData.images = [...oldImages, ...imageUrls];
      } else {
        updatedData.images = updatedData.oldImages ? JSON.parse(updatedData.oldImages) : [];
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $set: updatedData },
        { new: true }
      );

      if (!updatedProduct) {
        return next(new ErrorHandler("Product not found", 404));
      }

      res.status(200).json({
        success: true,
        product: updatedProduct,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async getAllProductsShop(shopId, res, next) {
    try {
      const products = await Product.find({ shopId });
      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  },

  async deleteShopProduct(productId, res, next) {
    try {
      const productData = await Product.findById(productId);
      productData.images.forEach((imageUrl) => {
        const filename = imageUrl;
        const filePath = `uploads/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
          }
        });
      });

      const product = await Product.findByIdAndDelete(productId);
      if (!product) {
        return next(new ErrorHandler("Product not found with this id!", 500));
      }

      res.status(201).json({
        success: true,
        message: "Product Deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  },

  async getAllProducts({ minPrice, maxPrice, category, sort, page, limit }, res, next) {
    try {
      console.log("Query params:", { minPrice, maxPrice, category, sort, page, limit }); // Log để debug
  
      const query = {};
      if (category) {
        query.category = { $regex: category, $options: "i" };
      }
      if (minPrice && !isNaN(minPrice)) {
        query.discountPrice = { ...query.discountPrice, $gte: parseFloat(minPrice) };
      }
      if (maxPrice && !isNaN(maxPrice)) {
        query.discountPrice = { ...query.discountPrice, $lte: parseFloat(maxPrice) };
      }
  
      let sortOption = {};
      switch (sort) {
        case "price-asc":
          sortOption = { discountPrice: 1, _id: 1 }; // Thêm _id để đảm bảo thứ tự duy nhất
          break;
        case "price-desc":
          sortOption = { discountPrice: -1, _id: 1 };
          break;
        case "name-asc":
          sortOption = { name: 1, _id: 1 };
          break;
        case "name-desc":
          sortOption = { name: -1, _id: 1 };
          break;
        default:
          sortOption = { createdAt: -1, _id: 1 }; // Mặc định sort theo createdAt và _id
      }
  
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;
  
      const products = await Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum);
  
      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limitNum);
  
      // Debug: Log danh sách _id của sản phẩm trả về
      console.log("Products IDs:", products.map(p => p._id));
  
      res.status(200).json({
        success: true,
        products,
        totalPages,
        currentPage: pageNum,
        totalProducts,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async createNewReview({ user, rating, comment, productId, orderId }, reqUser, res, next) {
    try {
      const product = await Product.findById(productId);
      const review = { user, rating, comment, productId };
      const isReviewed = product.reviews.find((rev) => rev.user._id === reqUser._id);

      if (isReviewed) {
        product.reviews.forEach((rev) => {
          if (rev.user._id === reqUser._id) {
            rev.rating = rating;
            rev.comment = comment;
            rev.user = user;
          }
        });
      } else {
        product.reviews.push(review);
      }

      let avg = 0;
      product.reviews.forEach((rev) => {
        avg += rev.rating;
      });
      product.ratings = avg / product.reviews.length;

      await product.save({ validateBeforeSave: false });
      await Order.findByIdAndUpdate(
        orderId,
        { $set: { "cart.$[elem].isReviewed": true } },
        { arrayFilters: [{ "elem._id": productId }], new: true }
      );

      res.status(200).json({
        success: true,
        message: "Review added successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  },

  async getAllProductsForAdmin(res, next) {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
};

module.exports = productService;