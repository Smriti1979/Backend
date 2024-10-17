import { Router } from "express";
import { registerUser,loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Error handling middleware
router.route("/register").post(
  (req, res, next) => {
    upload.fields([
      { name: "avatar", maxCount: 1 },
      { name: "coverImages", maxCount: 1 }
    ])(req, res, function (err) {
      if (err) {
        // Handle file upload error
        return res.status(400).json({ error: "File upload failed", details: err });
      }
      next();
    });
  },
  registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshToken);

export default router;
