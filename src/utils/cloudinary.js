import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });

    // Remove the local file after successful upload
    fs.unlinkSync(localFilePath);

    // Return the response from Cloudinary
    return response;

  } catch (error) {
    // Handle the error and log it
    console.error("Cloudinary upload error:", error);

    // Remove the local file in case of an error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    // Return null or handle the error accordingly
    return null;
  }
};

export { uploadOnCloudinary };
