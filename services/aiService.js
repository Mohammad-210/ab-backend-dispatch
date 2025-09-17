const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

// NOTE: `pdf-poppler` can perform platform checks and may throw on require
// in environments where native dependencies are missing. Lazy-require it
// inside the function that needs it so the app can start even if the
// system binary / native bindings are not present. When used, we surface
// a clear error explaining how to fix the environment.

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const processContent = async (fileId, contentType, results) => {
   try {
      console.log(`🧠 Processing ${contentType} with AI...`);

      let extractedContent = "";
      let finalResult = {};

      if (contentType === "application/pdf") {
         if (results === "text") {
            // Extract text from PDF
            extractedContent = await extractTextFromPDF(fileId);

            // Generate prompt for text-based PDF
            const prompt = generateTextPrompt(extractedContent);

            console.log("🤖 Sending text content to OpenAI...");
            const completion = await openai.chat.completions.create({
               model: "gpt-4o",
               messages: [{ role: "user", content: prompt }],
               temperature: 0,
            });

            finalResult = {
               success: true,
               contentType,
               pdfType: "text",
               extractedContentLength: extractedContent.length,
               aiResult: completion.choices[0].message.content,
            };
         } else if (results === "image") {
            // Convert PDF pages to base64 images
            const base64Images = await convertPDFToBase64Images(fileId);

            // Generate prompt for image-based PDF
            const prompt = generateImagePrompt();

            console.log("🤖 Sending image content to OpenAI...");
            const completion = await openai.chat.completions.create({
               model: "gpt-4o",
               messages: [
                  { role: "user", content: prompt },
                  {
                     role: "user",
                     content: base64Images.map((img, index) => ({
                        type: "image_url",
                        image_url: {
                           url: `data:image/png;base64,${img}`,
                           detail: "high",
                        },
                     })),
                  },
               ],
               max_tokens: 1000,
            });

            finalResult = {
               success: true,
               contentType,
               pdfType: "image",
               pageCount: base64Images.length,
               aiResult: completion.choices[0].message.content,
            };
         }
      } else if (contentType.startsWith("text/")) {
         // Handle text files
         extractedContent = await extractTextFromFile(fileId);

         // Generate prompt for text files
         const prompt = generateTextFilePrompt(extractedContent);

         console.log("🤖 Sending text file content to OpenAI...");
         const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
         });

         finalResult = {
            success: true,
            contentType,
            fileType: "text",
            extractedContentLength: extractedContent.length,
            aiResult: completion.choices[0].message.content,
         };
      }

      console.log("✅ AI processing completed");
      return finalResult;
   } catch (error) {
      console.error("❌ AI processing error:", error.message);
      throw error;
   }
};

const extractTextFromPDF = async (fileId) => {
   try {
      const filePath = path.join("./uploads", `${fileId}.pdf`);
      const dataBuffer = fs.readFileSync(filePath);

      // Try pdf-parse first
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(dataBuffer);

      if (data.text && data.text.trim().length > 50) {
         return data.text.trim();
      }

      // If pdf-parse doesn't work, try pdfjs-dist
      const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.js");
      const pdf = await getDocument({ data: dataBuffer }).promise;
      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
         const page = await pdf.getPage(pageNum);
         const content = await page.getTextContent();
         const pageText = content.items.map((item) => item.str).join(" ");
         fullText += pageText + "\n\n";
      }

      return fullText.trim();
   } catch (error) {
      console.error("❌ Error extracting text from PDF:", error.message);
      throw error;
   }
};

const extractTextFromFile = async (fileId) => {
   try {
      const uploadService = require("./uploadService");
      const { metadata } = uploadService.getFileById(fileId);
      const filePath = metadata.path;

      const text = fs.readFileSync(filePath, "utf8");
      const extractedText = text.trim();

      console.log("📄 Extracted text length:", extractedText.length);
      console.log("🧾 Preview (first 500 chars):", extractedText.slice(0, 500));

      return extractedText;
   } catch (error) {
      console.error("❌ Error extracting text from file:", error.message);
      throw error;
   }
};

// const convertPDFToBase64Images = async (fileId) => {
//    try {
//       const filePath = path.join("./uploads", `${fileId}.pdf`);
//       const outputDir = path.join("./uploads", `${fileId}_images`);

