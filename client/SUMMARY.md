# AdGen Co-Pilot - Client Summary

## 📋 Overview

The client is a **React 19** single-page application built with **Vite** that provides an AI-powered retail media ad designer with real-time compliance enforcement.

---

## 🏗️ Architecture

```
client/
├── src/
│   ├── App.jsx              # Main app router with 3D entrance animations
│   ├── main.jsx             # React entry point
│   ├── index.css            # Comprehensive design system (2800+ lines)
│   │
│   ├── pages/
│   │   └── LandingPage.jsx  # Marketing landing with Three.js background
│   │
│   ├── components/
│   │   ├── Canvas/          # Konva.js design canvas
│   │   ├── Sidebar/         # Tools, properties, PDF upload
│   │   ├── Landing/         # Landing page components
│   │   ├── LayerPanel/      # Z-index layer management
│   │   ├── CompliancePanel/ # Real-time violation display
│   │   ├── ContextMenu/     # Right-click element controls
│   │   ├── CustomDropdown/  # Styled dropdown component
│   │   ├── Onboarding/      # Interactive product tour
│   │   └── AnalyzingOverlay/ # PDF analysis loading animation
│   │
│   ├── store/
│   │   └── useAdStore.js    # Zustand state management
│   │
│   └── services/
│       ├── api.js           # Backend API communication
│       └── imageProcessing.js # Client-side image utilities
```

---

## 🔑 Key Components

### 1. **App.jsx** - Application Router
```javascript
// Features:
- React Router for page navigation (/, /editor)
- Professional 3D entrance animation with Framer Motion
- Welcome overlay with loading progress
- Theme persistence via Zustand
```

### 2. **LandingPage.jsx** - Marketing Page
```javascript
// Features:
- Three.js particle starfield background
- Typing animation effect for headline
- Interactive before/after comparison slider
- "Warp speed" transition to editor
- Fully responsive design
```

### 3. **AdCanvas.jsx** - Design Canvas
```javascript
// Features:
- Konva.js canvas rendering (React-Konva)
- Drag & drop elements (text, images)
- Real-time element transformation
- Safe zone overlay visualization
- Attention heatmap (gradient overlay)
- Multi-select with Shift+Click
- Keyboard shortcuts (Delete, Esc)
- Dynamic format switching
```

### 4. **Sidebar.jsx** - Control Panel
```javascript
// Features:
- PDF guideline upload & AI analysis trigger
- Dynamic property editor (per element type)
- Text controls: font, size, color, alignment
- Image controls: opacity, filters, background removal
- Undo/Redo buttons (50-state history)
- Format selector (Square, Banner, Skyscraper)
- Theme toggle (Light/Dark)
- Project save/load
```

### 5. **useAdStore.js** - State Management
```javascript
// Zustand store with:
- elements: Canvas elements array
- guidelines: Parsed PDF rules
- complianceViolations: Real-time violations
- history: Undo/redo stack (50 states)
- selectedElementIds: Multi-select support
- theme: Light/Dark mode
- Persistence via localStorage
```

---

## 🎨 Design System

### CSS Variables (index.css)
```css
/* Dark Theme (Default) */
--bg-dark: #0a0b0d
--primary: #6366f1 (Indigo)
--accent-purple: #a855f7
--accent-cyan: #22d3ee
--accent-emerald: #10b981

/* Light Theme */
--bg-dark: #f8fafc
--text-main: #0f172a
/* + 200+ component overrides */
```

### Key UI Features
- Glassmorphism effects
- Smooth Framer Motion animations
- Premium gradients and shadows
- Responsive breakpoints (mobile-first)
- Accessible color contrast

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react` 19.2 | UI framework |
| `vite` 7.2 | Build tool with HMR |
| `zustand` | State management |
| `konva` + `react-konva` | Canvas rendering |
| `framer-motion` | Animations |
| `three` + `@react-three/fiber` | 3D backgrounds |
| `axios` | HTTP client |
| `react-hot-toast` | Notifications |
| `react-router-dom` | Routing |
| `react-icons` | Icon library |

---

## 🔧 Scripts

```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
npm run lint:fix # Auto-fix lint issues
```

---

## 🌐 API Integration

All API calls go through `services/api.js`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload` | POST | Upload images to Cloudinary |
| `/api/analyze-guideline` | POST | Send PDF for AI analysis |
| `/api/export` | POST | Export with compression |
| `/api/remove-background` | POST | Remove image backgrounds |

---

## 🎯 Key Algorithms

### 1. Compliance Checking
```javascript
// Location: useAdStore.js → checkCompliance()
// Checks all elements against:
- Safe zone boundaries
- Minimum text size
- Character limits
- Image dimension requirements
```

### 2. Smart Repositioning
```javascript
// Location: useAdStore.js → setFormat()
// When format changes:
- Calculates scale ratio
- Repositions elements proportionally
- Maintains safe zone compliance
```

### 3. History Management
```javascript
// Location: useAdStore.js → undo()/redo()
// 50-state history with:
- Deep clone of elements array
- Circular buffer implementation
- Keyboard shortcut integration
```

---

## 📱 Responsive Design

| Breakpoint | Behavior |
|------------|----------|
| < 768px | Mobile sidebar (collapsible) |
| 768-1024px | Compact sidebar |
| > 1024px | Full desktop layout |

---

## 🔒 Environment Variables

```env
VITE_API_URL=http://localhost:5001
```

---

## 📈 Performance

- **Bundle Size**: ~1.6MB (could benefit from code splitting)
- **Lighthouse Score**: 90+ (Performance, Accessibility)
- **Three.js**: Optimized particle count (5000)
- **Konva**: Cached transformers, throttled updates

---

## ✅ Code Quality

- ESLint configured with React hooks rules
- No lint errors in production
- Consistent code formatting
- Component-based architecture
- Prop drilling minimized via Zustand
