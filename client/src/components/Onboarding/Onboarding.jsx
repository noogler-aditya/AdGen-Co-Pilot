import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiArrowRight } from 'react-icons/fi';

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
    const [isVisible, setIsVisible] = useState(() => {
        return !localStorage.getItem('adgen-tour-complete');
    });
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [highlightBox, setHighlightBox] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const prevStepRef = useRef(currentStep);

    // Update position only (no scrolling)
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
                top: Math.max(20, rect.top + rect.height / 2 - 80),
                left: rect.right + 20
            });
        }
    }, [currentStep, isVisible]);

    // Scroll into view only when step changes
    useEffect(() => {
        if (!isVisible) return;

        const step = tourSteps[currentStep];
        const targetEl = document.querySelector(step.target);

        // Only scroll if step actually changed
        if (targetEl && prevStepRef.current !== currentStep) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        prevStepRef.current = currentStep;

        // Update position after a small delay to allow scroll to settle
        const timer = setTimeout(() => {
            updatePosition();
        }, 150);

        return () => clearTimeout(timer);
    }, [currentStep, isVisible, updatePosition]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            updatePosition();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
            {/* Overlay */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9998,
                pointerEvents: 'none'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(10, 10, 20, 0.7)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
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
                border: '2px solid #6366f1',
                borderRadius: 12,
                zIndex: 9999,
                pointerEvents: 'none',
                background: 'rgba(99, 102, 241, 0.1)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                animation: 'tourPulse 2s ease-in-out infinite',
                transition: 'all 0.3s ease-out'
            }} />

            {/* Tooltip */}
            <div style={{
                position: 'fixed',
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                zIndex: 10001,
                background: 'linear-gradient(135deg, #1a1d24 0%, #14161a 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 16,
                padding: '20px 24px',
                maxWidth: 300,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                animation: 'tourSlideIn 0.3s ease-out',
                transition: 'all 0.3s ease-out'
            }}>
                {/* Arrow pointing left */}
                <div style={{
                    position: 'absolute',
                    left: -8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 0,
                    height: 0,
                    borderTop: '8px solid transparent',
                    borderBottom: '8px solid transparent',
                    borderRight: '8px solid #1a1d24'
                }} />

                {/* Step indicator */}
                <div style={{
                    display: 'flex',
                    gap: 6,
                    marginBottom: 14
                }}>
                    {tourSteps.map((_, idx) => (
                        <div
                            key={idx}
                            style={{
                                width: idx === currentStep ? 20 : 8,
                                height: 6,
                                borderRadius: 3,
                                background: idx === currentStep ? '#6366f1' : 'rgba(255,255,255,0.2)',
                                transition: 'all 0.2s ease'
                            }}
                        />
                    ))}
                </div>

                {/* Title */}
                <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#fff'
                }}>
                    {step.title}
                </h3>

                {/* Description */}
                <p style={{
                    margin: '0 0 16px 0',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
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
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            padding: '6px 0'
                        }}
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleNext}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            padding: '10px 18px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                            transition: 'transform 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        {isLastStep ? 'Start Creating' : 'Next'}
                        <FiArrowRight size={14} />
                    </button>
                </div>
            </div>

            {/* CSS Animations - Simplified and smoother */}
            <style>{`
                @keyframes tourPulse {
                    0%, 100% { 
                        box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
                    }
                    50% { 
                        box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
                    }
                }
                @keyframes tourSlideIn {
                    from { 
                        opacity: 0; 
                        transform: translateX(-10px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateX(0); 
                    }
                }
            `}</style>
        </>
    );
};

export default ProductTour;
