const fs = require("fs");
const path = require("path");
const { createWorker } = require("tesseract.js");
const uploadService = require("./uploadService");

const extractTextFromImage = async (fileId) => {
   try {
      console.log("🖼️ Extracting text from image...");

      // Get file metadata and path
      const fileMetadata = uploadService.getFileById(fileId);
      const filePath = fileMetadata.path;

      // Check if file exists
      if (!fs.existsSync(filePath)) {
         throw new Error("Image file not found");
      }

      // Use Tesseract.js for OCR
      const worker = await createWorker(["eng"]);
      console.log(`🔍 Performing OCR on image: ${fileMetadata.originalName}`);

      const {
         data: { text },
      } = await worker.recognize(filePath);
      await worker.terminate();

      const extractedText = text.trim();
      console.log("📄 Extracted text length:", extractedText.length);
      console.log("🧾 Preview (first 500 chars):", extractedText.slice(0, 500));

      if (!extractedText || extractedText.length < 10) {
         throw new Error("Could not extract meaningful text from image");
      }

      return extractedText;
   } catch (error) {
      console.error("❌ Image extraction error:", error.message);
      throw error;
   }
};

module.exports = {
   extractTextFromImage,
};
