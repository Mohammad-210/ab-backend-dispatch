const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { createWorker } = require("tesseract.js");
const { PdfConverter } = require("pdf-poppler");
const uploadService = require("./uploadService");

/**
 * Step 1 - Try text extraction via pdfjs-dist
 */
async function extractTextWithPdfjs(buffer) {
   console.log("🔍 Trying pdfjs-dist to extract text...");
   try {
      const pdfjsLib = await import("pdfjs-dist/build/pdf.js");
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
         const page = await pdf.getPage(i);
         const content = await page.getTextContent();
         const strings = content.items.map((item) => item.str);
         text += strings.join(" ") + "\n";
      }
      return text.trim();
   } catch (e) {
      console.warn("⚠️ pdfjs-dist failed:", e.message);
      return "";
   }
}

/**
 * Step 2 - Try pdf-parse
 */
async function extractTextWithPdfParse(buffer) {
   console.log("🛠️ Trying pdf-parse...");
   try {
      const parsed = await pdfParse(buffer);
      return parsed.text?.trim() || "";
   } catch (e) {
      console.warn("⚠️ pdf-parse failed:", e.message);
      return "";
   }
}

/**
 * Step 3 - Convert PDF to image and use OCR
 */
async function extractTextWithOCR(filePath) {
   console.log("🖼️ Converting PDF to images for OCR...");
   const outputDir = `${filePath}_images`;
   fs.mkdirSync(outputDir, { recursive: true });

   const converter = new PdfConverter(filePath);
   await converter.convert(outputDir);

   const imageFiles = fs.readdirSync(outputDir).filter((f) => f.endsWith(".png"));
   if (imageFiles.length === 0) throw new Error("No images created from PDF");

   const worker = await createWorker(["eng"]);
   let finalText = "";

   for (const file of imageFiles) {
      const imgPath = path.join(outputDir, file);
      console.log(`🔍 OCR on image: ${file}`);
      const {
         data: { text },
      } = await worker.recognize(imgPath);
      finalText += text + "\n";
      fs.unlinkSync(imgPath);
   }

   await worker.terminate();
   fs.rmdirSync(outputDir);
   return finalText.trim();
}

const extractTextFromPDF = async (fileId) => {
   try {
      console.log("📄 Extracting text from PDF...");

      // Get file metadata and path
      const fileMetadata = uploadService.getFileById(fileId);
      const filePath = fileMetadata.path;
      const buffer = fs.readFileSync(filePath);

      // Step 1: Try pdfjs-dist
      let text = await extractTextWithPdfjs(buffer);

      // Step 2: Try pdf-parse if empty
      if (!text || text.length < 50) {
         text = await extractTextWithPdfParse(buffer);
      }

      // Step 3: Use OCR if still empty
      if (!text || text.length < 50) {
         text = await extractTextWithOCR(filePath);
      }

      console.log("📄 Final extracted text length:", text.length);
      console.log("🧾 Preview (first 1000 chars):", text.slice(0, 1000));

      if (!text || text.length < 50) {
         throw new Error("Could not extract meaningful text from PDF");
      }

      return text;
   } catch (error) {
      console.error("❌ PDF extraction error:", error.message);
      throw error;
   }
};

module.exports = {
   extractTextFromPDF,
};
