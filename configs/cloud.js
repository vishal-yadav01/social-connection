const cloudinary = require("cloudinary").v2;

const cloudConnection = () => {
  try {
    const { CLOUD_API_KEY, CLOUD_API_SECRET, CLOUD_NAME } = process.env;

    if (!CLOUD_API_KEY || !CLOUD_API_SECRET || !CLOUD_NAME) {
      throw new Error("❌ Cloudinary configuration variables are missing.");
    }

    cloudinary.config({
      cloud_name: CLOUD_NAME,
      api_key: CLOUD_API_KEY,
      api_secret: CLOUD_API_SECRET,
    });

    console.log("✅ Cloudinary connected successfully.");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = cloudConnection;
