# AdGen Co-Pilot 

**AI-Powered Retail Media Ad Designer with Automated Compliance**

AdGen Co-Pilot is an intelligent design tool that helps marketers create retail media advertisements that automatically comply with platform-specific guidelines. Upload a PDF guideline, and our AI extracts the rules—safe zones, dimensions, file size limits—and enforces them in real-time.

---

## 🌟 Key Features

### 🤖 **AI PDF Guideline Parser**
- Upload retailer guideline PDFs (Tesco, Amazon, etc.)
- **Llama 3.2** locally extracts technical constraints
- Auto-applies safe zones, dimensions, and compliance rules

### 🎨 **Professional Design Tools**
- **Drag & Drop Canvas** with live preview
- **Auto Background Removal** (remove.bg API integration)
- **Google Fonts** integration (7 premium fonts)
- **Attention Heatmap** - AI predicts visual focus areas
- **Multi-select & Layer Control** with z-index management

### ⚡ **Smart Export**
- **Auto-compression** to meet retailer file size limits (e.g., 500KB)
- **Format switching** with smart element repositioning
- **One-click download** with optimized quality

### 💾 **Project Management**
- **Undo/Redo** with 50-state history
- **Save/Load projects** with localStorage persistence
- **Template Gallery** - 5 professionally designed starter templates

---

## 🏗️ Tech Stack

### **Frontend**
- **React 18** + **Vite** (Lightning-fast HMR)
- **Zustand** - State management with persist middleware
- **Konva.js** - Canvas rendering engine
- **React Hot Toast** - Beautiful notifications
- **Axios** - HTTP client

### **Backend**
- **Node.js** + **Express** - REST API
- **Ollama** - Local AI (Llama 3.2 for PDF analysis)
- **Sharp** - Image processing & optimization
- **pdf-parse** - PDF text extraction
- **Cloudinary** - Image CDN
- **Multer** - File upload handling
- **express-rate-limit** - API rate limiting & security

---

## 📦 Installation

### Prerequisites
```bash
node >= 18.x
npm >= 9.x
ollama installed (for AI features)
```

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/adgen-copilot.git
cd adgen-copilot
```

### 2. Install Dependencies
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Configure Environment Variables

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5001
VITE_REMOVE_BG_API_KEY=your_remove_bg_api_key
```

**Server** (`server/.env`):
```env
PORT=5001
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Start Ollama (Required for PDF Analysis)
```bash
ollama serve
ollama pull llama3.2
```

### 5. Run the Application
```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev
```

Visit **http://localhost:5173**

---

## 🎯 Usage Guide

### Basic Workflow
1. **Upload PDF Guideline** → AI extracts rules
2. **Add Text/Images** → Drag & drop onto canvas
3. **Design with constraints** → Safe zones auto-enforced
4. **Export** → Auto-optimized to retailer specs

### Advanced Features
- **Ctrl+Z / Ctrl+Y** - Undo/Redo
- **Shift+Click** - Multi-select elements
- **Right-Click** - Context menu (duplicate, layer control)
- **Ctrl+S** - Save project
- **Templates** - Quick start with pre-designed layouts

---

## 🔒 Security

### API Rate Limiting

All API endpoints are protected with rate limiting to prevent abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| Global (all routes) | 100 requests | 15 minutes |
| `/api/upload` | 20 requests | 15 minutes |
| `/api/analyze-guideline` | 10 requests | 15 minutes |
| `/api/export` | 30 requests | 15 minutes |

Rate limit headers are included in all responses:
- `RateLimit-Limit` - Maximum requests allowed
- `RateLimit-Remaining` - Remaining requests in current window
- `RateLimit-Reset` - Time when the rate limit resets

---

## 📁 Project Structure

```
AdGen/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Canvas/     # Design canvas (Konva.js)
│   │   │   ├── Sidebar/    # Tools & properties panel
│   │   │   ├── LayerPanel/ # Z-index control
│   │   │   ├── TemplateGallery/
│   │   │   └── ContextMenu/
│   │   ├── services/       # API & image processing
│   │   ├── store/          # Zustand state management
│   │   └── index.css       # Global styles
│   └── package.json
│
└── server/                 # Node.js Backend
    ├── services/
    │   ├── ollamaService.js   # AI guideline parser
    │   ├── pdfService.js      # PDF text extraction
    │   └── exportService.js   # Image optimization
    ├── index.js            # Express server
    └── package.json
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy dist/ folder to Vercel
```

### Backend (Railway / Render)
```bash
cd server
# Deploy via Git or Docker
```

**Note:** For production, run Ollama on a dedicated server or use OpenAI API as fallback.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments

- **Llama 3.2** by Meta AI
- **remove.bg** for background removal
- **Cloudinary** for image CDN
- **React** & **Vite** communities

---

## 📧 Contact

**Developer:** Your Name  
**Email:** your.email@example.com  
**Project Link:** [GitHub Repository](https://github.com/yourusername/adgen-copilot)

---

**Built for retail marketers**
