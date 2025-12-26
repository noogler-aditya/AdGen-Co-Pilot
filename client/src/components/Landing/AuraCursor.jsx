import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion'; // eslint-disable-line no-unused-vars

const AuraCursor = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 700 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX - 16);
            cursorY.set(e.clientY - 16);
        };

        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, [cursorX, cursorY]);

    return (
        <motion.div
            style={{
                position: 'fixed',
                left: cursorXSpring,
                top: cursorYSpring,
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.3)',
                boxShadow: '0 0 40px 20px rgba(99, 102, 241, 0.4)',
                pointerEvents: 'none',
                zIndex: 9999,
                mixBlendMode: 'screen'
            }}
            className="aura-cursor"
        >
            <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                opacity: 0.5,
                transform: 'scale(0.2)'
            }} />
        </motion.div>
    );
};

export default AuraCursor;
