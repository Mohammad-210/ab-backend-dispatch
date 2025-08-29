const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

// AI processing route - processes uploaded file with AI
router.post("/:fileId", aiController.processFileWithAI);

module.exports = router;
