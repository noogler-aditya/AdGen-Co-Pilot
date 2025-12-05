import { create } from 'zustand';

const useAdStore = create((set) => ({
    background: '#ffffff',
    elements: [], // { id, type: 'image' | 'text', x, y, rotation, scaleX, scaleY, src, ... }
    selectedId: null,
    guidelines: null, // { safe_zone_margin_px, ... }
    showSafeZone: false,
    currentFormat: { width: 800, height: 600, label: 'Default (800x600)' },
    availableFormats: [
        { width: 800, height: 600, label: 'Default (800x600)' },
        { width: 1080, height: 1080, label: 'Square (1080x1080)' },
        { width: 1200, height: 628, label: 'Landscape (1200x628)' },
        { width: 1080, height: 1920, label: 'Story (1080x1920)' }
    ],

    setGuidelines: (rules) => set((state) => {
        let newFormats = state.availableFormats;
        let initialFormat = state.currentFormat;

        if (rules.ad_formats && rules.ad_formats.length > 0) {
            // Map API formats to our structure
            const extractedFormats = rules.ad_formats.map(f => ({
                width: f.width_px,
                height: f.height_px,
                label: `${f.type || 'Custom'} (${f.width_px}x${f.height_px})`
            }));

            // Merge with defaults, putting extracted ones first
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

        // Smart Anchoring Logic
        const newElements = state.elements.map(el => {
            let newX = el.x;
            let newY = el.y;

            // X-Axis Anchoring
            const relativeX = el.x / oldWidth;
            if (relativeX < 0.33) {
                // Left Anchor: Keep x as is
                newX = el.x;
            } else if (relativeX > 0.66) {
                // Right Anchor: Maintain distance from right edge
                const distFromRight = oldWidth - el.x;
                newX = newWidth - distFromRight;
            } else {
                // Center Anchor: Maintain relative center
                const distFromCenter = el.x - (oldWidth / 2);
                newX = (newWidth / 2) + distFromCenter;
            }

            // Y-Axis Anchoring
            const relativeY = el.y / oldHeight;
            if (relativeY < 0.33) {
                // Top Anchor: Keep y as is
                newY = el.y;
            } else if (relativeY > 0.66) {
                // Bottom Anchor: Maintain distance from bottom edge
                const distFromBottom = oldHeight - el.y;
                newY = newHeight - distFromBottom;
            } else {
                // Center Anchor: Maintain relative center
                const distFromCenter = el.y - (oldHeight / 2);
                newY = (newHeight / 2) + distFromCenter;
            }

            // Auto-Scaling Logic (Preserve Layout)
            // Calculate how much the canvas shrank/grew
            const widthRatio = newWidth / oldWidth;
            const heightRatio = newHeight / oldHeight;

            // Use the smaller ratio to ensure it fits (contain strategy)
            // But don't scale up too aggressively to avoid pixelation
            let scaleFactor = Math.min(widthRatio, heightRatio);

            // Clamp scale factor to avoid extreme shrinking/growing
            // e.g. if switching to a tiny banner, we must shrink.
            // if switching to a huge billboard, we scale up.

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

    setBackground: (color) => set({ background: color }),

    addElement: (element) => set((state) => ({
        elements: [...state.elements, element],
        selectedId: element.id
    })),

    updateElement: (id, newAttrs) => set((state) => ({
        elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...newAttrs } : el
        )
    })),

    selectElement: (id) => set({ selectedId: id }),

    deselectElement: () => set({ selectedId: null }),

    removeElement: (id) => set((state) => ({
        elements: state.elements.filter((el) => el.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId
    })),
}));

export default useAdStore;
