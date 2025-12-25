import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// History management for undo/redo
const MAX_HISTORY = 50;

const useAdStore = create(
    persist(
        (set, get) => ({
            // Core State
            background: '#ffffff',
            elements: [],
            selectedIds: [], // Changed to array for multi-select
            guidelines: null,
            showSafeZone: false,
            heatmapVisible: false,
            currentFormat: { width: 800, height: 600, label: 'Default (800x600)' },
            availableFormats: [
                { width: 800, height: 600, label: 'Default (800x600)' },
                { width: 1080, height: 1080, label: 'Square (1080x1080)' },
                { width: 1200, height: 628, label: 'Landscape (1200x628)' },
                { width: 1080, height: 1920, label: 'Story (1080x1920)' }
            ],

            // Compliance State
            complianceViolations: [],
            showCompliancePanel: true,

            // Theme
            theme: 'dark', // 'dark' or 'light'

            // History for Undo/Redo
            history: [],
            historyIndex: -1,

            // Project metadata
            projectName: 'Untitled Project',
            lastSaved: null,

            // Backward compatibility
            get selectedId() {
                const state = get();
                return state.selectedIds.length > 0 ? state.selectedIds[0] : null;
            },

            // ==================== UNDO/REDO ====================
            pushHistory: () => set((state) => {
                const snapshot = {
                    elements: JSON.parse(JSON.stringify(state.elements)),
                    background: state.background
                };
                const newHistory = state.history.slice(0, state.historyIndex + 1);
                newHistory.push(snapshot);
                if (newHistory.length > MAX_HISTORY) newHistory.shift();
                return {
                    history: newHistory,
                    historyIndex: newHistory.length - 1
                };
            }),

            undo: () => set((state) => {
                if (state.historyIndex <= 0) return state;
                const prevIndex = state.historyIndex - 1;
                const snapshot = state.history[prevIndex];
                return {
                    elements: JSON.parse(JSON.stringify(snapshot.elements)),
                    background: snapshot.background,
                    historyIndex: prevIndex,
                    selectedIds: []
                };
            }),

            redo: () => set((state) => {
                if (state.historyIndex >= state.history.length - 1) return state;
                const nextIndex = state.historyIndex + 1;
                const snapshot = state.history[nextIndex];
                return {
                    elements: JSON.parse(JSON.stringify(snapshot.elements)),
                    background: snapshot.background,
                    historyIndex: nextIndex,
                    selectedIds: []
                };
            }),

            canUndo: () => get().historyIndex > 0,
            canRedo: () => get().historyIndex < get().history.length - 1,

            // ==================== ELEMENT ACTIONS ====================
            addElement: (element) => set((state) => {
                get().pushHistory();
                return {
                    elements: [...state.elements, { ...element, zIndex: state.elements.length }],
                    selectedIds: [element.id]
                };
            }),

            updateElement: (id, newAttrs) => set((state) => ({
                elements: state.elements.map((el) =>
                    el.id === id ? { ...el, ...newAttrs } : el
                )
            })),

            removeElement: (id) => set((state) => {
                get().pushHistory();
                return {
                    elements: state.elements.filter((el) => el.id !== id),
                    selectedIds: state.selectedIds.filter(sid => sid !== id)
                };
            }),

            duplicateElement: (id) => set((state) => {
                get().pushHistory();
                const element = state.elements.find(el => el.id === id);
                if (!element) return state;
                const newElement = {
                    ...element,
                    id: `${element.type}-${Date.now()}`,
                    x: element.x + 20,
                    y: element.y + 20,
                    zIndex: state.elements.length
                };
                return {
                    elements: [...state.elements, newElement],
                    selectedIds: [newElement.id]
                };
            }),

            // ==================== MULTI-SELECT ====================
            selectElement: (id, addToSelection = false) => set((state) => {
                if (addToSelection) {
                    if (state.selectedIds.includes(id)) {
                        return { selectedIds: state.selectedIds.filter(sid => sid !== id) };
                    }
                    return { selectedIds: [...state.selectedIds, id] };
                }
                return { selectedIds: [id] };
            }),

            selectMultiple: (ids) => set({ selectedIds: ids }),

            deselectElement: () => set({ selectedIds: [] }),

            selectAll: () => set((state) => ({
                selectedIds: state.elements.map(el => el.id)
            })),

            deleteSelected: () => set((state) => {
                if (state.selectedIds.length === 0) return state;
                get().pushHistory();
                return {
                    elements: state.elements.filter(el => !state.selectedIds.includes(el.id)),
                    selectedIds: []
                };
            }),

            // ==================== LAYER CONTROL ====================
            bringToFront: (id) => set((state) => {
                get().pushHistory();
                const maxZ = Math.max(...state.elements.map(el => el.zIndex || 0));
                return {
                    elements: state.elements.map(el =>
                        el.id === id ? { ...el, zIndex: maxZ + 1 } : el
                    )
                };
            }),

            sendToBack: (id) => set((state) => {
                get().pushHistory();
                const minZ = Math.min(...state.elements.map(el => el.zIndex || 0));
                return {
                    elements: state.elements.map(el =>
                        el.id === id ? { ...el, zIndex: minZ - 1 } : el
                    )
                };
            }),

            moveUp: (id) => set((state) => {
                get().pushHistory();
                const sorted = [...state.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
                const idx = sorted.findIndex(el => el.id === id);
                if (idx === sorted.length - 1) return state;
                const currentZ = sorted[idx].zIndex || 0;
                const nextZ = sorted[idx + 1].zIndex || 0;
                return {
                    elements: state.elements.map(el => {
                        if (el.id === id) return { ...el, zIndex: nextZ };
                        if (el.id === sorted[idx + 1].id) return { ...el, zIndex: currentZ };
                        return el;
                    })
                };
            }),

            moveDown: (id) => set((state) => {
                get().pushHistory();
                const sorted = [...state.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
                const idx = sorted.findIndex(el => el.id === id);
                if (idx === 0) return state;
                const currentZ = sorted[idx].zIndex || 0;
                const prevZ = sorted[idx - 1].zIndex || 0;
                return {
                    elements: state.elements.map(el => {
                        if (el.id === id) return { ...el, zIndex: prevZ };
                        if (el.id === sorted[idx - 1].id) return { ...el, zIndex: currentZ };
                        return el;
                    })
                };
            }),

            // ==================== PROJECT MANAGEMENT ====================
            setProjectName: (name) => set({ projectName: name }),

            saveProject: () => {
                const state = get();
                const project = {
                    name: state.projectName,
                    elements: state.elements,
                    background: state.background,
                    currentFormat: state.currentFormat,
                    guidelines: state.guidelines,
                    savedAt: new Date().toISOString()
                };
                const projects = JSON.parse(localStorage.getItem('adgen-projects') || '[]');
                const existingIdx = projects.findIndex(p => p.name === state.projectName);
                if (existingIdx >= 0) {
                    projects[existingIdx] = project;
                } else {
                    projects.push(project);
                }
                localStorage.setItem('adgen-projects', JSON.stringify(projects));
                set({ lastSaved: project.savedAt });
                return project;
            },

            loadProject: (project) => set({
                projectName: project.name,
                elements: project.elements || [],
                background: project.background || '#ffffff',
                currentFormat: project.currentFormat || { width: 800, height: 600, label: 'Default (800x600)' },
                guidelines: project.guidelines || null,
                lastSaved: project.savedAt,
                selectedIds: [],
                history: [],
                historyIndex: -1
            }),

            getSavedProjects: () => {
                return JSON.parse(localStorage.getItem('adgen-projects') || '[]');
            },

            deleteProject: (name) => {
                const projects = JSON.parse(localStorage.getItem('adgen-projects') || '[]');
                const filtered = projects.filter(p => p.name !== name);
                localStorage.setItem('adgen-projects', JSON.stringify(filtered));
            },

            newProject: () => set({
                projectName: 'Untitled Project',
                elements: [],
                background: '#ffffff',
                guidelines: null,
                selectedIds: [],
                history: [],
                historyIndex: -1,
                lastSaved: null
            }),

            // ==================== EXISTING ACTIONS ====================
            setGuidelines: (rules) => set((state) => {
                let newFormats = state.availableFormats;
                let initialFormat = state.currentFormat;

                if (rules.ad_formats && rules.ad_formats.length > 0) {
                    const extractedFormats = rules.ad_formats.map(f => ({
                        width: f.width_px,
                        height: f.height_px,
                        label: `${f.type || 'Custom'} (${f.width_px}x${f.height_px})`
                    }));
                    newFormats = [...extractedFormats, ...state.availableFormats];
                    initialFormat = extractedFormats[0];
                }

                return {
                    guidelines: rules,
                    showSafeZone: true,
                    availableFormats: newFormats,
                    currentFormat: initialFormat
                };
            }),

            setFormat: (format) => set((state) => {
                const oldWidth = state.currentFormat.width;
                const oldHeight = state.currentFormat.height;
                const newWidth = format.width;
                const newHeight = format.height;

                const newElements = state.elements.map(el => {
                    let newX = el.x;
                    let newY = el.y;

                    const relativeX = el.x / oldWidth;
                    if (relativeX < 0.33) {
                        newX = el.x;
                    } else if (relativeX > 0.66) {
                        const distFromRight = oldWidth - el.x;
                        newX = newWidth - distFromRight;
                    } else {
                        const distFromCenter = el.x - (oldWidth / 2);
                        newX = (newWidth / 2) + distFromCenter;
                    }

                    const relativeY = el.y / oldHeight;
                    if (relativeY < 0.33) {
                        newY = el.y;
                    } else if (relativeY > 0.66) {
                        const distFromBottom = oldHeight - el.y;
                        newY = newHeight - distFromBottom;
                    } else {
                        const distFromCenter = el.y - (oldHeight / 2);
                        newY = (newHeight / 2) + distFromCenter;
                    }

                    const widthRatio = newWidth / oldWidth;
                    const heightRatio = newHeight / oldHeight;
                    let scaleFactor = Math.min(widthRatio, heightRatio);

                    return {
                        ...el,
                        x: newX,
                        y: newY,
                        scaleX: el.scaleX * scaleFactor,
                        scaleY: el.scaleY * scaleFactor
                    };
                });

                return {
                    currentFormat: format,
                    elements: newElements
                };
            }),

            toggleSafeZone: () => set((state) => ({ showSafeZone: !state.showSafeZone })),
            toggleHeatmap: () => set((state) => ({ heatmapVisible: !state.heatmapVisible })),
            setBackground: (color) => set({ background: color }),

            // ==================== THEME ====================
            toggleTheme: () => set((state) => ({
                theme: state.theme === 'dark' ? 'light' : 'dark'
            })),
            setTheme: (theme) => set({ theme }),

            // ==================== COMPLIANCE PANEL ====================
            toggleCompliancePanel: () => set((state) => ({
                showCompliancePanel: !state.showCompliancePanel
            })),

            // ==================== COMPLIANCE CHECKING ====================
            checkCompliance: () => {
                const state = get();
                const { elements, guidelines, currentFormat } = state;
                const violations = [];

                if (!guidelines) {
                    set({ complianceViolations: [] });
                    return [];
                }

                const safeZone = guidelines.safe_zone || { top: 10, bottom: 10, left: 10, right: 10 };
                const safeZonePixels = {
                    top: (safeZone.top / 100) * currentFormat.height,
                    bottom: currentFormat.height - ((safeZone.bottom / 100) * currentFormat.height),
                    left: (safeZone.left / 100) * currentFormat.width,
                    right: currentFormat.width - ((safeZone.right / 100) * currentFormat.width)
                };

                elements.forEach(el => {
                    const elWidth = (el.width || 100) * (el.scaleX || 1);
                    const elHeight = (el.height || 100) * (el.scaleY || 1);
                    const elRight = el.x + elWidth;
                    const elBottom = el.y + elHeight;

                    // Safe Zone Violation Check
                    if (el.x < safeZonePixels.left) {
                        violations.push({
                            elementId: el.id,
                            type: 'safe_zone',
                            severity: 'error',
                            message: `Element "${el.type === 'text' ? el.text?.substring(0, 20) : 'Image'}" extends into left safe zone`,
                            rule: `Keep elements at least ${safeZone.left}% from left edge`
                        });
                    }

                    if (elRight > safeZonePixels.right) {
                        violations.push({
                            elementId: el.id,
                            type: 'safe_zone',
                            severity: 'error',
                            message: `Element "${el.type === 'text' ? el.text?.substring(0, 20) : 'Image'}" extends into right safe zone`,
                            rule: `Keep elements at least ${safeZone.right}% from right edge`
                        });
                    }

                    if (el.y < safeZonePixels.top) {
                        violations.push({
                            elementId: el.id,
                            type: 'safe_zone',
                            severity: 'error',
                            message: `Element "${el.type === 'text' ? el.text?.substring(0, 20) : 'Image'}" extends into top safe zone`,
                            rule: `Keep elements at least ${safeZone.top}% from top edge`
                        });
                    }

                    if (elBottom > safeZonePixels.bottom) {
                        violations.push({
                            elementId: el.id,
                            type: 'safe_zone',
                            severity: 'error',
                            message: `Element "${el.type === 'text' ? el.text?.substring(0, 20) : 'Image'}" extends into bottom safe zone`,
                            rule: `Keep elements at least ${safeZone.bottom}% from bottom edge`
                        });
                    }

                    // Text-specific checks
                    if (el.type === 'text' && guidelines.text_requirements) {
                        const textReqs = guidelines.text_requirements;

                        // Font size check
                        if (textReqs.min_font_size && el.fontSize < textReqs.min_font_size) {
                            violations.push({
                                elementId: el.id,
                                type: 'text',
                                severity: 'warning',
                                message: `Text "${el.text?.substring(0, 20)}..." font size (${el.fontSize}px) is below minimum`,
                                rule: `Minimum font size: ${textReqs.min_font_size}px`
                            });
                        }

                        // Max text length check
                        if (textReqs.max_characters && el.text && el.text.length > textReqs.max_characters) {
                            violations.push({
                                elementId: el.id,
                                type: 'text',
                                severity: 'warning',
                                message: `Text exceeds maximum character limit (${el.text.length}/${textReqs.max_characters})`,
                                rule: `Maximum ${textReqs.max_characters} characters allowed`
                            });
                        }
                    }

                    // Image-specific checks
                    if (el.type === 'image' && guidelines.image_requirements) {
                        const imgReqs = guidelines.image_requirements;

                        // Minimum size check
                        if (imgReqs.min_width && elWidth < imgReqs.min_width) {
                            violations.push({
                                elementId: el.id,
                                type: 'image',
                                severity: 'warning',
                                message: `Image width (${Math.round(elWidth)}px) is below minimum`,
                                rule: `Minimum image width: ${imgReqs.min_width}px`
                            });
                        }
                    }
                });

                // File size warning (based on guidelines)
                if (guidelines.file_size_max_kb) {
                    const imageCount = elements.filter(el => el.type === 'image').length;
                    if (imageCount > 3) {
                        violations.push({
                            elementId: null,
                            type: 'file_size',
                            severity: 'warning',
                            message: `${imageCount} images may exceed ${guidelines.file_size_max_kb}KB limit`,
                            rule: `Consider reducing image count or using compression`
                        });
                    }
                }

                set({ complianceViolations: violations });
                return violations;
            },

            getViolationsForElement: (elementId) => {
                return get().complianceViolations.filter(v => v.elementId === elementId);
            },

            hasViolations: () => get().complianceViolations.length > 0,

            getErrorCount: () => get().complianceViolations.filter(v => v.severity === 'error').length,
            getWarningCount: () => get().complianceViolations.filter(v => v.severity === 'warning').length,
        }),
        {
            name: 'adgen-store',
            partialize: (state) => ({
                elements: state.elements,
                background: state.background,
                currentFormat: state.currentFormat,
                projectName: state.projectName,
                theme: state.theme
            })
        }
    )
);

export default useAdStore;
