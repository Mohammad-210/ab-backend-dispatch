const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON bodies
app.use(require("./middleware/logger"));

// Routes
// Main API mounts
app.use("/api/upload", require("./routes/upload"));
app.use("/api/ai", require("./routes/ai"));

// Short aliases so base paths work for simple checks
app.use("/upload", require("./routes/upload"));
app.use("/ai", require("./routes/ai"));

// Root - quick info for manual checks
app.get("/", (req, res) => {
   res.json({
      status: "OK",
      message: "ab-backend-dispatch API",
      endpoints: {
         health: "/health",
         upload: "/api/upload (POST multipart form-data key `file`)",
         ai: "/api/ai/:fileId (POST)",
      },
   });
});

// Health check route
app.get("/health", (req, res) => {
   res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
   console.error("❌ Server error:", err && err.message ? err.message : err);

   // Multer file size limit
   if (err && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Bad Request", details: "File too large" });
   }

   // Busboy "Field name missing" error (happens when form-data is malformed)
   if (err && /Field name missing/i.test(err.message || "")) {
      return res.status(400).json({ error: "Bad Request", details: "Field name missing in multipart/form-data" });
   }

   // Multer invalid field name or other known client errors
   if (err && (err instanceof Error) && (err.message.includes("Invalid file type") || err.message.includes("No file received"))) {
      return res.status(400).json({ error: "Bad Request", details: err.message });
   }

   res.status(500).json({
      error: "Internal server error",
      details: err && err.message ? err.message : String(err),
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
