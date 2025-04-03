const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxLength: [50, "First name cannot exceed 50 characters"],
      minLength: [3, "First name must be at least 3 characters"],
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      maxLength: [15, "Last name cannot exceed 15 characters"],
      minLength: [3, "Last name must be at least 3 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (value) => validator.isStrongPassword(value),
        message: "Password is not strong enough",
      },
      select: false,
    },
    age: {
      type: Number,
      min: [18, "Minimum age is 18 years"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    isPrime: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
    },
    imgUrl: {
      type: String,
      validate: {
        validator: (value) => validator.isURL(value),
        message: "image url not valid",
      },
    },
    about: {
      type: String,
      default: "This is a default about section for the user!",
    },
    skills: {
      type: [String],
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ firstName: 1, lastName: 1 });

userSchema.methods.userData = function () {
  return this;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
