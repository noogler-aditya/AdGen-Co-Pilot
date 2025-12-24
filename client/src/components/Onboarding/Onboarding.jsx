import React, { useState, useEffect, useCallback } from 'react';
import { FiArrowRight, FiX, FiArrowDown } from 'react-icons/fi';

const tourSteps = [
    {
        target: '[data-tour="upload-pdf"]',
        title: "Step 1: Upload Guidelines",
        description: "Start by uploading your retailer's PDF guideline. Our AI will automatically extract all compliance rules.",
        position: 'right'
    },
    {
        target: '[data-tour="upload-image"]',
        title: "Step 2: Add Images",
        description: "Upload product images here. Background removal is automatic — drag them onto the canvas!",
        position: 'right'
    },
    {
        target: '[data-tour="add-text"]',
        title: "Step 3: Add Text",
        description: "Click here to add headlines, CTAs, or any text to your design.",
        position: 'right'
    },
    {
        target: '[data-tour="heatmap"]',
        title: "Step 4: Visualize Attention",
        description: "Toggle the heatmap to see where viewers will focus on your ad.",
        position: 'right'
    },
    {
        target: '[data-tour="export"]',
        title: "Step 5: Export",
        description: "One-click export with automatic compression to meet file size requirements. Ready to submit!",
        position: 'right'
    }
];

const ProductTour = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    // Initialize visibility based on localStorage
    const [isVisible, setIsVisible] = useState(() => {
        return !localStorage.getItem('adgen-tour-complete');
    });
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [highlightBox, setHighlightBox] = useState({ top: 0, left: 0, width: 0, height: 0 });

    // Position the tooltip relative to the target element
    const updatePosition = useCallback(() => {
        if (!isVisible) return;

        const step = tourSteps[currentStep];
        const targetEl = document.querySelector(step.target);

        if (targetEl) {
            const rect = targetEl.getBoundingClientRect();

            // Highlight box position
            setHighlightBox({
                top: rect.top - 6,
                left: rect.left - 6,
                width: rect.width + 12,
                height: rect.height + 12
            });

            // Tooltip position (to the right of the element)
            setTooltipPosition({
                top: rect.top + rect.height / 2 - 80,
                left: rect.right + 20
            });

            // Scroll element into view if needed
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentStep, isVisible]);

    // Update position on resize and when current step changes
    useEffect(() => {
        // Small delay to allow DOM to render
        const timer = setTimeout(() => {
            updatePosition();
        }, 100);

        const handleResize = () => {
            updatePosition();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [updatePosition]);

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        localStorage.setItem('adgen-tour-complete', 'true');
        setIsVisible(false);
        onComplete?.();
    };

    if (!isVisible) return null;

    const step = tourSteps[currentStep];
    const isLastStep = currentStep === tourSteps.length - 1;

    return (
        <>
            {/* Glassmorphic Overlay */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9998,
                pointerEvents: 'none'
            }}>
                {/* Glassmorphic background with blur */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(10, 10, 20, 0.6)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    pointerEvents: 'auto'
                }} onClick={handleSkip} />
            </div>

            {/* Highlight ring around target */}
            <div style={{
                position: 'fixed',
                top: highlightBox.top,
                left: highlightBox.left,
                width: highlightBox.width,
                height: highlightBox.height,
                border: '3px solid #6366f1',
                borderRadius: 14,
                zIndex: 9999,
                pointerEvents: 'none',
                background: 'rgba(99, 102, 241, 0.08)',
                boxShadow: '0 0 40px rgba(99, 102, 241, 0.5), inset 0 0 20px rgba(99, 102, 241, 0.1)',
                animation: 'pulse-highlight 2s ease-in-out infinite',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />

            {/* Pulsing dot */}
            <div style={{
                position: 'fixed',
                top: highlightBox.top + highlightBox.height / 2 - 8,
                left: highlightBox.left - 25,
                width: 16,
                height: 16,
                background: '#6366f1',
                borderRadius: '50%',
                zIndex: 10000,
                animation: 'ping 1.5s ease-in-out infinite',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)'
            }} />

            {/* Tooltip */}
            <div style={{
                position: 'fixed',
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                zIndex: 10001,
                background: '#1a1d24',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 16,
                padding: '24px 28px',
                maxWidth: 320,
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15)',
                animation: 'slideIn 0.4s ease',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* Arrow pointing left */}
                <div style={{
                    position: 'absolute',
                    left: -10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 0,
                    height: 0,
                    borderTop: '10px solid transparent',
                    borderBottom: '10px solid transparent',
                    borderRight: '10px solid #1a1d24'
                }} />

                {/* Step indicator */}
                <div style={{
                    display: 'flex',
                    gap: 6,
                    marginBottom: 16
                }}>
                    {tourSteps.map((_, idx) => (
                        <div
                            key={idx}
                            style={{
                                width: idx === currentStep ? 24 : 8,
                                height: 8,
                                borderRadius: 4,
                                background: idx === currentStep ? '#6366f1' : 'rgba(255,255,255,0.2)',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </div>

                {/* Title */}
                <h3 style={{
                    margin: '0 0 10px 0',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#fff'
                }}>
                    {step.title}
                </h3>

                {/* Description */}
                <p style={{
                    margin: '0 0 20px 0',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: '#94a3b8'
                }}>
                    {step.description}
                </p>

                {/* Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={handleSkip}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            padding: '8px 0'
                        }}
                    >
                        Skip tour
                    </button>
                    <button
                        onClick={handleNext}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 10,
                            padding: '12px 24px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        {isLastStep ? 'Finish' : 'Next'}
                        <FiArrowRight size={16} />
                    </button>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes pulse-highlight {
                    0%, 100% { 
                        box-shadow: 0 0 40px rgba(99, 102, 241, 0.5), inset 0 0 20px rgba(99, 102, 241, 0.1);
                        border-color: #6366f1;
                    }
                    50% { 
                        box-shadow: 0 0 60px rgba(99, 102, 241, 0.8), inset 0 0 30px rgba(99, 102, 241, 0.2);
                        border-color: #818cf8;
                    }
                }
                @keyframes ping {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.8); opacity: 0.4; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `}</style>
        </>
    );
};

export default ProductTour;
