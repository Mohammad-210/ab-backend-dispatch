const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const { v4: uuidv4 } = require("uuid");

const uploadPath = "./uploads";

// Ensure upload directory exists
if (!fs.existsSync(uploadPath)) {
   fs.mkdirSync(uploadPath, { recursive: true });
}

async function checkPdfType(filePath) {
   try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);

      if (data.text.trim().length > 50) {
         console.log("✅ This PDF contains extractable text.");
         return "text";
      }

      console.log("⚠️ No significant text found. Might be image-based.");
      return "image";
   } catch (error) {
      console.error("❌ Error checking PDF type:", error.message);
      throw error;
   }
}

const processUpload = async (file) => {
   try {
      // Generate unique file ID
      const fileId = uuidv4();

      // Determine content type based on file extension
      const contentType = getContentType(file.originalname);

      // Create a new filename with the unique ID
      const fileExtension = path.extname(file.originalname);
      const newFileName = `${fileId}${fileExtension}`;
      const newFilePath = path.join(uploadPath, newFileName);

      // Move the uploaded file to the new location
      fs.renameSync(file.path, newFilePath);

      // Store file metadata (optional - for future reference)
      const fileMetadata = {
         id: fileId,
         originalName: file.originalname,
         contentType: contentType,
         size: file.size,
         uploadDate: new Date().toISOString(),
         path: newFilePath,
      };

      // Save metadata to a JSON file (optional)
      const metadataPath = path.join(uploadPath, `${fileId}_metadata.json`);
      fs.writeFileSync(metadataPath, JSON.stringify(fileMetadata, null, 2));

      return {
         fileId,
         fileName: newFileName,
         contentType,
         originalName: file.originalname,
         size: file.size,
      };
   } catch (error) {
      // Clean up the uploaded file if processing fails
      if (file.path && fs.existsSync(file.path)) {
         fs.unlinkSync(file.path);
      }
      throw error;
   }
};

const getContentType = (filename) => {
   const ext = path.extname(filename).toLowerCase();

   const contentTypeMap = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".bmp": "image/bmp",
      ".tiff": "image/tiff",
      ".txt": "text/plain",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
   };

   return contentTypeMap[ext] || "application/octet-stream";
};

const getFileById = (fileId) => {
   const metadataPath = path.join(uploadPath, `${fileId}_metadata.json`);

   if (!fs.existsSync(metadataPath)) {
      throw new Error("File not found");
   }

   const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
   const filePath = metadata.path;

   return { metadata, filePath };
};

module.exports = {
   processUpload,
   getContentType,
   getFileById,
   checkPdfType,
};
