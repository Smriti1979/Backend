import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // Check if token is available
        if (!token) {
            throw new ApiError(401, "Unauthorized");
        }

        // Verify token using the secret
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the user by the decoded token's user ID
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        // If user does not exist, throw an error
        if (!user) {
            throw new ApiError(401, "Invalid Access token");
        }

        // Attach user to the request object
        req.user = user;
        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        // If there's an error, throw a custom ApiError
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
