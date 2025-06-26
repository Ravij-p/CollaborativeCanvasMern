// backend/middleware/upload.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "collab-canvas/pdfs",
    resource_type: "raw", // use 'auto' if you want to support images/pdfs
    allowed_formats: ["pdf"],
  },
});

module.exports = multer({ storage });
