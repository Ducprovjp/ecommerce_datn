const express = require("express");
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
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;

      //   group cart items by shopId
      const shopItemsMap = new Map();

      for (const item of cart) {
        const shopId = item.shopId;
        if (!shopItemsMap.has(shopId)) {
          shopItemsMap.set(shopId, []);
        }
        shopItemsMap.get(shopId).push(item);
      }

      // create an order for each shop
      const orders = [];

      for (const [shopId, items] of shopItemsMap) {
        const order = await Order.create({
          cart: items,
          shippingAddress,
          user,
          totalPrice,
          paymentInfo,
        });
        orders.push(order);
      }

      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
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

    if (vnp_Params["vnp_ResponseCode"] === "00") {
      // Thanh toán thành công
      try {
        const updatedOrder = await Order.findOneAndUpdate(
          { "paymentInfo.orderId": orderId }, // Tìm theo paymentInfo.orderId
          {
            "paymentInfo.id": vnp_Params["vnp_TransactionNo"],
            "paymentInfo.status": "Paid",
            paidAt: new Date(),
          },
          { new: true }
        );

        if (!updatedOrder) {
          console.error("Order not found for orderId:", orderId);
          return res.redirect("http://localhost:3000/order/failure");
        }

        console.log("Order updated:", updatedOrder);
        res.send(`
          <script>
            localStorage.setItem("cartItems", JSON.stringify([]));
            window.location.href = "http://localhost:3000/order/success";
          </script>
        `);
      } catch (error) {
        console.error("Error updating order:", error);
        res.redirect("http://localhost:3000/order/failure");
      }
    } else {
      // Thanh toán thất bại
      try {
        await Order.findOneAndUpdate(
          { "paymentInfo.orderId": orderId },
          {
            "paymentInfo.status": "Failed",
          }
        );
      } catch (error) {
        console.error("Error updating failed order:", error);
      }
      res.redirect("http://localhost:3000/order/failure");
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
      // và trạng thái là "Transferred to delivery partner", "Shipping", "On the way", hoặc "Delivered"
      const orders = await Order.find({
        "shippingAddress.ward": { $in: deliveredWards },
        status: {
          $in: [
            "Transferred to delivery partner",
            "Shipping",
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
