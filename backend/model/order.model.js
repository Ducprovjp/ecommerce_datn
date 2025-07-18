const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  cart: {
    type: Array,
    required: true,
  },
  shippingAddress: {
    type: Object,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Processing",
  },
  paymentInfo: {
    id: {
      type: String,
    },
    orderId: {
      type: String,
    },
    status: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  shipperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shipper",
    default: null,
  },
  paidAt: {
    type: Date,
    default: Date.now,
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reservationExpiresAt: {
    type: Date,
  },
  refundReason: {
    type: String,
    default: null,
  },
  cancelReason: {
    type: String,
    default: null,
  },
  sellerCancelReason: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Order", orderSchema);