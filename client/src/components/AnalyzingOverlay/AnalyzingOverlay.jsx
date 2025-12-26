import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars

const AnalyzingOverlay = ({ isVisible }) => {
    const [phase, setPhase] = useState('uploading'); // 'uploading' -> 'scanning' -> 'extracting' -> 'finalizing'
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isVisible) {
            setPhase('uploading');
            setProgress(0);
            return;
        }

        // Simulate progress phases
        const phases = [
            { name: 'uploading', duration: 800, progress: 20 },
            { name: 'scanning', duration: 1200, progress: 50 },
            { name: 'extracting', duration: 1500, progress: 80 },
            { name: 'finalizing', duration: 1000, progress: 100 }
        ];

        let currentIndex = 0;
        let timeout;

        const advancePhase = () => {
            if (currentIndex < phases.length) {
                setPhase(phases[currentIndex].name);
                setProgress(phases[currentIndex].progress);
                timeout = setTimeout(advancePhase, phases[currentIndex].duration);
                currentIndex++;
            }
        };

        advancePhase();

        return () => clearTimeout(timeout);
    }, [isVisible]);

    const phaseMessages = {
        uploading: 'Uploading document...',
        scanning: 'Scanning PDF structure...',
        extracting: 'Extracting compliance rules...',
        finalizing: 'Applying guidelines...'
    };

    const phaseIcons = {
        uploading: (
            <motion.path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
            />
        ),
        scanning: (
            <>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <motion.line
                    x1="4" y1="12" x2="20" y2="12"
                    strokeWidth="2"
                    initial={{ x1: 4, x2: 4 }}
                    animate={{ x1: 4, x2: 20, y1: [8, 16, 8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            </>
        ),
        extracting: (
            <>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, staggerChildren: 0.2 }}
                >
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="14" y2="17" />
                </motion.g>
            </>
        ),
        finalizing: (
            <motion.path
                d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
            />
        )
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    style={{
                        background: 'linear-gradient(145deg, rgba(25, 28, 40, 0.98) 0%, rgba(15, 17, 25, 0.99) 100%)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: 24,
                        padding: '48px 56px',
                        textAlign: 'center',
                        boxShadow: '0 40px 80px rgba(0, 0, 0, 0.5), 0 0 100px rgba(99, 102, 241, 0.1)',
                        maxWidth: 420,
                        width: '90%',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Animated Background Gradient */}
                    <motion.div
                        animate={{
                            background: [
                                'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.1) 0%, transparent 50%)',
                                'radial-gradient(circle at 80% 80%, rgba(139,92,246,0.1) 0%, transparent 50%)',
                                'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.1) 0%, transparent 50%)'
                            ]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            pointerEvents: 'none'
                        }}
                    />

                    {/* Floating Particles */}
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [-20, 20, -20],
                                x: [-10, 10, -10],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{
                                duration: 3 + i * 0.5,
                                repeat: Infinity,
                                delay: i * 0.3
                            }}
                            style={{
                                position: 'absolute',
                                width: 4 + i * 2,
                                height: 4 + i * 2,
                                borderRadius: '50%',
                                background: '#6366f1',
                                top: `${20 + i * 15}%`,
                                left: `${10 + i * 18}%`,
                                filter: 'blur(1px)'
                            }}
                        />
                    ))}

                    {/* Main Icon Container */}
                    <motion.div
                        animate={{
                            boxShadow: [
                                '0 0 30px rgba(99,102,241,0.3)',
                                '0 0 50px rgba(99,102,241,0.5)',
                                '0 0 30px rgba(99,102,241,0.3)'
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            width: 88,
                            height: 88,
                            margin: '0 auto 28px',
                            borderRadius: 22,
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#analysisGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <defs>
                                <linearGradient id="analysisGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#c084fc" />
                                </linearGradient>
                            </defs>
                            {phaseIcons[phase]}
                        </svg>

                        {/* Spinning outer ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            style={{
                                position: 'absolute',
                                inset: -4,
                                borderRadius: 26,
                                border: '2px dashed rgba(99, 102, 241, 0.3)'
                            }}
                        />
                    </motion.div>

                    {/* Title */}
                    <motion.h3
                        key={phase}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            margin: '0 0 8px 0',
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #fff 0%, #c7d2fe 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        Analyzing Guidelines
                    </motion.h3>

                    {/* Dynamic Status */}
                    <motion.p
                        key={phaseMessages[phase]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            margin: '0 0 32px 0',
                            fontSize: '0.95rem',
                            color: '#94a3b8',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        {phaseMessages[phase]}
                    </motion.p>

                    {/* Progress Bar */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 16,
                        padding: '20px 24px',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {/* Progress Track */}
                        <div style={{
                            height: 8,
                            background: 'rgba(99, 102, 241, 0.15)',
                            borderRadius: 4,
                            overflow: 'hidden',
                            marginBottom: 16
                        }}>
                            <motion.div
                                initial={{ width: '0%' }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #6366f1 100%)',
                                    backgroundSize: '200% 100%',
                                    borderRadius: 4,
                                    animation: 'progressShimmer 1.5s ease-in-out infinite'
                                }}
                            />
                        </div>

                        {/* Progress Steps */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {['Upload', 'Scan', 'Extract', 'Apply'].map((step, i) => {
                                const stepProgress = (i + 1) * 25;
                                const isComplete = progress >= stepProgress;
                                const isActive = progress >= stepProgress - 25 && progress < stepProgress;

                                return (
                                    <motion.div
                                        key={step}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 6
                                        }}
                                    >
                                        <motion.div
                                            animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                background: isComplete
                                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                                    : isActive
                                                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                                        : 'rgba(255,255,255,0.1)',
                                                border: isComplete || isActive ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: isActive ? '0 0 15px rgba(99,102,241,0.5)' : 'none'
                                            }}
                                        >
                                            {isComplete ? (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            ) : isActive ? (
                                                <motion.div
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        background: 'white'
                                                    }}
                                                />
                                            ) : null}
                                        </motion.div>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            color: isComplete ? '#10b981' : isActive ? '#a5b4fc' : '#475569',
                                            fontWeight: isActive ? 600 : 500
                                        }}>
                                            {step}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer hint */}
                    <motion.p
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            margin: '20px 0 0 0',
                            fontSize: '0.8rem',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            style={{ display: 'inline-flex' }}
                        >
                            ⏳
                        </motion.span>
                        AI is processing your document...
                    </motion.p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AnalyzingOverlay;
