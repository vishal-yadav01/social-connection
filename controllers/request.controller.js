const ConnectionRequest = require("../models/connectionRequest.model");
const User = require("../models/User.model");
const mongoose = require("mongoose");

exports.sendRequest = async (req, res) => {
  try {
    const userId = req.user.id;

    const { status, toUserId } = req.params;

    if (!status || !toUserId) {
      return res.status(400).json({
        message: "Status or toUserId not provided",
        success: false,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({
        message: "Invalid toUserId format",
        success: false,
      });
    }

    if (toUserId === userId) {
      return res.status(400).json({
        message: "You cannot send a connection request to yourself",
        success: false,
      });
    }

    const allowedStatus = new Set(["ignored", "interested"]);
    if (!allowedStatus.has(status)) {
      return res
        .status(400)
        .json({ message: `Invalid status type: ${status}`, success: false });
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res
        .status(404)
        .json({ message: "Invalid toUserId", success: false });
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { toUserId, fromUserId: userId },
        { toUserId: userId, fromUserId: toUserId },
      ],
    });

    if (existingConnectionRequest) {
      return res.status(400).json({
        message: "Connection request already exists",
        success: false,
      });
    }
    const user = await User.findById(userId);
    const data = await ConnectionRequest.create({
      toUserId: toUserId,
      fromUserId: userId,
      status: status,
    });

    let message;
    if (status === "interested") {
      message = `${user.firstName} has shown interest in connecting with ${toUser.firstName}! 🎉`;
    } else {
      message = `${user.firstName} has ignored ${toUser.firstName}'s connection request. 😐`;
    }
    return res.status(200).json({
      message,
      success: true,
    });
  } catch (error) {
    console.error("Error in sendRequest:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Duplicate connection request", success: false });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to process connection request",
    });
  }
};

exports.reviewRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const { status, requestId } = req.params;

    if (!status || !requestId) {
      return res.status(400).json({
        message: "Status and request ID are required",
        success: false,
      });
    }

    const allowedStatus = new Set(["accepted", "rejected"]);
    if (!allowedStatus.has(status)) {
      return res
        .status(400)
        .json({ message: `Invalid status type: ${status}`, success: false });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res
        .status(400)
        .json({ message: "Invalid request ID format", success: false });
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: user._id,
      status: "interested",
    });

    if (!connectionRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Connection request not found" });
    }

    connectionRequest.status = status;
    await connectionRequest.save();

    const fromUser = await User.findById(connectionRequest.fromUserId);
    if (!fromUser) {
      return res
        .status(404)
        .json({ message: "Requesting user not found", success: false });
    }

    const message = `${user.firstName} ${status} ${fromUser.firstName}`;

    return res.status(200).json({
      message,
      success: true,
      data: connectionRequest,
    });
  } catch (error) {
    console.error("Error reviewing request:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
