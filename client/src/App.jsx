import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import AdCanvas from './components/Canvas/AdCanvas';
import Sidebar from './components/Sidebar/Sidebar';
import ProductTour from './components/Onboarding/Onboarding';
import LandingPage from './pages/LandingPage';
import useAdStore from './store/useAdStore';
import './index.css';

// Professional Welcome Overlay Component
const WelcomeOverlay = ({ onComplete }) => {
  const [phase, setPhase] = useState('flash'); // 'flash' -> 'logo' -> 'loading' -> 'done'

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('logo'), 300),
      setTimeout(() => setPhase('loading'), 1000),
      setTimeout(() => setPhase('done'), 1800),
      setTimeout(() => onComplete(), 2200)
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'done' ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: phase === 'flash'
          ? 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, white 100%)'
          : 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
        transition: 'background 0.5s ease'
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: phase !== 'flash' ? 1 : 0.5,
          opacity: phase !== 'flash' ? 1 : 0
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
      >
        {/* Logo Icon */}
        <motion.div
          animate={{
            boxShadow: phase === 'loading'
              ? ['0 0 20px rgba(99,102,241,0.5)', '0 0 40px rgba(99,102,241,0.8)', '0 0 20px rgba(99,102,241,0.5)']
              : '0 0 20px rgba(99,102,241,0.5)'
          }}
          transition={{ duration: 1, repeat: phase === 'loading' ? Infinity : 0 }}
          style={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            background: 'linear-gradient(to right, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}
        >
          AdGen Co-Pilot
        </motion.h1>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: phase === 'loading' || phase === 'done' ? 1 : 0,
            y: phase === 'loading' || phase === 'done' ? 0 : 10
          }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
          <p style={{ color: '#64748b', fontSize: 14 }}>
            {phase === 'done' ? 'Ready!' : 'Preparing your workspace...'}
          </p>

          {/* Progress bar */}
          <div style={{
            width: 200,
            height: 3,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: phase === 'done' ? '100%' : '70%' }}
              transition={{ duration: phase === 'done' ? 0.3 : 0.8, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                borderRadius: 2
              }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Decorative particles - fixed positions */}
      {[{ x: -150, y: -100 }, { x: 120, y: -80 }, { x: -80, y: 120 }, { x: 100, y: 100 }, { x: -120, y: 50 }, { x: 80, y: -120 }].map((pos, i) => (
        <motion.div
          key={i}
          initial={{
            x: pos.x,
            y: pos.y,
            opacity: 0,
            scale: 0
          }}
          animate={{
            x: 0,
            y: 0,
            opacity: phase === 'loading' ? [0, 0.5, 0] : 0,
            scale: phase === 'loading' ? [0, 1, 0] : 0
          }}
          transition={{
            duration: 2,
            delay: i * 0.2,
            repeat: Infinity
          }}
          style={{
            position: 'absolute',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#6366f1'
          }}
        />
      ))}
    </motion.div>
  );
};

// Enhanced Editor Layout with Professional Animation
const EditorLayout = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setTimeout(() => setIsReady(true), 100);
  };

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const sidebarVariants = {
    hidden: {
      x: -80,
      opacity: 0,
      filter: 'blur(8px)'
    },
    visible: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  const canvasVariants = {
    hidden: {
      scale: 0.95,
      opacity: 0,
      y: 20,
      filter: 'blur(8px)'
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 12,
        delay: 0.2
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <WelcomeOverlay onComplete={handleWelcomeComplete} />
        )}
      </AnimatePresence>

      <motion.div
        className="app-container"
        variants={containerVariants}
        initial="hidden"
        animate={!showWelcome ? "visible" : "hidden"}
      >
        {/* Sidebar */}
        <motion.div
          variants={sidebarVariants}
          style={{ height: '100%' }}
        >
          <Sidebar />
        </motion.div>

        {/* Main Canvas */}
        <motion.main
          className="main-content"
          variants={canvasVariants}
        >
          <AdCanvas />

          {/* Ready pulse effect */}
          <AnimatePresence>
            {isReady && (
              <motion.div
                initial={{ opacity: 0.3, scale: 1 }}
                animate={{ opacity: 0, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: '2px solid rgba(99,102,241,0.5)',
                  borderRadius: 8,
                  pointerEvents: 'none'
                }}
                onAnimationComplete={() => setIsReady(false)}
              />
            )}
          </AnimatePresence>
        </motion.main>
      </motion.div>

      {/* Product Tour - appears after everything settles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showWelcome ? 0 : 1 }}
        transition={{ delay: 0.8 }}
      >
        <ProductTour />
      </motion.div>
    </>
  );
};

function App() {
  const theme = useAdStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/editor" element={<EditorLayout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
