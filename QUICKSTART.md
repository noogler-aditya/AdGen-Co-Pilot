# Quick Start Guide - AdGen Co-Pilot

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites Check
```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

### 2. Clone & Install
```bash
# Clone the repository
git clone <your-repo-url>
cd AdGen

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Set Up Environment Variables

**Server** - Create `/server/.env`:
```env
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
```

**Client** - Create `/client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Install Ollama (for AI features)
```bash
# macOS
brew install ollama

# Start Ollama
ollama serve

# Pull the model (in a new terminal)
ollama pull llama3.2:1b
```

### 5. Start Development Servers

**Terminal 1** - Backend:
```bash
cd server
npm run dev
```

**Terminal 2** - Frontend:
```bash
cd client
npm run dev
```

### 6. Open Application
Visit: **http://localhost:5173**

---

## 📝 Common Tasks

### Run Linter
```bash
cd client
npm run lint
```

### Fix Linting Issues
```bash
cd client
npm run lint:fix
```

### Build for Production
```bash
cd client
npm run build
```

### Preview Production Build
```bash
cd client
npm run preview
```

### Check Server Health
```bash
curl http://localhost:5000/api/health
```

---

## 🎨 Using the Application

### Keyboard Shortcuts
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Shift + Z**: Redo
- **Ctrl/Cmd + S**: Save Project
- **Ctrl/Cmd + C**: Copy Element
- **Ctrl/Cmd + V**: Paste Element
- **Ctrl/Cmd + X**: Cut Element
- **Delete/Backspace**: Remove Element
- **Shift + Click**: Multi-select

### Basic Workflow
1. Upload PDF guidelines (AI analysis)
2. Upload product images
3. Add text elements
4. Customize colors and styles
5. Apply templates (optional)
6. Export as JPEG/PNG/WebP

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port in .env
PORT=5001
```

### Cloudinary Issues
- Double-check credentials in `.env`
- Verify account is active
- Check upload preset settings

### Ollama Not Working
```bash
# Check if Ollama is running
ollama list

# Restart Ollama
ollama serve

# Verify model
ollama pull llama3.2:1b
```

### Build Errors
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist .vite
```

---

## 📚 Documentation

- **Full Documentation**: `README.md`
- **Deployment Guide**: `DEPLOYMENT.md`
- **Production Summary**: `PRODUCTION_SUMMARY.md`

---

## 🆘 Need Help?

1. Check the documentation files above
2. Review error messages in browser console
3. Check server logs in terminal
4. Verify all environment variables are set
5. Ensure all dependencies are installed

---

**Happy Designing! 🎨**
