const fs = require("fs");
const path = require("path");
const uploadService = require("./uploadService");

const extractTextFromFile = async (fileId) => {
   try {
      console.log("📝 Extracting text from file...");

      // Get file metadata and path
      const fileMetadata = uploadService.getFileById(fileId);
      const filePath = fileMetadata.path;

      // Check if file exists
      if (!fs.existsSync(filePath)) {
         throw new Error("Text file not found");
      }

      // Read the text file
      const text = fs.readFileSync(filePath, "utf8");
      const extractedText = text.trim();

      console.log("📄 Extracted text length:", extractedText.length);
      console.log("🧾 Preview (first 500 chars):", extractedText.slice(0, 500));

      if (!extractedText || extractedText.length < 10) {
         throw new Error("Could not extract meaningful text from file");
      }

      return extractedText;
   } catch (error) {
      console.error("❌ Text extraction error:", error.message);
      throw error;
   }
};

module.exports = {
   extractTextFromFile,
};
