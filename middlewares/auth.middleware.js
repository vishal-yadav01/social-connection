const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

exports.authMiddleware = async (req, res, next) => {
  try {
    const accessToken =
      req.headers?.authorization?.split(" ")[1] ||
      req.cookies?.accessToken ||
      req.body?.accessToken;
    console.log(req.headers);
    if (!accessToken) {
      return res.status(401).json({
        message: "Access token missing",
        success: false,
      });
    }

    try {
      req.user = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
      return next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        try {
          const refreshToken =
            req.headers["refresh-token"] || req.cookies?.refreshToken;
          console.log("hit middleware");
          console.log("referh toekn========", refreshToken);
          if (!refreshToken) {
            return res.status(401).json({
              message: "Refresh token not found",
              success: false,
            });
          }

          const refreshTokenDecode = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN
          );
          const findUser = await User.findById(refreshTokenDecode.id);

          if (!findUser) {
            return res
              .status(404)
              .json({ success: false, message: "Invalid user" });
          }

          const accessTokenPayload = {
            id: findUser._id,
            email: findUser.email,
          };
          const newAccessToken = generateAccessToken(accessTokenPayload);
          res.setHeader("Authorization", `Bearer ${newAccessToken}`);

          req.user = jwt.verify(newAccessToken, process.env.ACCESS_TOKEN);

          return next();
        } catch (error) {
          console.log(error);
          return res.status(403).json({
            success: false,
            message: "Refresh token expired, please log in again",
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid access token",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

const generateAccessToken = (userData) => {
  return jwt.sign(userData, process.env.ACCESS_TOKEN, { expiresIn: "3m" });
};

const generateRefreshToken = (userData) => {
  return jwt.sign(userData, process.env.REFRESH_TOKEN, { expiresIn: "3d" });
};

exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
