Postman / cURL examples to test deployed API

Base URL (example): https://ab-backend-dispatch-1.onrender.com

1) Health check
GET /health

cURL:

```bash
curl -i https://ab-backend-dispatch-1.onrender.com/health
```

2) Upload a file (multipart/form-data)

POST /api/upload
Body: form-data
Key: `file` (type: File) -> choose your local PDF/image/text file

cURL:

```bash
curl -v -F "file=@/full/path/to/sample.pdf" https://ab-backend-dispatch-1.onrender.com/api/upload
```

Expected JSON response contains `fileId` which you will use next.

3) Trigger AI processing

POST /api/ai/:fileId
No body required. Replace `:fileId` with the value returned from the upload response.

cURL:

```bash
curl -v -X POST https://ab-backend-dispatch-1.onrender.com/api/ai/<fileId>
```

Notes and troubleshooting
- If you receive 404 at `/`, use `/health` or `/api/upload` for tests (server now returns helpful JSON at `/`).
- If you receive 500 errors mentioning `pdf-poppler` or "Missing native dependency 'pdf-poppler'", the Render host needs `poppler-utils` (e.g., `pdftoppm`). Deploy with a Dockerfile that installs `poppler-utils` or avoid PDF->image conversion paths.
- Check Render service logs for startup errors if routes appear missing.
