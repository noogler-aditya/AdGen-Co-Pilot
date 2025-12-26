<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Llama_3.2-AI_Powered-FF6F00?style=for-the-badge&logo=meta&logoColor=white" alt="Llama" />
  <img src="https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

<h1 align="center">🚀 AdGen Co-Pilot</h1>

<p align="center">
  <strong>AI-Powered Retail Media Ad Designer with Automated Compliance Enforcement</strong>
</p>

<p align="center">
  Transform retailer PDF guidelines into intelligent design constraints.<br/>
  Create compliant ads in seconds, not hours.
</p>

---

## 🎯 Problem Statement

Retail media advertising requires strict adherence to platform-specific guidelines (Amazon, Walmart, Tesco, etc.). Designers spend **hours manually reading PDFs** and checking compliance, leading to:

- ❌ Delayed campaign launches
- ❌ Rejected ads due to compliance violations
- ❌ Inconsistent brand execution across retailers

## 💡 Our Solution

**AdGen Co-Pilot** is an intelligent design tool that:

1. **Reads** retailer guideline PDFs using **Llama 3.2** AI
2. **Extracts** technical constraints (safe zones, dimensions, text rules)
3. **Enforces** compliance in real-time as you design
4. **Exports** optimized assets that meet exact specifications

---

## ✨ Key Features

### 🤖 AI-Powered PDF Analysis
| Feature | Description |
|---------|-------------|
| **Smart Extraction** | Upload any retailer PDF → AI extracts dimensions, safe zones, file limits |
| **Local AI** | Runs on Llama 3.2 via Ollama (no API costs, data privacy) |
| **Instant Rules** | Guidelines applied to canvas within seconds |

### ✅ Real-Time Compliance Engine
| Feature | Description |
|---------|-------------|
| **Live Validation** | Elements flagged instantly when violating rules |
| **Safe Zone Visualization** | Semi-transparent overlay shows restricted areas |
| **Actionable Errors** | Click violations to jump to problematic elements |

### 🎨 Professional Design Tools
| Feature | Description |
|---------|-------------|
| **Drag & Drop Canvas** | Intuitive Konva.js-powered editor |
| **Background Removal** | One-click via remove.bg API |
| **7 Premium Fonts** | Google Fonts integration |
| **Attention Heatmap** | AI predicts where viewers look |
| **Layer Management** | Full z-index control |

### ⚡ Smart Export
| Feature | Description |
|---------|-------------|
| **Auto-Compression** | Meets file size limits (e.g., 500KB) |
| **Format Switching** | Square, Banner, Skyscraper with smart repositioning |
| **Quality Optimization** | Iterative compression preserves visual quality |

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React 19)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Landing    │  │   Editor    │  │   State (Zustand)   │  │
│  │  Three.js   │  │   Konva.js  │  │   + localStorage    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────┐
│                       SERVER (Express 5)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  PDF Parse  │  │   Sharp     │  │   Rate Limiting     │  │
│  │  + Ollama   │  │   Export    │  │   + Validation      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   ┌──────────┐       ┌──────────┐       ┌──────────┐
   │  Ollama  │       │Cloudinary│       │remove.bg │
   │(Llama3.2)│       │   CDN    │       │   API    │
   └──────────┘       └──────────┘       └──────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite 7.2 | Build Tool (HMR) |
| Zustand | State Management |
| Konva.js | Canvas Rendering |
| Three.js | 3D Backgrounds |
| Framer Motion | Animations |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 18+ | Runtime |
| Express 5 | Web Framework |
| Ollama | Local AI (Llama 3.2) |
| Sharp | Image Processing |
| Cloudinary | Image CDN |
| pdf-parse | PDF Extraction |

---

## 🚀 Quick Start

### Prerequisites
```bash
node >= 18.x
npm >= 9.x
ollama installed locally
```

### Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/adgen-copilot.git
cd adgen-copilot

# 2. Install dependencies
cd client && npm install
cd ../server && npm install

# 3. Configure environment
# Client: client/.env
VITE_API_URL=http://localhost:5001

# Server: server/.env
PORT=5001
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# 4. Start Ollama
ollama serve
ollama pull llama3.2

# 5. Run application
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev
```

Visit **http://localhost:5173**

---

## 📊 Key Metrics

| Metric | Value |
|--------|-------|
| **PDF → Rules** | ~10 seconds (Llama 3.2) |
| **Compliance Check** | < 50ms (real-time) |
| **Image Compression** | 90%+ size reduction |
| **Undo History** | 50 states |
| **Bundle Size** | 1.6MB (gzipped: 487KB) |

---

## 🔐 Security

| Feature | Implementation |
|---------|----------------|
| **Rate Limiting** | 100 req/15min global, stricter for AI |
| **Input Validation** | File type, size, content verification |
| **Local AI** | No data sent to external LLM APIs |
| **Env Secrets** | All keys in .env (gitignored) |

---

## 📁 Project Structure

```
AdGen/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # 9 component modules
│   │   ├── pages/             # Landing page
│   │   ├── services/          # API client
│   │   ├── store/             # Zustand state
│   │   └── index.css          # Design system
│   ├── SUMMARY.md             # Client documentation
│   └── package.json
│
├── server/                    # Node.js Backend
│   ├── services/
│   │   ├── ollamaService.js   # AI integration
│   │   ├── pdfService.js      # PDF parsing
│   │   └── exportService.js   # Image optimization
│   ├── index.js               # Express server
│   ├── SUMMARY.md             # Server documentation
│   └── package.json
│
└── README.md                  # This file
```

---

## 🎬 Demo Workflow

1. **Land** → Premium Three.js animated landing page
2. **Launch** → "Warp speed" transition to editor
3. **Upload PDF** → AI extracts retailer guidelines
4. **Design** → Add text/images with live compliance
5. **Export** → Auto-compressed to exact specs

---

## 🏆 Differentiators

| Feature | AdGen Co-Pilot | Traditional Tools |
|---------|----------------|-------------------|
| PDF to Rules | ✅ AI-Powered | ❌ Manual |
| Compliance | ✅ Real-time | ❌ Post-design |
| Safe Zones | ✅ Visual Overlay | ❌ Guesswork |
| File Size | ✅ Auto-compress | ❌ Trial & Error |
| Cost | ✅ Local AI (Free) | ❌ API Fees |

---

## 📈 Future Roadmap

- [ ] Multi-language PDF support
- [ ] Template marketplace
- [ ] Team collaboration
- [ ] Figma plugin integration
- [ ] Batch export for campaigns

---

## 👥 Team

**Built for retail marketers by developers who understand the pain.**

---

## 📄 License

MIT License - See LICENSE file for details.

---

<p align="center">
  <strong>AdGen Co-Pilot</strong> - Design Smarter. Launch Faster. Stay Compliant.
</p>
