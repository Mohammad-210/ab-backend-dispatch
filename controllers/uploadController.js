const uploadService = require("../services/uploadService");

const uploadFile = async (req, res) => {
   try {
      if (!req.file) {
         console.error("❌ Upload error: missing file field");
         return res.status(400).json({
            error: "Bad Request",
            details: "No file received. Send multipart/form-data with field name 'file'.",
         });
      }

      console.log(" File received:", req.file.originalname);

      // Store the file and get content type
      const result = await uploadService.processUpload(req.file);

      console.log("✅ File processed successfully");
      res.json({
         success: true,
         message: "File uploaded and stored successfully",
         contentType: result.contentType,
         fileName: result.fileName,
         fileId: result.fileId,
      });
   } catch (err) {
      console.error("❌ Upload error:", err.message);
      res.status(500).json({
         error: "Failed to process upload",
         details: err.message,
      });
   }
};

module.exports = {
   uploadFile,
};
