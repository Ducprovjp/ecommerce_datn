const mongoose = require("mongoose");
const crypto = require("crypto");
const Order = require("../model/order.model");
const Product = require("../model/product.model");
const ErrorHandler = require("../utils/ErrorHandler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const paymentService = {
  async processStripePayment(amount, res, next) {
    try {
      const myPayment = await stripe.paymentIntents.create({
        amount,
        currency: "inr",
        metadata: {
          company: "Omprakash",
        },
      });
      res.status(200).json({
        success: true,
        client_secret: myPayment.client_secret,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async getStripeApiKey(res, next) {
    try {
      res.status(200).json({
        stripeApikey: process.env.STRIPE_API_KEY,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async processVNPayPayment({ totalPrice, cart, shippingAddress, user }, res, next) {
    try {
      if (!totalPrice || !cart || !shippingAddress || !user) {
        return next(new ErrorHandler("Missing required fields", 400));
      }
  
      if (!Array.isArray(cart) || cart.length === 0) {
        return next(new ErrorHandler("Cart is empty", 400));
      }
  
      function sortObject(obj) {
        let sorted = {};
        let keys = Object.keys(obj).sort();
        for (let key of keys) {
          sorted[key] = obj[key];
        }
        return sorted;
      }
  
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        const productUpdates = [];
        for (const item of cart) {
          if (
            !item._id ||
            !item.shopId ||
            typeof item.qty !== "number" ||
            item.qty <= 0 ||
            typeof item.discountPrice !== "number" ||
            item.discountPrice <= 0
          ) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler(`Invalid cart item: ${JSON.stringify(item)}`, 400));
          }
  
          const product = await Product.findById(item._id).session(session);
          if (!product) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler(`Product not found: ${item._id}`, 400));
          }
  
          // Kiểm tra số lượng còn lại
          const availableStock = product.stock - Math.max(0, product.reservedStock); // Đảm bảo reservedStock không âm
          console.log(`Product: ${product.name}, Stock: ${product.stock}, Reserved: ${product.reservedStock}, Available: ${availableStock}, Requested: ${item.qty}`);
          if (availableStock < item.qty) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler(`Sản phẩm tạm thời hết hàng: ${product.name}`, 400));
          }
          productUpdates.push({
            productId: item._id,
            qty: item.qty,
          });
        }
  
        // Tăng reservedStock
        for (const update of productUpdates) {
          await Product.findByIdAndUpdate(
            update.productId,
            { $inc: { reservedStock: update.qty } },
            { session, validateBeforeSave: false }
          );
        }
  
        let vnp_TmnCode = process.env.VNP_TMNCODE;
        let vnp_HashSecret = process.env.VNP_HASHSECRET;
        let vnp_Url = process.env.VNP_URL;
        let vnp_ReturnUrl = `${process.env.REACT_APP_SERVER}/order/vnpay-success`;
  
        let date = new Date();
        let createDate = date.toISOString().replace(/[-:T.]/g, "").slice(0, 14);
        let orderId = date.getTime();
  
        let vnp_Params = {
          vnp_Version: "2.1.0",
          vnp_Command: "pay",
          vnp_TmnCode: vnp_TmnCode,
          vnp_Amount: totalPrice * 100,
          vnp_CurrCode: "VND",
          vnp_TxnRef: orderId,
          vnp_OrderInfo: "Thanh toan don hang " + orderId,
          vnp_OrderType: "250000",
          vnp_Locale: "vn",
          vnp_ReturnUrl: vnp_ReturnUrl,
          vnp_IpAddr: "127.0.0.1",
          vnp_CreateDate: createDate,
        };
  
        vnp_Params = sortObject(vnp_Params);
        let querystring = new URLSearchParams(vnp_Params).toString();
        let hmac = crypto.createHmac("sha512", vnp_HashSecret);
        let vnp_SecureHash = hmac.update(querystring).digest("hex");
        vnp_Params["vnp_SecureHash"] = vnp_SecureHash;
  
        let paymentUrl = vnp_Url + "?" + new URLSearchParams(vnp_Params).toString();
  
        const newOrder = new Order({
          cart,
          shippingAddress,
          user,
          totalPrice,
          status: "Processing",
          paymentInfo: {
            orderId: orderId,
            type: "VNPAY",
          },
          paidAt: null,
          reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // Hết hạn sau 15 phút
        });
  
        await newOrder.save({ session });
        console.log("Temporary order saved:", newOrder);
  
        await session.commitTransaction();
        session.endSession();
  
        res.json({ success: true, paymentUrl, orderId });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error saving temporary order:", error);
        return next(new ErrorHandler("Sản phẩm tạm thời hết hàng hoặc đã được giữ chỗ", 400));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
};

module.exports = paymentService;