const User = require("../models/User.model");
const mediaUploader = require("../utils/mediaHanlder");

exports.profile = async (req, res) => {
  console.log("hit prfile");
  try {
    const userId = req.user.id;
    if (!userId) {
      throw new Error("User id missing (middlware create problem)");
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "user id invlaid or user not find",
        success: false,
      });
    }
    return res.status(200).json({
      data: user,
      success: true,
      message: "user finded succefully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "profiel fetch api fail",
    });
  }
};

exports.editProfile = async (req, res) => {
  try {
    const updateFields = req.body;
    console.log(updateFields);

    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or invalid user ID", success: false });
    }

    // // Update specific fields if provided
    // if (updateFields.firstName) user.firstName = updateFields.firstName;
    // if (updateFields.lastName) user.lastName = updateFields.lastName;

    // Loop through the fields and update dynamically
    Object.keys(updateFields).forEach((key) => {
      user[key] = updateFields[key];
    });

    await user.save();
    res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

exports.updateProfileImage = async (req, res) => {
  try {
    console.log("image route run");
    const img = req.files?.file;
    if (!img || !img.tempFilePath) {
      return res.status(400).json({
        message: "Image not found or invalid file",
        success: false,
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    try {
      const imgUploadRes = await mediaUploader(img, "social-connection");

      if (imgUploadRes && imgUploadRes.secure_url) {
        user.imgUrl = imgUploadRes.secure_url;
        await user.save();
      }

      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: user,
      });
    } catch (error) {
      console.error("Image Upload Error:", error.message);
      return res.status(400).json({ message: error.message, success: false });
    }
  } catch (error) {
    console.error("Update Profile Image API Error:", error.message);
    return res.status(500).json({
      message: "Failed to update profile image",
      success: false,
    });
  }
};
