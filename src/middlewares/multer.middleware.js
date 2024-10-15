import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Define the static path directly (update this to your actual path)
const uploadPath = path.join('C:/Users/Rockm/OneDrive/Desktop/Backend/public/temp');

// Ensure the directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Define the multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // Use the pre-defined static path
  },
  filename: function (req, file, cb) {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Set up multer with the storage configuration
export const upload = multer({ storage });
