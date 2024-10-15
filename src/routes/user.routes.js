import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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

export default router;
