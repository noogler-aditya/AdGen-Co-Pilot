import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useNavigate } from 'react-router-dom';
import AuraCursor from '../components/Landing/AuraCursor';
import ThreeBackground from '../components/Landing/ThreeBackground';
import ComparisonSlider from '../components/Landing/ComparisonSlider';
import { FiArrowRight, FiCheck } from 'react-icons/fi';

const TypingEffect = ({ text, delay = 0 }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [startTyping, setStartTyping] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setStartTyping(true), delay);
        return () => clearTimeout(timeout);
    }, [delay]);

    useEffect(() => {
        if (!startTyping) return;

        let index = 0;
        const interval = setInterval(() => {
            if (index <= text.length) {
                setDisplayedText(text.slice(0, index));
                index++;
            } else {
                clearInterval(interval);
            }
        }, 40);

        return () => clearInterval(interval);
    }, [text, startTyping]);

    return (
        <span>
            {displayedText}
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ marginLeft: 2, color: '#6366f1' }}
            >
                |
            </motion.span>
        </span>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [isWarping, setIsWarping] = useState(false);

    // Handle warp transition
    const handleLaunch = () => {
        setIsWarping(true);

        // Navigate after warp animation completes
        setTimeout(() => {
            navigate('/editor');
        }, 1200); // 1.2 second warp animation
    };

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            overflowX: 'hidden',
            background: '#000',
            color: '#fff'
        }}>
            <AuraCursor />
            <ThreeBackground warpSpeed={isWarping} />

            {/* Warp Flash Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isWarping ? 1 : 0 }}
                transition={{ duration: 0.8, delay: isWarping ? 0.4 : 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at center, rgba(99,102,241,0.3) 0%, rgba(255,255,255,0.9) 100%)',
                    pointerEvents: 'none',
                    zIndex: 100
                }}
            />

            {/* Content Container with Exit Animation */}
            <motion.div
                animate={{
                    opacity: isWarping ? 0 : 1,
                    scale: isWarping ? 0.8 : 1,
                    y: isWarping ? -50 : 0,
                    filter: isWarping ? 'blur(10px)' : 'blur(0px)'
                }}
                transition={{ duration: 0.6, ease: 'easeIn' }}
                style={{
                    position: 'relative',
                    zIndex: 10,
                    maxWidth: 1200,
                    margin: '0 auto',
                    padding: '0 20px'
                }}
            >
                {/* Navigation */}
                <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 28,
                            height: 28,
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            borderRadius: 6,
                            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
                        }} />
                        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            AdGen Co-Pilot
                        </span>
                    </div>
                </nav>

                {/* Hero Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: 30 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            color: '#a5b4fc',
                            fontSize: 11,
                            fontWeight: 600,
                            marginBottom: 16,
                            boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)'
                        }}>
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px #6366f1' }}></span>
                            AI-POWERED RETAIL MEDIA
                        </span>
                    </motion.div>

                    <h1 style={{
                        fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                        fontWeight: 800,
                        lineHeight: 1.0,
                        marginBottom: 16,
                        letterSpacing: '-0.03em',
                        maxWidth: 900,
                        minHeight: '2.1em'
                    }}>
                        <TypingEffect text="Turn Messy PDFs into Compliant Ads Instantly." delay={500} />
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 2.5 }}
                        style={{ fontSize: '1rem', color: '#94a3b8', maxWidth: 580, marginBottom: 24, lineHeight: 1.5 }}
                    >
                        The first AI editor that understands retailer guidelines. <br />Upload a PDF, get a perfect ad in seconds.
                    </motion.p>

                    {/* Launch Button with Warp Effect */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: isWarping ? 1.2 : 1,
                            y: 0,
                            boxShadow: isWarping
                                ? '0 0 80px rgba(99, 102, 241, 1)'
                                : '0 15px 30px -10px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                        whileHover={!isWarping ? { scale: 1.05, boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' } : {}}
                        whileTap={!isWarping ? { scale: 0.95 } : {}}
                        transition={{ duration: 0.3, delay: isWarping ? 0 : 2.8 }}
                        onClick={handleLaunch}
                        disabled={isWarping}
                        style={{
                            padding: '14px 36px',
                            borderRadius: 100,
                            background: isWarping
                                ? 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)'
                                : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            color: 'white',
                            fontSize: 15,
                            fontWeight: 600,
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: isWarping ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {isWarping ? (
                            <>
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                                >
                                    ⚡
                                </motion.span>
                                Launching...
                            </>
                        ) : (
                            <>Launch Editor <FiArrowRight /></>
                        )}
                    </motion.button>
                </div>

                {/* Comparison Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 3.2 }}
                    style={{
                        marginTop: 20,
                        marginBottom: 40,
                        background: 'rgba(255, 255, 255, 0.02)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 24,
                        padding: '12px 12px 16px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <ComparisonSlider />
                    <p style={{ textAlign: 'center', color: '#64748b', marginTop: 12, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <FiCheck style={{ color: '#10b981', fontSize: 14 }} /> Drag slider to see the magic
                    </p>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default LandingPage;
