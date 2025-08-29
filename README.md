# AB Backend - Modular File Processing API

A modular Node.js backend application that handles file uploads, content extraction, and AI processing for various file types.

## 🏗️ Project Structure

```
ab_backend/
├── controllers/          # Request handlers
│   ├── uploadController.js
│   └── aiController.js
├── services/            # Business logic
│   ├── uploadService.js
│   ├── aiService.js
│   ├── pdfService.js
│   ├── imageService.js
│   └── textService.js
├── routes/              # API routes
│   ├── upload.js
│   └── ai.js
├── middleware/          # Express middleware
│   ├── upload.js
│   └── logger.js
├── uploads/             # File storage
├── server.js           # Main application file
└── package.json
```

## 🚀 Features

-  **Modular Architecture**: Clean separation of concerns with controllers, services, and routes
-  **Multi-format Support**: Handles PDFs, images, and text files
-  **Content Type Detection**: Automatically detects and processes different file types
-  **AI Integration**: OpenAI GPT-4 integration with content-specific prompts
-  **File Storage**: Secure file storage with metadata tracking
-  **OCR Support**: Text extraction from images and scanned PDFs

## 📋 API Endpoints

### 1. File Upload

**POST** `/api/upload`

Upload a file and get content type information.

**Request:**

-  Content-Type: `multipart/form-data`
-  Body: `file` field with the file to upload

**Response:**

```json
{
   "success": true,
   "message": "File uploaded and stored successfully",
   "contentType": "application/pdf",
   "fileName": "uuid-filename.pdf",
   "fileId": "uuid-here"
}
```

### 2. AI Processing

**POST** `/api/ai/:fileId`

Process an uploaded PDF file with AI. The system automatically detects if the PDF is text-based or image-based and processes accordingly.

**Response:**

```json
{
   "success": true,
   "fileId": "uuid-here",
   "contentType": "application/pdf",
   "pdfType": "text|image",
   "result": "AI processed result"
}
```

### 3. Health Check

**GET** `/health`

Check server status.

## 🔧 Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file with your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

3. Start the server:

```bash
npm start
```

## 📁 Supported File Types

-  **PDFs**: Text extraction with fallback to OCR
-  **Images**: OCR text extraction (JPEG, PNG, GIF, BMP, TIFF)
-  **Text Files**: Direct text reading
-  **Office Documents**: Word and Excel files

## 🧠 AI Processing

The system automatically detects PDF content type and processes accordingly:

-  **Text-based PDFs**: Extracts text and uses routing assistant prompt for transport permits
-  **Image-based PDFs**: Converts pages to base64 images and uses image analysis prompt
-  **Text Files**: Direct text analysis and key information extraction

## 🔒 File Storage

-  Files are stored with unique UUIDs
-  Metadata is saved separately for easy retrieval
-  Automatic cleanup of temporary files
-  10MB file size limit

## 🛠️ Development

The modular structure makes it easy to:

-  Add new file type support
-  Modify AI prompts
-  Add new processing services
-  Extend API endpoints
# ab-backend-dispatch
