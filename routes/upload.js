const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const upload = require("../middleware/upload");

// Upload route - stores file and returns content type
router.post("/", upload.single("file"), uploadController.uploadFile);

module.exports = router;
