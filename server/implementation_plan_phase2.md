# Phase 2: AI Guideline Interpreter Implementation Plan

## Objective
Implement a backend service to extract text from PDF guidelines and convert them into structured JSON rules using a local LLM (Ollama).

## Architecture

### 1. Dependencies
- **pdf-parse**: For extracting raw text from PDF files.
- **multer**: For handling `multipart/form-data` file uploads (already installed).
- **axios**: For communicating with the local Ollama instance.

### 2. Services

#### `backend/services/pdfService.js`
- **Function**: `extractTextFromBuffer(buffer)`
- **Input**: File buffer from Multer.
- **Output**: String (raw text).

#### `backend/services/ollamaService.js`
- **Function**: `analyzeGuidelines(text)`
- **Input**: Raw text string.
- **Process**:
  - Construct a prompt using the defined **System Prompt**.
  - Send POST request to `http://localhost:11434/api/generate` (or `chat`).
  - Model: `llama3` (or user configured model).
  - Format: `json`.
- **Output**: JSON object containing rules.

### 3. API Endpoint

#### `POST /api/analyze-guideline`
- **Middleware**: Multer (configured for PDFs).
- **Flow**:
  1. Receive PDF file.
  2. Call `pdfService.extractTextFromBuffer`.
  3. Call `ollamaService.analyzeGuidelines`.
  4. Return JSON response to frontend.

## Data Structures

### JSON Response Schema
```json
{
  "retailer_name": "String or null",
  "ad_formats": [
    {
      "type": "String",
      "width_px": Integer,
      "height_px": Integer,
      "aspect_ratio": "String"
    }
  ],
  "constraints": {
    "safe_zone_margin_px": Integer,
    "max_file_size_kb": Integer,
    "allowed_file_types": ["String"],
    "forbidden_content": ["String"]
  }
}
```
