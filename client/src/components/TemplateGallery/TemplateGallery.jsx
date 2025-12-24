import React, { useState } from 'react';
import { FiX, FiLayout, FiShoppingBag, FiPercent, FiStar, FiGift } from 'react-icons/fi';
import useAdStore from '../../store/useAdStore';

const templates = [
    {
        id: 'product-spotlight',
        name: 'Product Spotlight',
        category: 'E-commerce',
        icon: <FiShoppingBag />,
        format: { width: 1200, height: 628, label: 'Landscape (1200x628)' },
        elements: [
            {
                id: 'headline-1',
                type: 'text',
                text: 'NEW ARRIVAL',
                x: 80,
                y: 100,
                fontSize: 24,
                fill: '#ffffff',
                fontFamily: 'Inter',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 1
            },
            {
                id: 'headline-2',
                type: 'text',
                text: 'Premium Quality',
                x: 80,
                y: 150,
                fontSize: 56,
                fill: '#ffffff',
                fontFamily: 'Outfit',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 2
            },
            {
                id: 'cta-text',
                type: 'text',
                text: 'SHOP NOW →',
                x: 80,
                y: 520,
                fontSize: 20,
                fill: '#ffffff',
                fontFamily: 'Inter',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 3
            }
        ],
        background: '#667eea'
    },
    {
        id: 'sale-banner',
        name: 'Flash Sale',
        category: 'Promotional',
        icon: <FiPercent />,
        format: { width: 1080, height: 1080, label: 'Square (1080x1080)' },
        elements: [
            {
                id: 'sale-headline',
                type: 'text',
                text: 'FLASH SALE',
                x: 200,
                y: 200,
                fontSize: 72,
                fill: '#ef4444',
                fontFamily: 'Oswald',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 1
            },
            {
                id: 'discount',
                type: 'text',
                text: '50% OFF',
                x: 180,
                y: 400,
                fontSize: 120,
                fill: '#1f2937',
                fontFamily: 'Outfit',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 2
            },
            {
                id: 'subtext',
                type: 'text',
                text: 'Limited Time Only',
                x: 300,
                y: 600,
                fontSize: 32,
                fill: '#6b7280',
                fontFamily: 'Inter',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 3
            },
            {
                id: 'cta',
                type: 'text',
                text: 'SHOP NOW',
                x: 400,
                y: 900,
                fontSize: 28,
                fill: '#ef4444',
                fontFamily: 'Inter',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 4
            }
        ],
        background: '#fef3c7'
    },
    {
        id: 'story-promo',
        name: 'Story Promo',
        category: 'Social',
        icon: <FiStar />,
        format: { width: 1080, height: 1920, label: 'Story (1080x1920)' },
        elements: [
            {
                id: 'story-headline',
                type: 'text',
                text: 'EXCLUSIVE',
                x: 100,
                y: 400,
                fontSize: 80,
                fill: '#ffffff',
                fontFamily: 'Outfit',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 1
            },
            {
                id: 'story-headline-2',
                type: 'text',
                text: 'OFFER',
                x: 100,
                y: 500,
                fontSize: 80,
                fill: '#6366f1',
                fontFamily: 'Outfit',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 2
            },
            {
                id: 'story-subtitle',
                type: 'text',
                text: 'Swipe Up to Shop',
                x: 350,
                y: 1700,
                fontSize: 28,
                fill: '#ffffff',
                fontFamily: 'Inter',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 3
            }
        ],
        background: '#1f2937'
    },
    {
        id: 'holiday-special',
        name: 'Holiday Special',
        category: 'Seasonal',
        icon: <FiGift />,
        format: { width: 1200, height: 628, label: 'Landscape (1200x628)' },
        elements: [
            {
                id: 'holiday-headline',
                type: 'text',
                text: '🎄 HOLIDAY SALE 🎄',
                x: 300,
                y: 100,
                fontSize: 48,
                fill: '#dc2626',
                fontFamily: 'Poppins',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 1
            },
            {
                id: 'holiday-offer',
                type: 'text',
                text: 'UP TO 70% OFF',
                x: 280,
                y: 250,
                fontSize: 64,
                fill: '#166534',
                fontFamily: 'Outfit',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 2
            },
            {
                id: 'holiday-cta',
                type: 'text',
                text: 'Shop the Collection →',
                x: 380,
                y: 450,
                fontSize: 24,
                fill: '#1f2937',
                fontFamily: 'Inter',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 3
            }
        ],
        background: '#f0fdf4'
    },
    {
        id: 'minimal-product',
        name: 'Minimal Product',
        category: 'E-commerce',
        icon: <FiLayout />,
        format: { width: 1080, height: 1080, label: 'Square (1080x1080)' },
        elements: [
            {
                id: 'brand-name',
                type: 'text',
                text: 'BRAND NAME',
                x: 400,
                y: 100,
                fontSize: 18,
                fill: '#9ca3af',
                fontFamily: 'Inter',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 1
            },
            {
                id: 'product-name',
                type: 'text',
                text: 'Product Title',
                x: 380,
                y: 900,
                fontSize: 42,
                fill: '#1f2937',
                fontFamily: 'Playfair Display',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 2
            },
            {
                id: 'price',
                type: 'text',
                text: '$99.00',
                x: 460,
                y: 970,
                fontSize: 32,
                fill: '#6366f1',
                fontFamily: 'Inter',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 3
            }
        ],
        background: '#ffffff'
    }
];

const TemplateGallery = ({ isOpen, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { setFormat, setBackground, newProject } = useAdStore();
    const addElement = useAdStore(state => state.addElement);

    const categories = ['All', ...new Set(templates.map(t => t.category))];

    const filteredTemplates = selectedCategory === 'All'
        ? templates
        : templates.filter(t => t.category === selectedCategory);

    const applyTemplate = (template) => {
        // Reset project first
        newProject();

        // Apply format and background
        setTimeout(() => {
            setFormat(template.format);
            setBackground(template.background);

            // Add elements with slight delays to ensure proper ordering
            template.elements.forEach((el, idx) => {
                setTimeout(() => {
                    addElement({
                        ...el,
                        id: `${el.type}-${Date.now()}-${idx}`,
                        zIndex: el.zIndex || idx
                    });
                }, 50 + (idx * 30));
            });
        }, 100);

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="template-gallery-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="template-gallery">
                <div className="template-gallery-header">
                    <div>
                        <h2>Template Gallery</h2>
                        <p>Start with a professionally designed template</p>
                    </div>
                    <button className="template-close-btn" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="template-categories">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`template-category-btn ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="template-grid">
                    {filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            className="template-card"
                            onClick={() => applyTemplate(template)}
                        >
                            <div
                                className="template-preview"
                                style={{
                                    background: template.background,
                                    aspectRatio: `${template.format.width} / ${template.format.height}`
                                }}
                            >
                                <div className="template-icon">{template.icon}</div>
                            </div>
                            <div className="template-info">
                                <h4>{template.name}</h4>
                                <span>{template.format.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TemplateGallery;
