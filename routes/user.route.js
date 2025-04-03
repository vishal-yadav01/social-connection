const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  feed,
  allConnections,
  pendingConnectionRequests,
} = require("../controllers/user.controller");

router.get("/feed", authMiddleware, feed);
router.get("/all-connections", authMiddleware, allConnections);
router.get(
  "/pending-connection-requests",
  authMiddleware,
  pendingConnectionRequests
);

exports.userRoute = router;