//       // Create output directory
//       if (!fs.existsSync(outputDir)) {
//          fs.mkdirSync(outputDir, { recursive: true });
//       }

//       // Convert PDF to images using pdf-poppler

//       const converter = new PdfConverter(filePath);
//       await converter.convert(outputDir);

//       // Read generated image files and convert to base64
//       const imageFiles = fs
//          .readdirSync(outputDir)
//          .filter((f) => f.endsWith(".png"))
//          .sort((a, b) => {
//             const numA = parseInt(a.match(/\d+/)[0]);
//             const numB = parseInt(b.match(/\d+/)[0]);
//             return numA - numB;
//          });

//       const base64Images = [];

//       for (const file of imageFiles) {
//          const imgPath = path.join(outputDir, file);
//          const imageBuffer = fs.readFileSync(imgPath);
//          const base64 = imageBuffer.toString("base64");
//          base64Images.push(base64);

//          // Clean up individual image file
//          fs.unlinkSync(imgPath);
//       }

//       // Clean up output directory
//       fs.rmdirSync(outputDir);

//       console.log(`📄 Converted ${base64Images.length} pages to base64 images`);
//       return base64Images;
//    } catch (error) {
//       console.error("❌ Error converting PDF to images:", error.message);
//       throw error;
//    }
// };

const convertPDFToBase64Images = async (fileId) => {
   try {
      const filePath = path.join("./uploads", `${fileId}.pdf`);
      const outputDir = path.join("./uploads", `${fileId}_images`);

      // Create output directory
      if (!fs.existsSync(outputDir)) {
         fs.mkdirSync(outputDir, { recursive: true });
      }

      // Convert PDF to images using pdf-poppler
         let pdf;
         try {
            pdf = require("pdf-poppler");
         } catch (e) {
            throw new Error(
               "Missing native dependency 'pdf-poppler' or its system prerequisites. Install poppler-utils (pdftoppm) on the host or use a Docker image that includes it. Original error: " +
                  e.message
            );
         }

         const opts = {
         format: "png",
         out_dir: outputDir,
         out_prefix: "page",
         page: null, // null = all pages
      };

         await pdf.convert(filePath, opts);

      // Read generated image files and convert to base64
      const imageFiles = fs
         .readdirSync(outputDir)
         .filter((f) => f.endsWith(".png"))
         .sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] ?? "0");
            const numB = parseInt(b.match(/\d+/)?.[0] ?? "0");
            return numA - numB;
         });

      const base64Images = [];

      for (const file of imageFiles) {
         const imgPath = path.join(outputDir, file);
         const imageBuffer = fs.readFileSync(imgPath);
         const base64 = imageBuffer.toString("base64");
         base64Images.push(base64);

         // Clean up individual image file
         fs.unlinkSync(imgPath);
      }

      // Clean up output directory
      fs.rmSync(outputDir, { recursive: true, force: true });

      console.log(`📄 Converted ${base64Images.length} pages to base64 images`);
      return base64Images;
   } catch (error) {
      console.error("❌ Error converting PDF to images:", error.message);
      throw error;
   }
};

const generateTextPrompt = (content) => {
   return `
You are a routing assistant. Based on the following transport permit text, extract a route in JSON:

Respond ONLY in this format:
{
  "origin": "Start address or location",
  "destination": "End address or location",
  "waypoints": ["Stop 1", "Stop 2", ...]
}

Text:
"""${content}"""
    `;
};

const generateImagePrompt = () => {
   return `
You are an image analysis assistant. Based on the following PDF pages (converted to images), extract relevant information:

Please analyze each page and provide:
1. Document type and purpose
2. Key information extracted from the pages
3. Any addresses, locations, or routing information
4. Important dates, names, or numbers

Format your response as JSON:
{
  "document_type": "type of document",
  "key_information": ["info1", "info2", ...],
  "addresses": ["address1", "address2", ...],
  "dates": ["date1", "date2", ...],
  "summary": "brief summary of the document content"
}
    `;
};

const generateTextFilePrompt = (content) => {
   return `
You are a text analysis assistant. Based on the following text content, extract key information:

Respond in this format:
{
  "type": "document_type",
  "key_information": ["info1", "info2", ...],
  "summary": "brief summary of the text content"
}

Text content:
"""${content}"""
    `;
};

module.exports = {
   processContent,
};
