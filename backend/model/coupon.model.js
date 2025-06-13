const mongoose = require("mongoose");

const coupounCodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your coupoun code name!"],
    unique: true,
  },
  value: {
    type: Number,
    required: true,
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "percentage",
  },
  minAmount: {
    type: Number,
  },
  maxAmount: {
    type: Number,
  },
  shopId: {
    type: String,
    required: true,
  },
  selectedProduct: {
    type: String,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: 0, // 0 means unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("CoupounCode", coupounCodeSchema);
