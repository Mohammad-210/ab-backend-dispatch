# API Documentation - Modular File Processing System

## Overview

This modular backend system handles file uploads, content detection, and AI processing with different prompts based on content type. The system automatically detects whether PDFs are text-based or image-based and processes them accordingly.

## 🏗️ Architecture

### Directory Structure

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
└── server.js           # Main application
```

## 📋 API Endpoints

### 1. File Upload

**POST** `/api/upload`

Upload a file and get content type information.

**Request:**

-  Content-Type: `multipart/form-data`
-  Body: `file` field with the file to upload

**Supported File Types:**

-  PDFs (`.pdf`)
-  Images (`.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff`)
-  Text Files (`.txt`)
-  Office Documents (`.doc`, `.docx`, `.xls`, `.xlsx`)

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

Process an uploaded file with AI based on its content type.

**URL Parameters:**

-  `fileId`: The unique ID of the uploaded file

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

**Response:**

```json
{
   "status": "OK",
   "message": "Server is running"
}
```

## 🧠 AI Processing Logic

### PDF Processing

#### Text-based PDFs

1. **Detection**: System checks if PDF contains extractable text (>50 characters)
2. **Processing**: Extracts text using pdf-parse and pdfjs-dist
3. **AI Prompt**: Routing assistant prompt for transport permits
4. **Response Format**: JSON with origin, destination, and waypoints

**Example Response:**

```json
{
  "origin": "US-61 LA Line",
  "destination": "US-98 AL Line",
  "waypoints": ["US-61", "MS-24", "US-98", ...]
}
```

#### Image-based PDFs

1. **Detection**: System detects insufficient text content
2. **Processing**: Converts PDF pages to base64 images using pdf-poppler
3. **AI Prompt**: Image analysis assistant prompt
4. **Response Format**: JSON with document analysis results

**Example Response:**

```json
{
  "document_type": "transport_permit",
  "key_information": ["info1", "info2", ...],
  "addresses": ["address1", "address2", ...],
  "dates": ["date1", "date2", ...],
  "summary": "brief summary"
}
```

### Text File Processing

1. **Processing**: Direct text extraction
2. **AI Prompt**: Text analysis assistant prompt
3. **Response Format**: JSON with document analysis

**Example Response:**

```json
{
  "type": "test_document",
  "key_information": ["test text file", "upload functionality", ...],
  "summary": "brief summary"
}
```

## 🔧 Technical Details

### File Storage

-  Files stored with unique UUIDs
-  Metadata stored separately as JSON
-  Automatic cleanup of temporary files
-  10MB file size limit

### Content Detection

-  PDF text extraction using multiple methods
-  Fallback to OCR for image-based PDFs
-  Automatic content type detection

### AI Models

-  **GPT-4o-mini**: For text processing
-  **GPT-4o**: For image processing with vision capabilities

## 🚀 Usage Examples

### Upload a PDF File

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@document.pdf"
```

### Process with AI

```bash
curl -X POST http://localhost:5000/api/ai/{fileId}
```

### Health Check

```bash
curl http://localhost:5000/health
```

## 🔒 Error Handling

The system provides detailed error messages for:

-  Invalid file types
-  File size limits
-  Processing failures
-  AI processing errors

**Example Error Response:**

```json
{
   "error": "Failed to process file with AI",
   "details": "specific error message"
}
```

## 🛠️ Development

The modular structure allows for:

-  Easy addition of new file types
-  Modification of AI prompts
-  Extension of processing services
-  Independent testing of components
