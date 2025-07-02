const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const shopSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  name: {
    type: String,
    required: [true, "Please enter your shop name!"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Please enter your shop email address!"],
  },
  password: {
    type: String,
    minLength: [6, "Password should be greater than 6 characters"],
    select: false,
  },
  phoneNumber: {
    type: String,
  },
  addresses: [
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
      address1: {
        type: String,
      },
      addressType: {
        type: String,
      },
    },
  ],
  role: {
    type: String,
    default: "Seller",
  },
  avatar: {
    type: String,
    default: "default-avatar.png",
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  withdrawMethod: {
    type: Object,
  },
  availableBalance: {
    type: Number,
    default: 0,
  },
  transections: [
    {
      amount: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        default: "Processing",
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
      updatedAt: {
        type: Date,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
  refreshToken: {
    type: String,
    default: null,
  },
});

// Hash password
shopSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// JWT token
shopSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES,
  });
};

// JWT refresh token
shopSchema.methods.getRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET_KEY, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES,
  });
};

// Compare password
shopSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Shop", shopSchema);