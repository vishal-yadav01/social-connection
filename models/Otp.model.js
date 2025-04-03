const mongoose = require("mongoose");
const validator = require("validator");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: "`{VALUE}` is not a valid email format",
    },
  },
  otp: {
    type: String,
    required: true,
    validate: {
      validator: (value) => /^\d{4}$/.test(value),
      message: "OTP must be exactly 4 digits",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

otpSchema.index({ email: 1, otp: 1 }, { unique: true });

otpSchema.pre("save", async function (next) {
  try {
    await mailSender(
      this.email,
      "OTP Validation",
      `<p>Your OTP is: <b>${this.otp}</b></p>`
    );
    next();
  } catch (error) {
    console.error("Email sending failed:", error);
    next(new Error("Email sending failed"));
  }
});

const OTP = mongoose.model("Otp", otpSchema);
module.exports = OTP;
