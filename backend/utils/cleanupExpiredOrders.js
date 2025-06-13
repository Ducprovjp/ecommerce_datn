const mongoose = require("mongoose");
const Order = require("../model/order.model");
const Product = require("../model/product.model");

async function cleanupExpiredOrders() {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const expiredOrders = await Order.find({
      "paymentInfo.type": "VNPAY",
      reservationExpiresAt: { $lte: new Date() },
      "paymentInfo.status": { $ne: "Paid" },
    }).session(session);

    for (const order of expiredOrders) {
      for (const item of order.cart) {
        const product = await Product.findById(item._id).session(session);
        if (product) {
          await Product.findByIdAndUpdate(
            item._id,
            { $set: { reservedStock: Math.max(0, product.reservedStock - item.qty) } },
            { session, validateBeforeSave: false }
          );
        }
      }
      await Order.deleteOne({ _id: order._id }).session(session);
      console.log(`Deleted expired order: ${order._id}`);
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error cleaning up expired orders:", error);
  }
}

module.exports = cleanupExpiredOrders;