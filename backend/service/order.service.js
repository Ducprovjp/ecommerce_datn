const mongoose = require("mongoose");
const crypto = require("crypto");
const Order = require("../model/order.model");
const Shop = require("../model/shop.model");
const Product = require("../model/product.model");
const Shipper = require("../model/shipper.model");
const CouponCode = require("../model/coupon.model");
const ErrorHandler = require("../utils/ErrorHandler");
const socketIO = require("socket.io-client");

const socket = socketIO(
  process.env.REACT_APP_SOCKET_URL || "http://localhost:4000",
  {
    withCredentials: true,
  }
);

const orderService = {
  async createOrder(data, res, next) {
    try {
      const {
        cart,
        shippingAddress,
        user,
        totalPrice,
        paymentInfo,
        couponCode,
      } = data;
      if (!cart || !shippingAddress || !user || !totalPrice || !paymentInfo) {
        return next(
          new ErrorHandler("Please provide all required fields", 400)
        );
      }

      if (!Array.isArray(cart) || cart.length === 0) {
        return next(new ErrorHandler("Cart is empty", 400));
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
          if (product.stock - product.reservedStock < item.qty) {
            await session.abortTransaction();
            session.endSession();
            return next(
              new ErrorHandler(`Product out of stock: ${product.name}`, 400)
            );
          }

          productUpdates.push({
            productId: item._id,
            qty: item.qty,
          });
        }

        // Validate and update coupon
        if (couponCode) {
          const coupon = await CouponCode.findOne({ name: couponCode }).session(
            session
          );
          if (!coupon) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler("Coupon code not found", 400));
          }
          if (
            !coupon.isActive ||
            coupon.endDate < new Date() ||
            coupon.startDate > new Date()
          ) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler("Coupon code is not valid", 400));
          }
          if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            await session.abortTransaction();
            session.endSession();
            return next(
              new ErrorHandler("Coupon code usage limit reached", 400)
            );
          }
          const isCouponValid = cart.filter(
            (item) =>
              item.shopId === coupon.shopId &&
              (!coupon.selectedProduct?.length ||
                coupon.selectedProduct.includes(item.name))
          );
          if (isCouponValid.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return next(
              new ErrorHandler(
                "Coupon code not valid for any items in your cart",
                400
              )
            );
          }
          const eligiblePrice = isCouponValid.reduce(
            (acc, item) => acc + item.qty * item.discountPrice,
            0
          );
          if (coupon.minAmount && eligiblePrice < coupon.minAmount) {
            await session.abortTransaction();
            session.endSession();
            return next(
              new ErrorHandler(
                `Order total must be at least ${coupon.minAmount.toLocaleString(
                  "en-US"
                )} VND`,
                400
              )
            );
          }
          if (coupon.maxAmount && eligiblePrice > coupon.maxAmount) {
            await session.abortTransaction();
            session.endSession();
            return next(
              new ErrorHandler(
                `Order total must not exceed ${coupon.maxAmount.toLocaleString(
                  "en-US"
                )} VND`,
                400
              )
            );
          }
          console.log(`Incrementing usedCount for coupon: ${couponCode}`);
          coupon.usedCount += 1;
          await coupon.save({ session });
        }

        // Update product stock
        for (const update of productUpdates) {
          await Product.findByIdAndUpdate(
            update.productId,
            { $inc: { stock: -update.qty, sold_out: update.qty } },
            { session, validateBeforeSave: false }
          );
        }

        // Nhóm cart theo shopId
        const cartByShop = {};
        for (const item of cart) {
          if (!cartByShop[item.shopId]) cartByShop[item.shopId] = [];
          cartByShop[item.shopId].push(item);
        }

        const createdOrders = [];

        for (const [shopId, items] of Object.entries(cartByShop)) {
          const shopTotal = items.reduce(
            (sum, item) => sum + item.discountPrice * item.qty,
            0
          );

          const order = new Order({
            cart: items,
            shippingAddress,
            user,
            totalPrice: shopTotal,
            paymentInfo,
            couponCode,
            paidAt: paymentInfo.status === "succeeded" ? new Date() : null,
          });

          await order.save({ session });
          createdOrders.push(order);
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
          success: true,
          orders: createdOrders,
        });

        return order;
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error creating order:", error);
        return next(new ErrorHandler("Product out of stock or reserved", 400));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async cancelOrderBySeller(orderId, sellerCancelReason, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler("Order not found", 400));
      }

      if (order.status !== "Processing") {
        await session.abortTransaction();
        session.endSession();
        return next(
          new ErrorHandler("Order cannot be cancelled at this stage", 400)
        );
      }

      // Update product stock
      for (const item of order.cart) {
        await Product.findByIdAndUpdate(
          item._id,
          { $inc: { stock: item.qty, sold_out: -item.qty } },
          { session, validateBeforeSave: false }
        );
      }

      // Update order status and reason
      order.status = "Cancelled by Seller";
      order.sellerCancelReason = sellerCancelReason;
      await order.save({ session, validateBeforeSave: false });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        order,
        message: "Order cancelled by seller successfully",
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error cancelling order by seller:", error);
      return next(new ErrorHandler("Error cancelling order by seller", 500));
    }
  },

  async handleVNPaySuccess(vnp_Params, res, next) {
    console.log("VNPay callback params:", vnp_Params);
    function sortObject(obj) {
      let sorted = {};
      let keys = Object.keys(obj).sort();
      for (let key of keys) {
        sorted[key] = obj[key];
      }
      return sorted;
    }

    let secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    let vnp_HashSecret = process.env.VNP_HASHSECRET;
    let querystring = new URLSearchParams(vnp_Params).toString();
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let calculatedHash = hmac.update(querystring).digest("hex");

    if (secureHash === calculatedHash) {
      const mainOrderId = vnp_Params["vnp_TxnRef"];

      // Lấy orderIds từ vnp_OrderInfo
      const orderInfo = vnp_Params["vnp_OrderInfo"];
      let orderIds = [];

      if (orderInfo && orderInfo.includes("|")) {
        // Tách orderIds từ OrderInfo: "Thanh toan don hang 123456|order1,order2,order3"
        const parts = orderInfo.split("|");
        if (parts.length > 1) {
          orderIds = parts[1].split(",");
        }
      }

      // Nếu không có orderIds trong OrderInfo, tìm bằng mainOrderId
      if (orderIds.length === 0) {
        // Tìm tất cả orders có mainOrderId tương ứng
        const orders = await Order.find({
          "paymentInfo.mainOrderId": mainOrderId,
        });
        orderIds = orders.map((order) => order.paymentInfo.orderId);
      }

      console.log("VNPay Transaction Reference:", mainOrderId);
      console.log("Order IDs found:", orderIds);

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Tìm orders bằng orderIds hoặc mainOrderId
        let orders;
        if (orderIds.length > 0) {
          orders = await Order.find({
            "paymentInfo.orderId": { $in: orderIds },
          }).session(session);
        } else {
          orders = await Order.find({
            "paymentInfo.mainOrderId": mainOrderId,
          }).session(session);
        }

        console.log("Orders found:", orders.length);

        if (orders.length === 0) {
          await session.abortTransaction();
          session.endSession();
          console.error("No orders found for mainOrderId:", mainOrderId);
          return res.redirect(
            `${process.env.REACT_APP_FRONT_END_URL}/order/failure`
          );
        }

        if (vnp_Params["vnp_ResponseCode"] === "00") {
          console.log("VNPay Response Code:", vnp_Params["vnp_ResponseCode"]);
          // Thanh toán thành công
          const productUpdates = [];

          for (const order of orders) {
            // Kiểm tra và cập nhật stock
            for (const item of order.cart) {
              const product = await Product.findById(item._id).session(session);
              if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res.redirect(
                  `${process.env.REACT_APP_FRONT_END_URL}/order/failure`
                );
              }

              // Bỏ kiểm tra availableStock vì đã được reserve từ trước
              // Chỉ cần đảm bảo product tồn tại và có đủ reservedStock
              if (product.reservedStock < item.qty) {
                await session.abortTransaction();
                session.endSession();
                console.error(
                  `Insufficient reserved stock for product: ${product.name}, orderId: ${order.paymentInfo.orderId}`
                );
                return res.redirect(
                  `${process.env.REACT_APP_FRONT_END_URL}/order/failure`
                );
              }

              productUpdates.push({
                productId: item._id,
                qty: item.qty,
                reservedStock: product.reservedStock,
              });
            }

            // Cập nhật coupon nếu có
            if (order.couponCode) {
              const coupon = await CouponCode.findOne({
                name: order.couponCode,
              }).session(session);
              if (coupon) {
                console.log(
                  `Incrementing usedCount for coupon: ${order.couponCode}`
                );
                coupon.usedCount += 1;
                await coupon.save({ session });
              }
            }

            // Cập nhật trạng thái đơn hàng
            order.paymentInfo.id = vnp_Params["vnp_TransactionNo"];
            order.paymentInfo.status = "Paid";
            order.paidAt = new Date();
            order.reservationExpiresAt = null;
            await order.save({ session });
          }

          // Cập nhật stock và reservedStock
          for (const update of productUpdates) {
            await Product.findByIdAndUpdate(
              update.productId,
              {
                $inc: { stock: -update.qty, sold_out: update.qty },
                $set: {
                  reservedStock: Math.max(0, update.reservedStock - update.qty),
                },
              },
              { session, validateBeforeSave: false }
            );
          }

          await session.commitTransaction();
          session.endSession();

          const redirectUrl = `${process.env.REACT_APP_FRONT_END_URL}/order/success?clearCart=true&payment=vnpay`;
          res.redirect(redirectUrl);
        } else {
          // Thanh toán thất bại
          for (const order of orders) {
            for (const item of order.cart) {
              const product = await Product.findById(item._id).session(session);
              if (product) {
                await Product.findByIdAndUpdate(
                  item._id,
                  {
                    $set: {
                      reservedStock: Math.max(
                        0,
                        product.reservedStock - item.qty
                      ),
                    },
                  },
                  { session, validateBeforeSave: false }
                );
              }
            }
            await Order.findOneAndUpdate(
              { "paymentInfo.orderId": order.paymentInfo.orderId },
              { "paymentInfo.status": "Failed", reservationExpiresAt: null },
              { session }
            );
          }
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
  },

  async cancelVNPayOrder(orderId, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const orders = await Order.find({
        "paymentInfo.orderId": { $regex: `^${orderId}_` },
      }).session(session);
      if (orders.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler("Orders not found", 400));
      }

      for (const order of orders) {
        if (order.paymentInfo.status === "Paid") {
          await session.abortTransaction();
          session.endSession();
          return next(
            new ErrorHandler("Order already paid, cannot cancel", 400)
          );
        }

        for (const item of order.cart) {
          await Product.findByIdAndUpdate(
            item._id,
            { $inc: { reservedStock: -item.qty } },
            { session, validateBeforeSave: false }
          );
        }

        await Order.deleteOne({ _id: order._id }).session(session);
      }

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "VNPay orders cancelled successfully",
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error cancelling VNPay orders:", error);
      return next(new ErrorHandler("Error cancelling VNPay orders", 500));
    }
  },

  async getUserOrders(userId, res, next) {
    try {
      const orders = await Order.find({ "user._id": userId }).sort({
        createdAt: -1,
      });
      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async getSellerOrders(shopId, res, next) {
    try {
      const orders = await Order.find({ "cart.shopId": shopId }).sort({
        createdAt: -1,
      });
      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async getShipperOrders(shipperId, res, next) {
    try {
      const shipper = await Shipper.findById(shipperId);
      if (!shipper) {
        return next(new ErrorHandler("Shipper not found", 404));
      }

      const deliveredWards = shipper.deliveredArea.map((area) => area.ward);
      const orders = await Order.find({
        "shippingAddress.ward": { $in: deliveredWards },
        $or: [
          {
            status: "Contacting the delivery service",
            shipperId: { $in: [null, shipperId] },
          }, // Lấy đơn chưa có shipper hoặc của shipper hiện tại
          {
            status: {
              $in: [
                "Transferred to delivery partner",
                "On the way",
                "Delivered",
              ],
            },
            shipperId: shipperId,
          }, // Lấy đơn của shipper ở trạng thái sau khi được giao
        ],
      }).sort({ createdAt: -1 });

      console.log(
        `Orders fetched for shipper ${shipperId}:`,
        orders.map((o) => ({
          _id: o._id,
          status: o.status,
          shipperId: o.shipperId,
        }))
      );

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error(
        `Error fetching orders for shipper ${shipperId}:`,
        error.message
      );
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async acceptOrder(orderId, shipperId, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler("Order not found", 400));
      }

      if (order.shipperId) {
        await session.abortTransaction();
        session.endSession();
        return next(
          new ErrorHandler("Order already assigned to a shipper", 400)
        );
      }

      if (order.status !== "Contacting the delivery service") {
        await session.abortTransaction();
        session.endSession();
        return next(
          new ErrorHandler("Order is not available for acceptance", 400)
        );
      }

      const shipper = await Shipper.findById(shipperId).session(session);
      if (!shipper) {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler("Shipper not found", 404));
      }

      order.shipperId = shipperId;
      await order.save({ session, validateBeforeSave: false });

      await session.commitTransaction();
      session.endSession();

      socket.emit("orderAccepted", { orderId, shipperId });

      res.status(200).json({
        success: true,
        order,
        message: "Order accepted successfully",
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error accepting order:", error);
      return next(new ErrorHandler("Error accepting order", 500));
    }
  },

  async updateOrderStatusByShipper(orderId, status, shipper, res, next) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      if (order.shipperId.toString() !== shipper._id.toString()) {
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

      if (!allowedStatuses.includes(status)) {
        return next(
          new ErrorHandler(
            "Invalid status. Allowed statuses are: " +
              allowedStatuses.join(", "),
            400
          )
        );
      }

      order.status = status;
      if (status === "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "Succeeded";
        await this.updateSellerInfo(order);
      }

      await order.save({ validateBeforeSave: false });
      res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async updateSellerInfo(order) {
    const seller = await Shop.findById(order.cart.map((i) => i.shopId));
    if (!seller) {
      throw new ErrorHandler("Seller not found", 404);
    }
    seller.availableBalance += order.totalPrice;
    await seller.save();
  },

  async updateOrderStatus(orderId, status, seller, res, next) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      if (status === "Contacting the delivery service") {
        const shippers = await Shipper.find({
          "deliveredArea.ward": order.shippingAddress.ward,
        });
        if (!shippers.length) {
          return next(
            new ErrorHandler("No shipper available for this area", 400)
          );
        }
        // Prepare full order data for socket emission
        const orderData = {
          _id: order._id,
          status: status,
          cart: order.cart,
          shippingAddress: order.shippingAddress,
          user: order.user,
          totalPrice: order.totalPrice,
          shopAddress: order.cart[0]?.shopAddress || {}, // Ensure shopAddress is included
          createdAt: order.createdAt,
        };
        socket.emit("findShippers", {
          orderId,
          orderData,
          shippers,
          ward: order.shippingAddress.ward,
        });
      }

      if (status === "Transferred to delivery partner") {
        if (!order.shipperId) {
          return next(
            new ErrorHandler("No shipper assigned to this order", 400)
          );
        }
      }

      order.status = status;
      if (status === "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "Succeeded";
        await this.updateSellerInfoForSeller(order, seller);
      }

      await order.save({ validateBeforeSave: false });
      res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async updateSellerInfoForSeller(order, seller) {
    const shop = await Shop.findById(seller.id);
    shop.availableBalance += order.totalPrice;
    await shop.save();
  },

  async cancelShipperForOrder(orderId, res, next) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return next(new ErrorHandler("Order not found", 400));
      }
      order.shipperId = null;
      // Có thể log lại lịch sử shipper cũ nếu muốn
      await order.save({ validateBeforeSave: false });
      res.status(200).json({
        success: true,
        order,
        message: "Đã hủy giao đơn cho shipper thành công!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async requestOrderRefund(orderId, status, refundReason, res, next) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = status;
      if (refundReason) {
        order.refundReason = refundReason;
      }
      await order.save({ validateBeforeSave: false });
      res.status(200).json({
        success: true,
        order,
        message: "Order refund request submitted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async cancelOrder(orderId, status, cancelReason, res, next) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      if (order.status !== "Processing" && order.status !== "Packaging") {
        return next(
          new ErrorHandler("Order cannot be cancelled at this stage", 400)
        );
      }

      order.status = status;
      if (cancelReason) {
        order.cancelReason = cancelReason;
      }
      await order.save({ validateBeforeSave: false });
      res.status(200).json({
        success: true,
        order,
        message: "Order cancelled successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async acceptOrderRefund(orderId, status, res, next) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = status;
      await order.save();

      res.status(200).json({
        success: true,
        message: "Order refund processed successfully!",
      });

      if (status === "Refund Success") {
        for (const o of order.cart) {
          await this.updateOrder(o._id, o.qty);
        }
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async updateOrder(id, qty) {
    const product = await Product.findById(id);
    product.stock += qty;
    product.sold_out -= qty;
    await product.save({ validateBeforeSave: false });
  },

  async getAllOrdersForAdmin(res, next) {
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
  },
};

module.exports = orderService;
