const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(require("./middleware/logger"));

// Routes
app.use("/api/upload", require("./routes/upload"));
app.use("/api/ai", require("./routes/ai"));

// Friendly root/info route so GET / doesn't 404 on deployments
app.get("/", (req, res) => {
   res.json({
      status: "OK",
      message: "ab-backend-dispatch API",
      endpoints: {
         upload: "/api/upload (POST multipart/form-data, field: file)",
         ai: "/api/ai/:fileId (POST) - process uploaded file with AI",
      },
   });
});

// Convenience aliases (so callers can POST to /upload or /ai)
app.use("/upload", require("./routes/upload"));
app.use("/ai", require("./routes/ai"));

// Health check route
app.get("/health", (req, res) => {
   res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
   console.error("❌ Server error:", err.message);
   res.status(500).json({
      error: "Internal server error",
      details: err.message,
   });
});

// 404 handler
app.use("*", (req, res) => {
   res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
   console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
   console.log(`📁 Upload endpoint: http://0.0.0.0:${PORT}/api/upload`);
   console.log(`🤖 AI endpoint: http://0.0.0.0:${PORT}/api/ai/:fileId`);
});
