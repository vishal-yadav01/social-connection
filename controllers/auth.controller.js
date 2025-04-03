const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/auth.middleware");
const User = require("../models/User.model");
const Otp = require("../models/Otp.model");
const otpGenerator = require("otp-generator");
const { signupValidation, loginValidation } = require("../utils/Validation");
const bcrypt = require("bcrypt");
const validator = require("validator");

exports.otpSender = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    const existingUser = await User.exists({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already has an account" });
    }
    // if (await Otp.exists({ email })) {
    //   await Otp.deleteOne({ email });
    // }
    await Otp.deleteMany({ email });

    const otp = otpGenerator.generate(4, {
      digits: true,
      specialChars: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
    });

    const instanceOfOtp = new Otp({ email, otp });
    await instanceOfOtp.save();

    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully", otp });
  } catch (error) {
    console.error("Error in OTP generator:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// * singup api

exports.signup = async (req, res) => {
  try {
    signupValidation(req);
    const { firstName, lastName, email, password, otp, confirmPassword } =
      req.body;

    console.log(password, otp, confirmPassword);

    if (confirmPassword !== password) {
      return res.status(400).json({
        message: "Password does not match the confirm password.",
        success: false,
      });
    }

    if (await User.findOne({ email: email })) {
      return res.status(400).json({
        message: "user already exaist",
        success: false,
      });
    }
    const otpVerificaion = await Otp.findOne({ email: email, otp: otp });
    if (!otpVerificaion)
      return res
        .status(404)
        .json({ message: "invliad user otp eaprir", success: false });
    if (!otpVerificaion.otp === otp) {
      return res.status(400).json({ message: "otp invlaid", success: false });
    }
    let savedUser;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const userInstance = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        imgUrl: `https://api.dicebear.com/5.x/initials/svg?seed=${
          firstName[0] + lastName[0]
        }`,
      });
      savedUser = await userInstance.save();
      const accessToken = generateAccessToken({
        id: savedUser._id,
        email: savedUser.email,
      });
      const refreshToken = generateRefreshToken({ id: savedUser._id });
      res.setHeader("Authorization", `Bearer ${accessToken}`);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Production ke liye secure true
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });
      savedUser.refreshToken = refreshToken;

      await savedUser.save();
      savedUser.password = undefined;
      savedUser.refreshToken = undefined;
      return res
        .status(200)
        .json({ success: true, message: "singu  succefully", data: savedUser });
    } catch (error) {
      console.log(error);
      if (savedUser) {
        await User.findByIdAndDelete(savedUser._id);
        return res.status(400).json({
          message: "error singup",
          success: false,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "sign up api fial",
      success: false,
    });
  }
};

exports.login = async (req, res) => {
  try {
    loginValidation(req);
    const { password, email } = req.body;
    console.log(password, email);
    const findUser = await User.findOne({ email }).select("+password");
    if (!findUser) {
      return res.status(404).json({
        message: "user not register",
      });
    }
    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "passwrod not match",
        success: false,
      });
    }
    const accessTokenPayload = { id: findUser._id, email: findUser.email };
    const refreshTokenPayload = { id: findUser._id };
    const accessToken = generateAccessToken(accessTokenPayload);
    const refreshToken = generateRefreshToken(refreshTokenPayload);
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Production ke liye secure true
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Localhost me "Lax"
      maxAge: 3 * 24 * 60 * 60 * 1000, // 7 din ke liye valid
      path: "/",
    });
    findUser.refreshToken = refreshToken;
    await findUser.save();

    findUser.refreshToken = undefined;
    findUser.password = undefined;

    return res.status(200).json({
      message: "login succefully ",
      success: true,
      data: findUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "loign api fail", success: false });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
    });

    res.status(200).json({ message: "Logged out successfully", success: true });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
      success: false,
    });
  }
};
