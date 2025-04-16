const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const Order = require("../model/order");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post(
  "/process",
  catchAsyncErrors(async (req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
      metadata: {
        company: "Omprakash",
      },
    });
    res.status(200).json({
      success: true,
      client_secret: myPayment.client_secret,
    });
  })
);

router.get(
  "/stripeapikey",
  catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({ stripeApikey: process.env.STRIPE_API_KEY });
  })
);

router.post("/vnpay", async (req, res) => {
  const { totalPrice, cart, shippingAddress, user } = req.body;

  function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort();
    for (let key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  }

  let vnp_TmnCode = process.env.VNP_TMNCODE;
  let vnp_HashSecret = process.env.VNP_HASHSECRET;
  let vnp_Url = process.env.VNP_URL;
  let vnp_ReturnUrl = "http://localhost:8000/api/v2/order/vnpay-success";

  let date = new Date();
  let createDate = date
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 14);
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

  // Lưu đơn hàng tạm thời vào database
  try {
    const newOrder = new Order({
      cart: cart,
      shippingAddress: shippingAddress,
      user: user,
      totalPrice: totalPrice,
      status: "Processing",
      paymentInfo: {
        orderId: orderId, // Lưu vnp_TxnRef để liên kết
        type: "VNPAY",
      },
      paidAt: null,
    });

    await newOrder.save();
    console.log("Temporary order saved:", newOrder);
  } catch (error) {
    console.error("Error saving temporary order:", error);
    return res.status(500).json({ message: "Lỗi khi lưu đơn hàng tạm thời" });
  }

  res.json({ paymentUrl, orderId });
});

module.exports = router;
