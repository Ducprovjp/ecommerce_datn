const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const shipperSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email address"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password should be greater than 6 characters"],
    select: false,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "Shipper",
  },
  avatar: {
    type: String,
    required: true,
  },
  availableBalance: {
    type: Number,
    default: 0,
  },
  deliveredArea: [
    {
      province: {
        type: String,
      },
      district: {
        type: String,
      },
      ward: {
        type: String,
      },
    },
  ],
  deliveries: [
    {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },
      status: {
        type: String,
        enum: ["Pending", "In Progress", "Completed", "Cancelled"],
        default: "Pending",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

// Hash password
shipperSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
shipperSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// compare password
shipperSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Shipper", shipperSchema);
