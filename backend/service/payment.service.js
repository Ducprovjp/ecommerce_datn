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

  async processVNPayPayment(
    { totalPrice, cart, shippingAddress, user, couponCodePerShop },
    res,
    next
  ) {
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
        // Nhóm sản phẩm theo shopId
        const cartByShop = {};
        for (const item of cart) {
          if (!cartByShop[item.shopId]) cartByShop[item.shopId] = [];
          cartByShop[item.shopId].push(item);
        }

        // Tạo Map để theo dõi tổng số lượng của mỗi sản phẩm trong toàn bộ giỏ hàng
        const productQuantityMap = new Map();

        // Tính tổng số lượng cho mỗi sản phẩm
        for (const item of cart) {
          const currentQty = productQuantityMap.get(item._id) || 0;
          productQuantityMap.set(item._id, currentQty + item.qty);
        }

        const orderIds = [];
        const orders = [];

        // Tạo mainOrderId duy nhất
        let date = new Date();
        let mainOrderId = date.getTime();

        // Kiểm tra stock và tạo đơn hàng tạm thời cho từng shop
        for (const [shopId, items] of Object.entries(cartByShop)) {
          const shopTotal = items.reduce(
            (sum, item) => sum + item.discountPrice * item.qty,
            0
          );

          for (const item of items) {
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
              return next(
                new ErrorHandler(
                  `Invalid cart item: ${JSON.stringify(item)}`,
                  400
                )
              );
            }

            const product = await Product.findById(item._id).session(session);
            if (!product) {
              await session.abortTransaction();
              session.endSession();
              return next(
                new ErrorHandler(`Product not found: ${item._id}`, 400)
              );
            }

            const availableStock =
              product.stock - Math.max(0, product.reservedStock);
            const totalRequestedQty = productQuantityMap.get(item._id);

            console.log(
              `Product: ${product.name}, Stock: ${product.stock}, Reserved: ${product.reservedStock}, Available: ${availableStock}, Total Requested: ${totalRequestedQty}`
            );

            if (availableStock < totalRequestedQty) {
              await session.abortTransaction();
              session.endSession();
              return next(
                new ErrorHandler(`Product out of stock: ${product.name}`, 400)
              );
            }
          }

          // Tạo đơn hàng tạm thời cho shop với orderId dựa trên mainOrderId
          let orderId = `${mainOrderId}_${shopId}`;
          const newOrder = new Order({
            cart: items,
            shippingAddress,
            user,
            totalPrice: shopTotal,
            status: "Processing",
            paymentInfo: {
              orderId: orderId,
              type: "VNPAY",
              mainOrderId: mainOrderId, // Lưu mainOrderId để liên kết
            },
            paidAt: null,
            reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
            couponCode:
              couponCodePerShop?.[shopId]?.product ||
              couponCodePerShop?.[shopId]?.shipping ||
              null,
          });

          await newOrder.save({ session });
          orders.push(newOrder);
          orderIds.push(orderId);
        }

        // Tăng reservedStock cho mỗi sản phẩm theo tổng số lượng thực tế
        // Thực hiện sau khi tất cả validation và tạo order đã hoàn thành
        for (const [productId, totalQty] of productQuantityMap) {
          await Product.findByIdAndUpdate(
            productId,
            { $inc: { reservedStock: totalQty } },
            { session, validateBeforeSave: false }
          );
        }

        // Tạo URL thanh toán VNPay
        let vnp_TmnCode = process.env.VNP_TMNCODE;
        let vnp_HashSecret = process.env.VNP_HASHSECRET;
        let vnp_Url = process.env.VNP_URL;
        let vnp_ReturnUrl = `${process.env.REACT_APP_SERVER}/order/vnpay-success`;

        let createDate = date
          .toISOString()
          .replace(/[-:T.]/g, "")
          .slice(0, 14);

        let vnp_Params = {
          vnp_Version: "2.1.0",
          vnp_Command: "pay",
          vnp_TmnCode: vnp_TmnCode,
          vnp_Amount: Math.round(totalPrice * 100),
          vnp_CurrCode: "VND",
          vnp_TxnRef: mainOrderId, // Sử dụng mainOrderId
          vnp_OrderInfo: `Thanh toan don hang ${mainOrderId}`,
          vnp_OrderType: "250000",
          vnp_Locale: "vn",
          vnp_ReturnUrl: vnp_ReturnUrl,
          vnp_IpAddr: "127.0.0.1",
          vnp_CreateDate: createDate,
          // Thêm orderIds vào OrderInfo để truy vấn sau
          vnp_OrderInfo: `Thanh toan don hang ${mainOrderId}|${orderIds.join(
            ","
          )}`,
        };

        vnp_Params = sortObject(vnp_Params);
        let querystring = new URLSearchParams();
        for (const [key, value] of Object.entries(vnp_Params)) {
          if (value !== null && value !== undefined && value !== "") {
            querystring.append(key, String(value));
          }
        }
        querystring = querystring.toString();
        let hmac = crypto.createHmac("sha512", vnp_HashSecret);
        let vnp_SecureHash = hmac.update(querystring).digest("hex");
        vnp_Params["vnp_SecureHash"] = vnp_SecureHash;

        let paymentUrl =
          vnp_Url + "?" + new URLSearchParams(vnp_Params).toString();

        await session.commitTransaction();
        session.endSession();

        res.json({ success: true, paymentUrl, orderId: mainOrderId, orderIds });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error saving temporary order:", error);
        return next(
          new ErrorHandler(
            "Sản phẩm tạm thời hết hàng hoặc đã được giữ chỗ",
            400
          )
        );
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
};

module.exports = paymentService;
