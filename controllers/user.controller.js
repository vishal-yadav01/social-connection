const ConnectionRequest = require("../models/connectionRequest.model");
const User = require("../models/User.model");

const SELECTED_DATA = "firstName lastName imgUrl age gender about skills";
exports.allConnections = async (req, res) => {
  try {
    // 🔹 Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID is missing",
      });
    }

    // 🔹 Fetch all accepted connections where the user is either sender or receiver
    const connections = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ fromUserId: req.user.id }, { toUserId: req.user.id }],
    })
      .populate("fromUserId", SELECTED_DATA)
      .populate("toUserId", SELECTED_DATA);

    // 🔹 Extract the other user from each connection
    const connectionList = connections.map((conn) =>
      conn.fromUserId._id.equals(req.user.id) ? conn.toUserId : conn.fromUserId
    );

    return res.status(200).json({
      success: true,
      message:
        connectionList.length > 0
          ? "Connections fetched successfully"
          : "No connections found",
      data: connectionList,
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.pendingConnectionRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const pendingRequests = await ConnectionRequest.find({
      toUserId: userId,
      status: "interested",
    }).populate("fromUserId", SELECTED_DATA);

    return res.status(200).json({
      success: true,
      message:
        pendingRequests.length > 0
          ? "Pending requests fetched successfully"
          : "There are no pending requests, bro",
      data: pendingRequests.length > 0 ? pendingRequests : [],
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.feed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    }).select("fromUserId toUserId");

    const hideUsers = new Set();
    hideUsers.add(userId.toString());

    connectionRequests.forEach((request) => {
      hideUsers.add(request.fromUserId.toString());
      hideUsers.add(request.toUserId.toString());
    });

    console.log("All hidden users from feed:", hideUsers);

    const users = await User.find({
      _id: { $nin: Array.from(hideUsers) },
    })
      .select(SELECTED_DATA)
      .skip(skip)
      .limit(limit);

    // *Shuffle users randomly
    users = users.sort(() => Math.random() - 0.5);

    return res
      .status(200)
      .json({ success: true, message: "feed fetch succefully", data: users });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return res
      .status(500)
      .json({ message: "Internal server error feed api", success: false });
  }
};
