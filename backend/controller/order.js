const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const {
  isAuthenticated,
  isSeller,
  isShipper,
  isAdmin,
} = require("../middleware/auth");
const Order = require("../model/order");
const Shop = require("../model/shop");
const Product = require("../model/product");
const Shipper = require("../model/shipper");

// create new order
router.post(
  "/create-order",
  // isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;

      // 1. Kiểm tra dữ liệu đầu vào
      if (!cart || !shippingAddress || !user || !totalPrice || !paymentInfo) {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler("Missing required fields", 400));
      }

      if (!Array.isArray(cart) || cart.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler("Cart is empty", 400));
      }

      // Log dữ liệu đầu vào để debug
      console.log("Request body:", JSON.stringify(req.body, null, 2));

      // 2. Nhóm sản phẩm theo shopId và kiểm tra dữ liệu
      const shopItemsMap = new Map();
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
          return next(
            new ErrorHandler(
              `Invalid cart item: ${JSON.stringify(item)}`,
              400
            )
          );
        }
        const shopId = item.shopId;
        if (!shopItemsMap.has(shopId)) {
          shopItemsMap.set(shopId, []);
        }
        shopItemsMap.get(shopId).push(item);
      }

      // 3. Kiểm tra và cập nhật tồn kho
      const productUpdates = [];
      let calculatedSubTotalPrice = 0;
      for (const [shopId, items] of shopItemsMap) {
        for (const item of items) {
          const product = await Product.findById(item._id).session(session);
          if (!product) {
            await session.abortTransaction();
            session.endSession();
            return next(
              new ErrorHandler(`Product not found: ${item._id}`, 400)
            );
          }
          if (product.stock < item.qty) {
            await session.abortTransaction();
            session.endSession();
            return next(
              new ErrorHandler(
                `Insufficient stock for product: ${product.name}`,
                400
              )
            );
          }
          productUpdates.push({
            productId: item._id,
            qty: item.qty,
          });
          calculatedSubTotalPrice += item.discountPrice * item.qty;
        }
      }

      // 5. Cập nhật tồn kho
      for (const update of productUpdates) {
        await Product.findByIdAndUpdate(
          update.productId,
          {
            $inc: { stock: -update.qty, sold_out: update.qty },
          },
          { session, validateBeforeSave: false }
        );
      }

      // 6. Tạo đơn hàng cho từng shop
      const orders = [];
      for (const [shopId, items] of shopItemsMap) {
        // Tính giá sản phẩm cho shop
        const shopProductPrice = items.reduce(
          (total, item) => total + item.discountPrice * item.qty,
          0
        );

        // Tổng giá cho shop (sử dụng totalPrice từ client)
        const shopTotalPrice = shopProductPrice;

        // Làm tròn đến 2 chữ số thập phân
        const roundedShopTotalPrice = Math.round(shopTotalPrice * 100) / 100;

        // Kiểm tra shopTotalPrice
        if (isNaN(roundedShopTotalPrice) || roundedShopTotalPrice <= 0) {
          await session.abortTransaction();
          session.endSession();
          return next(
            new ErrorHandler(
              `Invalid total price for shop ${shopId}: ${roundedShopTotalPrice}`,
              400
            )
          );
        }

        const order = new Order({
          cart: items,
          shippingAddress,
          user,
          totalPrice: totalPrice, // Sử dụng totalPrice từ client
          paymentInfo,
          status: "Processing",
        });

        await order.save({ session });
        orders.push(order);
      }

      // 7. Commit transaction
      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.put(
  "/delete-order/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found", 400));
      }

      res.status(200).json({
        success: true,
        message: "Cancel order successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get("/vnpay-success", async (req, res) => {
  function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort();
    for (let key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  }

  let vnp_Params = req.query;
  let secureHash = vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);
  let vnp_HashSecret = process.env.VNP_HASHSECRET;
  let querystring = new URLSearchParams(vnp_Params).toString();
  let hmac = crypto.createHmac("sha512", vnp_HashSecret);
  let calculatedHash = hmac.update(querystring).digest("hex");

  if (secureHash === calculatedHash) {
    const orderId = vnp_Params["vnp_TxnRef"];

    // Bắt đầu transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (vnp_Params["vnp_ResponseCode"] === "00") {
        // Thanh toán thành công
        const order = await Order.findOne({
          "paymentInfo.orderId": orderId,
        }).session(session);

        if (!order) {
          await session.abortTransaction();
          session.endSession();
          console.error("Order not found for orderId:", orderId);
          return res.redirect(
            `${process.env.REACT_APP_FRONT_END_URL}/order/failure`
          );
        }

        // Kiểm tra và giảm tồn kho
        const productUpdates = [];
        for (const item of order.cart) {
          const product = await Product.findById(item._id).session(session);
          if (!product) {
            await session.abortTransaction();
            session.endSession();
            return res.redirect(
              `${process.env.REACT_APP_FRONT_END_URL}/order/failure`
            );
          }
          if (product.stock < item.qty) {
            await session.abortTransaction();
            session.endSession();
            console.error(
              `Insufficient stock for product: ${product.name}, orderId: ${orderId}`
            );
            return res.redirect(
              `${process.env.REACT_APP_FRONT_END_URL}/order/failure`
            );
          }
          productUpdates.push({
            productId: item._id,
            qty: item.qty,
          });
        }

        // Cập nhật tồn kho
        for (const update of productUpdates) {
          await Product.findByIdAndUpdate(
            update.productId,
            {
              $inc: { stock: -update.qty, sold_out: update.qty },
            },
            { session, validateBeforeSave: false }
          );
        }

        // Cập nhật đơn hàng
        order.paymentInfo.id = vnp_Params["vnp_TransactionNo"];
        order.paymentInfo.status = "Paid";
        order.paidAt = new Date();
        await order.save({ session });

        console.log("Order updated:", order);

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        const redirectUrl = `${process.env.REACT_APP_FRONT_END_URL}/order/success`;
        res.send(`
          <script>
            localStorage.setItem("cartItems", JSON.stringify([]));
            window.location.href = "${redirectUrl}";
          </script>
        `);
      } else {
        // Thanh toán thất bại
        await Order.findOneAndUpdate(
          { "paymentInfo.orderId": orderId },
          {
            "paymentInfo.status": "Failed",
          },
          { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.redirect(`${process.env.REACT_APP_FRONT_END_URL}/order/failure`);
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error processing VNPay callback:", error);
      res.redirect(`${process.env.REACT_APP_FRONT_END_URL}/order/failure`);
    }
  } else {
    res.send("Xác minh chữ ký thất bại");
  }
});

