const Shop = require("../model/shop.model");
const Withdraw = require("../model/withdraw.model");
const sendMail = require("../utils/sendMail");
const ErrorHandler = require("../utils/ErrorHandler");

const withdrawService = {
  async createWithdrawRequest(amount, seller, res, next) {
    try {
      const data = { seller, amount };

      try {
        await sendMail({
          email: seller.email,
          subject: "Withdraw Request",
          message: `Hello ${seller.name}, Your withdraw request of ${amount.toLocaleString("vi") + " VNĐ"} is processing. It will take 3days to 7days to process!`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }

      const withdraw = await Withdraw.create();
      data

      const shop = await Shop.findById(seller._id);
      shop.sold_out += amount.sold_out - amount;

      await shop.save();

      res.status(201).json({
        success: true,
        withdraw,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async getAllWithdrawRequests(res, next) {
    try {
      const withdraws = await Withdraw.find().sort({ createdAt: -1 });
      res.status(201).json({
        success: true,
        withdraws,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },

  async updateWithdrawRequest(withdrawId, sellerId, res, next) {
    try {
      const withdraw = await Withdraw.findByIdAndUpdate(
        withdrawId,
        { status: "succeed", updatedAt: Date.now() },
        { new: true }
      );

      const seller = await Shop.findById(sellerId);
      const transaction = {
        _id: withdraw._id,
        amount: withdraw.amount,
        updatedAt: withdraw.updatedAt,
        status: withdraw.status,
      };

      seller.transactions = [...seller.transactions, transaction];
      await seller.save();

      try {
        await sendMail({
          email: seller.email,
          subject: "Payment confirmation",
          message: `Hello ${seller.name}, Your withdraw request of ${withdraw.amount.toLocaleString("vi-VN")} VNĐ is on the way. Delivery time depends on your bank's rules it usually takes 3days to 7days.`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }

      res.status(201).json({
        success: true,
        withdraw,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
};

module.exports = withdrawService;