import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async(userId)=>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refresToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    }
    catch(error){
        console.error("Error during token generation:", error);
    }
}

const registerUser = async (req, res) => {
  try {
    // Destructure user data from the request body
    const { fullName, username, email, password } = req.body;

    // Validate required fields
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the user already exists
    const existedUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existedUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Check if avatar and cover image files are present
    if (!req.files || !req.files.avatar || !req.files.coverImages) {
      return res.status(400).json({ error: "Both avatar and cover images are required" });
    }

    const avatarFile = req.files.avatar[0].path;
    const coverImageFile = req.files.coverImages[0].path;

    // Upload avatar to Cloudinary
    const avatarUploadResult = await uploadOnCloudinary(avatarFile);
    if (!avatarUploadResult) {
      return res.status(500).json({ message: "Avatar upload failed" });
    }

    // Upload cover image to Cloudinary
    const coverImageUploadResult = await uploadOnCloudinary(coverImageFile);
    if (!coverImageUploadResult) {
      return res.status(500).json({ message: "Cover image upload failed" });
    }

    // Create new user
    const user = new User({
      fullName,
      username: username.toLowerCase(),
      email,
      password, // Will be hashed automatically due to pre-save hook
      avatar: avatarUploadResult.secure_url,
      coverImage: coverImageUploadResult.secure_url,
    });

    await user.save();

    // Remove sensitive fields (password, refreshToken) from the response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
      return res.status(500).json({ error: "User registration failed" });
    }

    // Generate JWT tokens (access and refresh tokens)
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Return response with user data and Cloudinary URLs
    return res.status(201).json({
      message: "User registered successfully",
      user: createdUser,
      accessToken,
      refreshToken,
      avatarUrl: avatarUploadResult.secure_url,
      coverImageUrl: coverImageUploadResult.secure_url,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
      return res.status(400).json({ error: "Username or email is required" });
  }

  // Find user by username or email
  const user = await User.findOne({
      $or: [{ username }, { email }]
  });

  if (!user) {
      return res.status(404).json({ error: "User does not exist" });
  }

  // Check if password is valid
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
  }

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  // Find the user by ID, excluding password and refreshToken fields
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // Cookie options
  const options = {
      httpOnly: true, // Ensures the cookie is only accessible by the web server
      secure: process.env.NODE_ENV === 'production', // Cookie sent only over HTTPS in production
      sameSite: 'Strict', // Prevents CSRF attacks by ensuring the cookie is sent only for requests to the same site
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiration for cookies
  };

  // Send response with cookies and user data
  return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
          message: "User logged in successfully",
          user: loggedInUser,  // Return the user without password or refresh token fields
          accessToken,
          refreshToken
      });
};

const logoutUser = async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id, {
            $set :{
                rereshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpsOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged Out") )
}

const refreshAccessToken = asyncHandler(async(req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
      throw new ApiError(400, "No refresh token provided");
  }

  try {
      const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
      );

      const user = await User.findById(decodedToken?._id);

      if (!user) {
          throw new ApiError(400, "Invalid refresh token");
      }

      if (incomingRefreshToken !== user?.refreshToken) {  
          throw new ApiError(400, "Refresh token is expired or used");
      }

      const options = {
          httpOnly: true,
          secure: true,
      };

      
      const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

      return res
          .status(200)
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", newRefreshToken, options)
          .json(
              new ApiResponse(
                  200,
                  { accessToken, refreshToken: newRefreshToken },
                  "Access token refreshed successfully"
              )
          );
  } catch (error) {
      throw new ApiError(400, "Invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };