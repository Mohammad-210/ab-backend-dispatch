const aiService = require("../services/aiService");
const uploadService = require("../services/uploadService");

const processFileWithAI = async (req, res) => {
   try {
      const { fileId } = req.params;

      console.log(`🧠 Processing file ${fileId} with AI...`);

      // Get file metadata to check content type
      const { metadata, filePath } = uploadService.getFileById(fileId);

      // Check if PDF is text-based or image-based (only for PDFs)
      let results = null;
      if (metadata.contentType === "application/pdf") {
         results = await uploadService.checkPdfType(filePath);
         console.log("Here are the uploaded doc results", results);
      }

      // Process with AI based on content type
      const result = await aiService.processContent(fileId, metadata.contentType, results);

      console.log("✅ AI processing completed successfully");
      res.json({
         success: true,
         fileId,
         contentType: metadata.contentType,
         pdfType: result.pdfType,
         result: result.aiResult,
      });
   } catch (err) {
      console.error("❌ AI processing error:", err.message);
      res.status(500).json({
         error: "Failed to process file with AI",
         details: err.message,
      });
   }
};

module.exports = {
   processFileWithAI,
};
