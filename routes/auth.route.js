const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const rateLimit = require("express-rate-limit");
const {
  login,
  logout,
  signup,
  otpSender,
} = require("../controllers/auth.controller");

// res.status === 429
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts, try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  //   skip: (req, res) => req.user && req.user.isAdmin, // Skip rate limiting for admins
});

router.post("/signup", signup);
router.post("/login", authLimiter, login);
router.get("/logout", authMiddleware, logout);
router.post("/otpsend", authLimiter, otpSender);

exports.authRoute = router;
