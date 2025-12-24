import React, { useState, useEffect, useCallback } from 'react';
import { uploadImage, analyzeGuideline, optimizeAndDownload } from '../../services/api';
import useAdStore from '../../store/useAdStore';
import {
    FiType, FiDownload, FiFileText, FiUpload, FiImage, FiLoader,
    FiEye, FiEyeOff, FiAlertCircle, FiTrash2, FiMove,
    FiMenu, FiX, FiGrid, FiRotateCcw, FiRotateCw, FiSave, FiFolder
} from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import CustomDropdown from '../CustomDropdown/CustomDropdown';
import TemplateGallery from '../TemplateGallery/TemplateGallery';
import LayerPanel from '../LayerPanel/LayerPanel';

const Sidebar = () => {
    const {
        addElement, setGuidelines, guidelines, showSafeZone, toggleSafeZone,
        setBackground, availableFormats, currentFormat, setFormat,
        elements, updateElement, removeElement, toggleHeatmap, heatmapVisible,
        selectedIds, undo, redo, canUndo, canRedo,
        saveProject, loadProject, getSavedProjects, newProject
    } = useAdStore();

    // Get selectedId from selectedIds for backward compatibility
    const selectedId = selectedIds && selectedIds.length > 0 ? selectedIds[0] : null;

    const [uploadedImages, setUploadedImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showProjectMenu, setShowProjectMenu] = useState(false);
    const [baseColor, setBaseColor] = useState('#ffffff');

    // Project save handler
    const handleSaveProject = useCallback(() => {
        try {
            saveProject();
            toast.success('Project saved!');
        } catch {
            toast.error('Failed to save project');
        }
    }, [saveProject]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Undo: Ctrl/Cmd + Z
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }
            // Save: Ctrl/Cmd + S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSaveProject();
            }
            // Delete/Backspace
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                removeElement(selectedId);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, selectedId, removeElement, handleSaveProject]);

    const handleLoadProject = (project) => {
        loadProject(project);
        setShowProjectMenu(false);
        toast.success(`Loaded: ${project.name}`);
    };

    const selectedElement = elements.find(el => selectedIds.includes(el.id));

    const handleDragStart = (e, src) => {
        e.dataTransfer.setData('image-src', src);
    };

    const handleAnalyzeGuideline = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsAnalyzing(true);
        const loadingToast = toast.loading('Analyzing PDF guidelines...');

        try {
            const data = await analyzeGuideline(file);
            if (data.success && data.rules) {
                setGuidelines(data.rules);
                toast.success(`Guidelines Applied: ${data.rules.retailer_name || 'Custom'}`, { id: loadingToast });
            } else {
                throw new Error('Invalid response');
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            toast.error('Failed to analyze PDF', { id: loadingToast });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const loadingToast = toast.loading('Removing background & Uploading...');

        try {
            // 1. Remove Background (Client-side API call)
            const { removeBackground } = await import('../../services/imageProcessing');
            const processedUrl = await removeBackground(file);

            // 2. Convert Blob URL back to File for Cloudinary Upload
            const response = await fetch(processedUrl);
            const blob = await response.blob();
            const processedFile = new File([blob], file.name, { type: 'image/png' });

            // 3. Upload to Cloudinary
            const data = await uploadImage(processedFile);
            setUploadedImages(prev => [...prev, data.url]);
            toast.success('Image processed & uploaded', { id: loadingToast });
        } catch (error) {
            console.error('Upload failed:', error);
            // Fallback: Upload original if BG removal fails
            try {
                const data = await uploadImage(file);
                setUploadedImages(prev => [...prev, data.url]);
                toast.success('Uploaded (BG removal skipped)', { id: loadingToast });
            } catch {
                toast.error('Failed to upload image', { id: loadingToast });
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleSmartExport = async () => {
        setIsExporting(true);
        const loadingToast = toast.loading('Optimizing & Exporting...');

        try {
            // 1. Get Stage Data URL (via custom event or direct access if possible, but event is cleaner for decoupling)
            // We'll use the existing event listener in AdCanvas but modify it to return data? 
            // Actually, simpler: Dispatch event, AdCanvas saves to a global variable or calls a callback?
            // Let's use a Promise-based approach with the event system for now, or just direct DOM access if needed.
            // BETTER: Dispatch event 'request-export-data', AdCanvas listens, generates blob, calls a callback on window.

            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    window.removeEventListener('export-data-ready', handleExportData);
                    reject(new Error('Export timed out. Please try again.'));
                }, 10000);

                const handleExportData = async (e) => {
                    clearTimeout(timeoutId);
                    window.removeEventListener('export-data-ready', handleExportData);
                    const imageBlob = e.detail;

                    try {
                        const result = await optimizeAndDownload(imageBlob);

                        // Trigger download
                        const link = document.createElement('a');
                        link.href = result.image;
                        link.download = `ad-design-${currentFormat.width}x${currentFormat.height}.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        toast.success(`Exported! Size: ${result.size_kb}KB`, { id: loadingToast });
                        resolve();
                    } catch (exportError) {
                        reject(exportError);
                    }
                };

                window.addEventListener('export-data-ready', handleExportData);
                window.dispatchEvent(new CustomEvent('request-export'));
            });

        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Export failed', { id: loadingToast });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            {/* Full-Screen Loading Overlay for PDF Analysis */}
            {isAnalyzing && (
                <div className="loading-overlay">
                    <div className="loading-spinner" />
                    <div className="loading-content">
                        <h2>Analyzing Guidelines</h2>
                        <p>AI is extracting compliance rules from your PDF...</p>
                    </div>
                    <div className="loading-steps">
                        <div className="loading-step done">
                            <div className="loading-step-icon">📄</div>
                            <span className="loading-step-label">Upload</span>
                        </div>
                        <div className="loading-step active">
                            <div className="loading-step-icon">🤖</div>
                            <span className="loading-step-label">AI Analysis</span>
                        </div>
                        <div className="loading-step">
                            <div className="loading-step-icon">✓</div>
                            <span className="loading-step-label">Apply Rules</span>
                        </div>
                    </div>
                </div>
            )}

            <div className={`sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'rgba(20, 22, 28, 0.95)',
                            color: '#fff',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '12px',
                            padding: '14px 20px',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                            },
                            style: {
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                            style: {
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                            },
                        },
                        loading: {
                            iconTheme: {
                                primary: '#6366f1',
                                secondary: 'rgba(99, 102, 241, 0.2)',
                            },
                            style: {
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                            },
                        },
                    }}
                />

                <div className="sidebar-header" onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}>
                    <div className="sidebar-header-logo">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                    </div>
                    <div>
                        <h2>AdGen Co-Pilot</h2>
                    </div>
                    <span>AI</span>
                </div>

                <div className="sidebar-content">
                    {/* Properties Panel (Dynamic) */}
                    {selectedElement ? (
                        <div className="sidebar-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <h3>Properties</h3>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                                    {selectedElement.type.toUpperCase()}
                                </span>
                            </div>

                            {selectedElement.type === 'text' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div className="input-group">
                                        <label><FiEdit3 /> Content</label>
                                        <textarea
                                            value={selectedElement.text}
                                            onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                                            rows={3}
                                            style={{
                                                width: '100%',
                                                background: 'var(--bg-dark)',
                                                border: '1px solid var(--border)',
                                                color: 'var(--text-main)',
                                                padding: 8,
                                                borderRadius: 6,
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div className="input-group">
                                            <label>Size (px)</label>
                                            <input
                                                type="number"
                                                value={selectedElement.fontSize}
                                                onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 12 })}
                                                style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: 8, borderRadius: 6 }}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Color</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <input
                                                    type="color"
                                                    value={selectedElement.fill}
                                                    onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                                                    style={{ width: 30, height: 30, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                                />
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedElement.fill}</span>
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>Font Family</label>
                                            <div className="font-grid">
                                                {['Inter', 'Outfit', 'Roboto', 'Poppins', 'Montserrat', 'Playfair Display', 'Oswald'].map(font => (
                                                    <button
                                                        key={font}
                                                        className={`font-option ${selectedElement.fontFamily === font ? 'active' : ''}`}
                                                        style={{ fontFamily: font }}
                                                        onClick={() => updateElement(selectedElement.id, { fontFamily: font })}
                                                    >
                                                        {font.split(' ')[0]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedElement.type === 'image' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div className="input-group">
                                        <label><FiMove /> Position</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            <input
                                                type="number"
                                                value={Math.round(selectedElement.x)}
                                                onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
                                                placeholder="X"
                                                style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: 8, borderRadius: 6 }}
                                            />
                                            <input
                                                type="number"
                                                value={Math.round(selectedElement.y)}
                                                onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
                                                placeholder="Y"
                                                style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: 8, borderRadius: 6 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                className="tool-btn"
                                onClick={() => removeElement(selectedElement.id)}
                                style={{ marginTop: 15, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                            >
                                <FiTrash2 />
                                <span>Delete Element</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Project Actions */}
                            <div className="sidebar-section">
                                <h3>Project</h3>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <button
                                        className="compact-btn"
                                        onClick={undo}
                                        disabled={!canUndo || !canUndo()}
                                        title="Undo (Ctrl+Z)"
                                    >
                                        <FiRotateCcw size={14} />
                                        <span>Undo</span>
                                    </button>
                                    <button
                                        className="compact-btn"
                                        onClick={redo}
                                        disabled={!canRedo || !canRedo()}
                                        title="Redo (Ctrl+Y)"
                                    >
                                        <FiRotateCw size={14} />
                                        <span>Redo</span>
                                    </button>
                                    <button
                                        className="compact-btn"
                                        onClick={handleSaveProject}
                                        title="Save (Ctrl+S)"
                                    >
                                        <FiSave size={14} />
                                        <span>Save</span>
                                    </button>
                                    <button
                                        className="compact-btn"
                                        onClick={() => setShowProjectMenu(!showProjectMenu)}
                                        title="Load Project"
                                    >
                                        <FiFolder size={14} />
                                        <span>Load</span>
                                    </button>
                                </div>
                                {showProjectMenu && (
                                    <div style={{ marginTop: 10, padding: 10, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>Saved Projects:</p>
                                        {getSavedProjects().length === 0 ? (
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>No saved projects</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                {getSavedProjects().map((p, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleLoadProject(p)}
                                                        style={{
                                                            padding: '8px 10px',
                                                            background: 'var(--bg-dark)',
                                                            border: '1px solid var(--border)',
                                                            borderRadius: 6,
                                                            color: 'var(--text-main)',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                            textAlign: 'left'
                                                        }}
                                                    >
                                                        {p.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => { newProject(); setShowProjectMenu(false); toast.success('New project created'); }}
                                            style={{
                                                marginTop: 8,
                                                width: '100%',
                                                padding: '8px 10px',
                                                background: 'var(--primary)',
                                                border: 'none',
                                                borderRadius: 6,
                                                color: 'white',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            + New Project
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Templates */}
                            <div className="sidebar-section">
                                <h3>Start</h3>
                                <button
                                    className="tool-btn"
                                    onClick={() => setShowTemplates(true)}
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    <FiGrid />
                                    <span>Browse Templates</span>
                                </button>
                            </div>

                            <div className="sidebar-section">
                                <h3>Canvas Format</h3>
                                <CustomDropdown
                                    options={availableFormats}
                                    value={{ width: currentFormat.width, height: currentFormat.height }}
                                    onChange={(format) => {
                                        const fullFormat = availableFormats.find(f =>
                                            f.width === format.width && f.height === format.height
                                        ) || format;
                                        setFormat(fullFormat);
                                    }}
                                />
                            </div>

                            {/* Layers */}
                            <div className="sidebar-section">
                                <h3>Layers</h3>
                                <LayerPanel />
                            </div>

                            <div className="sidebar-section">
                                <h3>Tools</h3>
                                <div className="tools-grid">
                                    <button data-tour="add-text" className="tool-btn" onClick={() => addElement({
                                        id: `text-${Date.now()}`,
                                        type: 'text',
                                        text: 'Double click to edit',
                                        x: currentFormat.width / 2 - 50,
                                        y: currentFormat.height / 2 - 10,
                                        fontSize: 24,
                                        fill: '#ffffff',
                                        rotation: 0,
                                        scaleX: 1,
                                        scaleY: 1
                                    })}>
                                        <FiType />
                                        <span>Add Text</span>
                                    </button>

                                    <label data-tour="upload-pdf" className="tool-btn">
                                        {isAnalyzing ? <FiLoader className="spin" /> : <FiFileText />}
                                        <span>{isAnalyzing ? 'Analyzing...' : 'Analyze PDF'}</span>
                                        <input
                                            type="file"
                                            hidden
                                            accept="application/pdf"
                                            onChange={handleAnalyzeGuideline}
                                            disabled={isAnalyzing}
                                        />
                                    </label>

                                    <button data-tour="export" className="tool-btn" onClick={handleSmartExport} disabled={isExporting}>
                                        {isExporting ? <FiLoader className="spin" /> : <FiDownload />}
                                        <span>{isExporting ? 'Optimizing...' : 'Export'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Visualization Tools - Always Visible */}
                            <div className="sidebar-section">
                                <h3>Visualization</h3>
                                <button
                                    data-tour="heatmap"
                                    className="tool-btn"
                                    onClick={toggleHeatmap}
                                    style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        background: heatmapVisible ? 'rgba(99, 102, 241, 0.2)' : undefined,
                                        borderColor: heatmapVisible ? 'var(--primary)' : undefined
                                    }}
                                >
                                    <FiLayers />
                                    <span>{heatmapVisible ? 'Hide Heatmap' : 'Show Heatmap'}</span>
                                </button>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                                    Visualize attention hotspots on your design
                                </p>
                            </div>
                        </>
                    )}

                    {guidelines && (
                        <div className="sidebar-section">
                            <h3>Guidelines: {guidelines.retailer_name || 'Custom'}</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 15 }}>
                                <button className="tool-btn" onClick={toggleSafeZone} style={{ justifyContent: 'center', minHeight: 60 }}>
                                    {showSafeZone ? <FiEyeOff /> : <FiEye />}
                                    <span>Safe Zone</span>
                                </button>
                                <button className="tool-btn" onClick={toggleHeatmap} style={{ justifyContent: 'center', minHeight: 60, borderColor: heatmapVisible ? 'var(--primary)' : undefined }}>
                                    <FiLayers />
                                    <span>Heatmap</span>
                                </button>
                            </div>

                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 15, background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 6 }}>
                                <p style={{ margin: '0 0 5px 0' }}><strong>Max Size:</strong> {guidelines.constraints?.max_file_size_kb || 500}KB</p>
                                <p style={{ margin: 0 }}><strong>Formats:</strong> {guidelines.constraints?.allowed_file_types?.join(', ') || 'JPG'}</p>
                            </div>

                            {guidelines.constraints?.recommended_colors?.length > 0 && (
                                <div style={{ marginBottom: 15 }}>
                                    <p style={{ fontSize: '0.8rem', marginBottom: 8, color: 'var(--text-muted)' }}>Brand Colors:</p>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                                        {guidelines.constraints.recommended_colors.map((color, i) => (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    setBackground(color);
                                                    setBaseColor(color);
                                                    // Reset brightness slider when picking a new color
                                                    const slider = document.getElementById('brightness-slider');
                                                    if (slider) slider.value = 0;
                                                    toast.success(`Background set to ${color}`);
                                                }}
                                                title={color}
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    backgroundColor: color,
                                                    borderRadius: '50%',
                                                    cursor: 'pointer',
                                                    border: '2px solid rgba(255,255,255,0.2)',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                        ))}
                                    </div>

                                    {/* Contrast/Brightness Slider */}
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Adjust Contrast / Brightness</span>
                                            <span style={{ opacity: 0.5 }}>+/-</span>
                                        </label>
                                        <input
                                            id="brightness-slider"
                                            type="range"
                                            min="-50"
                                            max="50"
                                            defaultValue="0"
                                            onInput={(e) => {
                                                // Helper to adjust brightness of a hex color
                                                const adjustBrightness = (hex, percent) => {
                                                    // Convert hex to RGB
                                                    let r = parseInt(hex.slice(1, 3), 16);
                                                    let g = parseInt(hex.slice(3, 5), 16);
                                                    let b = parseInt(hex.slice(5, 7), 16);

                                                    // Convert RGB to HSL
                                                    r /= 255;
                                                    g /= 255;
                                                    b /= 255;
                                                    const max = Math.max(r, g, b);
                                                    const min = Math.min(r, g, b);
                                                    let h, s, l = (max + min) / 2;

                                                    if (max === min) {
                                                        h = s = 0; // achromatic
                                                    } else {
                                                        const d = max - min;
                                                        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                                                        switch (max) {
                                                            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                                                            case g: h = (b - r) / d + 2; break;
                                                            case b: h = (r - g) / d + 4; break;
                                                        }
                                                        h /= 6;
                                                    }

                                                    // Adjust lightness
                                                    l = Math.max(0, Math.min(1, l + percent / 100)); // Ensure lightness stays between 0 and 1

                                                    // Convert HSL back to RGB
                                                    const hue2rgb = (p, q, t) => {
                                                        if (t < 0) t += 1;
                                                        if (t > 1) t -= 1;
                                                        if (t < 1 / 6) return p + (q - p) * 6 * t;
                                                        if (t < 1 / 2) return q;
                                                        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                                                        return p;
                                                    };

                                                    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                                                    const p = 2 * l - q;
                                                    r = hue2rgb(p, q, h + 1 / 3);
                                                    g = hue2rgb(p, q, h);
                                                    b = hue2rgb(p, q, h - 1 / 3);

                                                    // Convert RGB to hex
                                                    const toHex = (c) => {
                                                        const hex = Math.round(c * 255).toString(16);
                                                        return hex.length === 1 ? '0' + hex : hex;
                                                    };

                                                    return '#' + toHex(r) + toHex(g) + toHex(b);
                                                };

                                                const handleBrightnessChange = (value) => {
                                                    const percent = parseInt(value);
                                                    if (baseColor) {
                                                        const newColor = adjustBrightness(baseColor, percent);
                                                        setBackground(newColor);
                                                    }
                                                };
                                                handleBrightnessChange(e.target.value);
                                            }}
                                            style={{ width: '100%', cursor: 'pointer' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {guidelines.constraints?.forbidden_content?.length > 0 && (
                                <div>
                                    <p style={{ fontSize: '0.8rem', marginBottom: 8, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <FiAlertCircle /> Forbidden Content:
                                    </p>
                                    <ul style={{ paddingLeft: 20, margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {guidelines.constraints.forbidden_content.map((item, i) => (
                                            <li key={i} style={{ marginBottom: 4 }}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="sidebar-section">
                        <h3>Assets</h3>
                        <label data-tour="upload-image" className={`upload-btn ${isUploading ? 'disabled' : ''}`}>
                            {isUploading ? <FiLoader className="spin" /> : <FiUpload />}
                            {isUploading ? 'Uploading...' : 'Upload Image'}
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                hidden
                                accept="image/*"
                                disabled={isUploading}
                            />
                        </label>
                    </div>

                    <div className="sidebar-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <h3>Library</h3>
                        {uploadedImages.length === 0 ? (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-muted)',
                                border: '1px dashed var(--border)',
                                borderRadius: 'var(--radius)',
                                padding: 20
                            }}>
                                <FiImage style={{ fontSize: 24, marginBottom: 8, opacity: 0.5 }} />
                                <p style={{ fontSize: '0.8rem', margin: 0 }}>No images yet</p>
                            </div>
                        ) : (
                            <div className="assets-grid">
                                {uploadedImages.map((src, index) => (
                                    <div key={index} className="asset-wrapper">
                                        <img
                                            src={src}
                                            alt={`asset-${index}`}
                                            draggable="true"
                                            onDragStart={(e) => handleDragStart(e, src)}
                                            className="asset-thumb"
                                            crossOrigin="anonymous"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Toggle Button */}
            <button
                className="mobile-nav-toggle"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                aria-label="Toggle sidebar"
            >
                {isMobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Template Gallery Modal */}
            <TemplateGallery
                isOpen={showTemplates}
                onClose={() => setShowTemplates(false)}
            />
        </>
    );
};

export default Sidebar;
