import React, { useState } from 'react';
import { uploadImage, analyzeGuideline, optimizeAndDownload } from '../../services/api';
import useAdStore from '../../store/useAdStore';
import { FiType, FiDownload, FiFileText, FiUpload, FiImage, FiLoader, FiMaximize, FiEye, FiEyeOff, FiAlertCircle, FiTrash2, FiEdit3, FiMove } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const Sidebar = () => {
    const { addElement, setGuidelines, guidelines, showSafeZone, toggleSafeZone, setBackground, availableFormats, currentFormat, setFormat, selectedId, elements, updateElement, removeElement } = useAdStore();
    const [uploadedImages, setUploadedImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const selectedElement = elements.find(el => el.id === selectedId);

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
        const loadingToast = toast.loading('Uploading image...');

        try {
            const data = await uploadImage(file);
            setUploadedImages(prev => [...prev, data.url]);
            toast.success('Image uploaded successfully', { id: loadingToast });
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload image', { id: loadingToast });
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
                    } catch (err) {
                        reject(err);
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
        <div className="sidebar">
            <Toaster position="top-center" toastOptions={{
                style: {
                    background: '#333',
                    color: '#fff',
                },
            }} />

            <div className="sidebar-header">
                <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg, #6366f1 0%, #a5b4fc 100%)', borderRadius: 6 }}></div>
                <h2>AdGen Co-Pilot</h2>
            </div>

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
                    <div className="sidebar-section">
                        <h3>Format</h3>
                        <div className="format-selector">
                            <select
                                value={JSON.stringify({ width: currentFormat.width, height: currentFormat.height })} // Simple way to track value
                                onChange={(e) => {
                                    const format = availableFormats.find(f =>
                                        JSON.stringify({ width: f.width, height: f.height }) === JSON.stringify(JSON.parse(e.target.value)) // Match dimensions
                                    ) || JSON.parse(e.target.value);
                                    setFormat(format);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: 'var(--bg-dark)',
                                    color: 'var(--text-main)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    marginBottom: '10px'
                                }}
                            >
                                {availableFormats.map((f, i) => (
                                    <option key={i} value={JSON.stringify({ width: f.width, height: f.height })}>
                                        {f.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3>Tools</h3>
                        <div className="tools-grid">
                            <button className="tool-btn" onClick={() => addElement({
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

                            <label className="tool-btn">
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

                            <button className="tool-btn" onClick={handleSmartExport} disabled={isExporting}>
                                {isExporting ? <FiLoader className="spin" /> : <FiDownload />}
                                <span>{isExporting ? 'Optimizing...' : 'Export'}</span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {guidelines && (
                <div className="sidebar-section">
                    <h3>Guidelines: {guidelines.retailer_name || 'Custom'}</h3>

                    <button className="tool-btn" onClick={toggleSafeZone} style={{ marginBottom: 15, width: '100%', justifyContent: 'center' }}>
                        {showSafeZone ? <FiEyeOff /> : <FiEye />}
                        <span>{showSafeZone ? 'Hide Safe Zone' : 'Show Safe Zone'}</span>
                    </button>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 15, background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 6 }}>
                        <p style={{ margin: '0 0 5px 0' }}><strong>Max Size:</strong> {guidelines.constraints?.max_file_size_kb || 500}KB</p>
                        <p style={{ margin: 0 }}><strong>Formats:</strong> {guidelines.constraints?.allowed_file_types?.join(', ') || 'JPG'}</p>
                    </div>

                    {guidelines.constraints?.recommended_colors?.length > 0 && (
                        <div style={{ marginBottom: 15 }}>
                            <p style={{ fontSize: '0.8rem', marginBottom: 8, color: 'var(--text-muted)' }}>Brand Colors:</p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {guidelines.constraints.recommended_colors.map((color, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            setBackground(color);
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
                <label className={`upload-btn ${isUploading ? 'disabled' : ''}`}>
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
    );
};

export default Sidebar;
