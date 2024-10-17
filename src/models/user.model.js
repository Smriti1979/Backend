import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  refreshToken: {
    type: String
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  avatar: {
    type: String, // Cloudinary URL
    required: true
  },
  coverImage: {
    type: String // Cloudinary URL
  },
  watchHistory: [{
    type: Schema.Types.ObjectId,
    ref: "Video",
  }],
}, {
  timestamps: true
});

// Pre-save hook to hash the password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare the hashed password with the input password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to generate the access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign({
    _id: this._id,
    email: this.email,
    username: this.username,
    fullName: this.fullName
  },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
};

// Method to generate the refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({
    _id: this._id,
    email: this.email,
    username: this.username,
    fullName: this.fullName
  },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });
};

// Create the User model from the schema
const User = mongoose.model("User", userSchema);

export { User };
