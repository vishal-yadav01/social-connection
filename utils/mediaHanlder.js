const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;

const mediaUploader = async (file, folder) => {
  try {
    if (!file?.tempFilePath || !folder)
      throw new Error("Image or folder name missing");

    const options = { folder, resource_type: "auto" }; // Default is 'image', change if needed
    const res = await cloudinary.uploader.upload(file.tempFilePath, options);

    await fs.unlink(file.tempFilePath); // Delete temp file after upload
    return res;
  } catch (error) {
    console.error("Error in mediaUploader:", error.message);
    throw new Error("mediaUploader function failed");
  }
};

module.exports = mediaUploader;
