const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  sendRequest,
  reviewRequest,
} = require("../controllers/request.controller");

router.post("/send/:status/:toUserId", authMiddleware, sendRequest);
router.post("/review/:status/:requestId", authMiddleware, reviewRequest);

exports.requestRoute = router;
