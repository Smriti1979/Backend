import { v2 as cloudinary } from 'cloudinary'; // Import cloudinary
import fs from 'fs'; // For file system operations

// Configure Cloudinary (if not already done in a separate config file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const registerUser = async (req, res) => {
  try {
    // Check if the avatar file is uploaded
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ error: "Avatar file is required" });
    }

    // Check if coverImages are uploaded (optional)
    if (!req.files.coverImages) {
      return res.status(400).json({ error: "Cover image is required" });
    }

    const avatarFile = req.files.avatar[0];
    const coverImageFile = req.files.coverImages[0];

    // Upload avatar to Cloudinary
    const avatarUploadResult = await cloudinary.uploader.upload(avatarFile.path, {
      folder: 'avatars',
    });

    // Upload cover image to Cloudinary
    const coverImageUploadResult = await cloudinary.uploader.upload(coverImageFile.path, {
      folder: 'coverImages',
    });

    // Remove local files after uploading to Cloudinary
    fs.unlinkSync(avatarFile.path);
    fs.unlinkSync(coverImageFile.path);

    // Return response with Cloudinary URLs
    return res.status(201).json({
      message: "User registered successfully",
      avatarUrl: avatarUploadResult.secure_url,
      coverImageUrl: coverImageUploadResult.secure_url,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