// get all orders of user
router.get(
  "/get-all-orders/:userId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({ "user._id": req.params.userId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all orders of seller
router.get(
  "/get-seller-all-orders/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({
        "cart.shopId": req.params.shopId,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all orders of seller
router.get(
  "/get-shipper-all-orders/:shipperId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Lấy thông tin shipper dựa trên shipperId
      const shipper = await Shipper.findById(req.params.shipperId);
      if (!shipper) {
        return next(new ErrorHandler("Shipper not found", 404));
      }

      // Lấy danh sách các ward mà shipper phụ trách
      const deliveredWards = shipper.deliveredArea.map((area) => area.ward);

      // Tìm các đơn hàng có shippingAddress.ward nằm trong danh sách deliveredWards
      // và trạng thái là "Transferred to delivery partner", "On the way", hoặc "Delivered"
      const orders = await Order.find({
        "shippingAddress.ward": { $in: deliveredWards },
        status: {
          $in: [
            "Transferred to delivery partner",
            "On the way",
            "Delivered",
          ],
        },
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update order status for shipper
router.put(
  "/update-order-status-by-shipper/:id",
  isShipper,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      // Kiểm tra quyền shipper
      if (order.shipperId.toString() !== req.shipper._id.toString()) {
        return next(
          new ErrorHandler("You are not authorized to update this order", 403)
        );
      }

      const allowedStatuses = [
        "Shipping",
        "The shipper has received the order from the store.",
        "On the way",
        "Delivered",
      ];

      const { status } = req.body;

      // Kiểm tra trạng thái hợp lệ
      if (!allowedStatuses.includes(status)) {
        return next(
          new ErrorHandler(
            "Invalid status. Allowed statuses are: " +
              allowedStatuses.join(", "),
            400
          )
        );
      }

      // Cập nhật trạng thái
      order.status = status;

      // Xử lý trạng thái Delivered
      if (status === "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "Succeeded";

        // Cập nhật số dư của seller
        await updateSellerInfo(order);
      }

      async function updateSellerInfo(order) {
        // Lấy shopId từ order (giả sử order có trường shopId hoặc tương tự)
        const seller = await Shop.findById(order.cart.map((i) => i.shopId));
        if (!seller) {
          throw new ErrorHandler("Seller not found", 404);
        }
        seller.availableBalance += order.totalPrice;
        await seller.save();
      }

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      if (req.body.status === "Transferred to delivery partner") {
        // for (const o of order.cart) {
        //   await updateOrder(o._id, o.qty);
        // }

        // Tìm shipper phù hợp dựa trên ward
        const shipper = await Shipper.findOne({
          "deliveredArea.ward": order.shippingAddress.ward,
        });

        if (!shipper) {
          return next(
            new ErrorHandler("No shipper available for this area", 400)
          );
        }

        // Gán shipperId vào đơn hàng
        order.shipperId = shipper._id;
      }

      order.status = req.body.status;

      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "Succeeded";
        await updateSellerInfo(order.totalPrice);
      }

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
      });

      // async function updateOrder(id, qty) {
      //   const product = await Product.findById(id);
      //   product.stock -= qty;
      //   product.sold_out += qty;
      //   await product.save({ validateBeforeSave: false });
      // }

      async function updateSellerInfo(amount) {
        const seller = await Shop.findById(req.seller.id);
        seller.availableBalance += amount;
        await seller.save();
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// give a refund ----- user
router.put(
  "/order-refund/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
        message: "Order Refund Request successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// accept the refund ---- seller
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order Refund successfull!",
      });

      if (req.body.status === "Refund Success") {
        order.cart.forEach(async (o) => {
          await updateOrder(o._id, o.qty);
        });
      }

      async function updateOrder(id, qty) {
        const product = await Product.findById(id);

        product.stock += qty;
        product.sold_out -= qty;

        await product.save({ validateBeforeSave: false });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all orders --- for admin
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find().sort({
        deliveredAt: -1,
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
