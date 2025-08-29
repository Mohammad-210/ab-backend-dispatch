const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, "./uploads");
   },
   filename: function (req, file, cb) {
      // Generate a temporary filename - will be renamed in the service
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "temp-" + uniqueSuffix + path.extname(file.originalname));
   },
});

// File filter to accept various file types
const fileFilter = (req, file, cb) => {
   const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/tiff",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
   ];

   if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
   } else {
      cb(new Error("Invalid file type. Only PDF, images, and text files are allowed."), false);
   }
};

const upload = multer({
   storage: storage,
   fileFilter: fileFilter,
   limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
   },
});

module.exports = upload;
