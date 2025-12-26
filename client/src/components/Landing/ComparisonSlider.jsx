import { useState, useRef, useEffect } from 'react';

// Mockup for Messy PDF - "Before" state
const MessyPDF = () => (
    <div style={{
        width: '100%',
        height: '100%',
        background: '#f8f9fa',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        boxSizing: 'border-box'
    }}>
        {/* Header skeleton */}
        <div style={{ width: '45%', height: 12, background: '#d1d5db', borderRadius: 3 }} />
        <div style={{ width: '75%', height: 6, background: '#e5e7eb', borderRadius: 2 }} />
        <div style={{ width: '60%', height: 6, background: '#e5e7eb', borderRadius: 2 }} />

        {/* Image placeholders */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flex: 1 }}>
            <div style={{
                flex: 1,
                background: '#e5e7eb',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: 9,
                minHeight: 50
            }}>IMG</div>
            <div style={{
                flex: 1,
                background: '#e5e7eb',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: 9,
                minHeight: 50
            }}>IMG</div>
        </div>

        {/* Error indicators */}
        <div style={{
            padding: '4px 8px',
            background: '#fef2f2',
            border: '1px dashed #ef4444',
            borderRadius: 3,
            color: '#ef4444',
            fontSize: 8,
            fontWeight: 600
        }}>
            ⚠ SIZE ERROR
        </div>
        <div style={{
            flex: 1,
            minHeight: 30,
            border: '1.5px dashed #ef4444',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            fontSize: 9,
            opacity: 0.7
        }}>
            WRONG FORMAT
        </div>
    </div>
);

// Mockup for Clean Ad - "After" state
const CleanAd = () => (
    <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
    }}>
        {/* Decorative glow */}
        <div style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
            borderRadius: '50%'
        }} />

        {/* Content */}
        <div style={{ zIndex: 1, textAlign: 'center' }}>
            <div style={{
                fontSize: 16,
                fontWeight: 800,
                marginBottom: 4,
                background: 'linear-gradient(90deg, #fff, #c7d2fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>SUMMER SALE</div>

            <div style={{
                width: 80,
                height: 1.5,
                background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
                margin: '0 auto 10px'
            }} />

            {/* Product cards */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                {[0.9, 1.1, 0.9].map((scale, i) => (
                    <div key={i} style={{
                        width: 36,
                        height: 48,
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.1)',
                        transform: `scale(${scale})`,
                        boxShadow: scale > 1 ? '0 6px 20px rgba(0,0,0,0.4)' : 'none'
                    }} />
                ))}
            </div>

            <button style={{
                marginTop: 12,
                padding: '5px 14px',
                background: '#6366f1',
                border: 'none',
                borderRadius: 12,
                color: 'white',
                fontWeight: 600,
                fontSize: 9,
                cursor: 'pointer'
            }}>SHOP NOW</button>
        </div>

        {/* Compliance badge */}
        <div style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            padding: '3px 6px',
            background: 'rgba(16, 185, 129, 0.15)',
            borderRadius: 8,
            border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: 7, color: '#10b981', fontWeight: 600 }}>COMPLIANT</span>
        </div>
    </div>
);

const ComparisonSlider = () => {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef(null);
    const isDragging = useRef(false);

    const handleMove = (event) => {
        if (!isDragging.current && event.type !== 'click') return;

        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;

        let pos = ((clientX - rect.left) / rect.width) * 100;
        pos = Math.max(5, Math.min(95, pos)); // Limit to 5-95% for better UX

        setSliderPos(pos);
    };

    const handleMouseDown = () => { isDragging.current = true; };
    const handleMouseUp = () => { isDragging.current = false; };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchend', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="comparison-slider"
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: 420,
                height: 240,
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'col-resize',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
                margin: '0 auto',
                userSelect: 'none'
            }}
            onMouseMove={handleMove}
            onTouchMove={handleMove}
            onMouseDown={handleMouseDown}
            onClick={handleMove}
        >
            {/* LAYER 1: Clean Ad (Full Background) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1
            }}>
                <CleanAd />
            </div>

            {/* LAYER 2: Messy PDF (Clipped Overlay) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`, // CSS clip-path for clean edge
                transition: 'clip-path 0.05s ease-out'
            }}>
                <MessyPDF />
            </div>

            {/* LAYER 3: Slider Handle */}
            <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${sliderPos}%`,
                transform: 'translateX(-50%)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
            }}>
                {/* Vertical line */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: 'rgba(255,255,255,0.8)',
                    boxShadow: '0 0 10px rgba(0,0,0,0.3)'
                }} />

                {/* Handle circle */}
                <div style={{
                    width: 32,
                    height: 32,
                    background: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.2)',
                    zIndex: 1
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 8L22 12L18 16" />
                        <path d="M6 8L2 12L6 16" />
                    </svg>
                </div>
            </div>

            {/* Labels */}
            <div style={{
                position: 'absolute',
                top: 8,
                left: 8,
                padding: '3px 8px',
                background: 'rgba(0,0,0,0.6)',
                borderRadius: 6,
                fontSize: 9,
                fontWeight: 600,
                color: 'white',
                zIndex: 5,
                backdropFilter: 'blur(4px)'
            }}>
                BEFORE
            </div>
            <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                padding: '3px 8px',
                background: 'rgba(99,102,241,0.8)',
                borderRadius: 6,
                fontSize: 9,
                fontWeight: 600,
                color: 'white',
                zIndex: 5,
                backdropFilter: 'blur(4px)'
            }}>
                AFTER
            </div>
        </div>
    );
};

export default ComparisonSlider;
