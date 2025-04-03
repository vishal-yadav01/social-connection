const express = require("express");
const router = express.Router();
const {
  profile,
  editProfile,
  updateProfileImage,
} = require("../controllers/profile.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.get("/view", authMiddleware, profile);
router.patch("/edit", authMiddleware, editProfile);
router.patch("/update-img", authMiddleware, updateProfileImage);
exports.profileRoute = router;
