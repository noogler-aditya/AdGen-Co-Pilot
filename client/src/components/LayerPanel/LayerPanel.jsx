import React from 'react';
import { FiImage, FiType, FiChevronUp, FiChevronDown, FiTrash2, FiCopy, FiEye, FiEyeOff } from 'react-icons/fi';
import useAdStore from '../../store/useAdStore';

const LayerPanel = () => {
    const {
        elements,
        selectedIds,
        selectElement,
        moveUp,
        moveDown,
        duplicateElement,
        removeElement
    } = useAdStore();

    // Sort by zIndex for display (highest first = top of list)
    const sortedElements = [...elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

    if (elements.length === 0) {
        return (
            <div className="layer-panel-empty">
                <p>No layers yet</p>
                <span>Add elements to see them here</span>
            </div>
        );
    }

    return (
        <div className="layer-panel">
            <div className="layer-list">
                {sortedElements.map((element, idx) => {
                    const isSelected = selectedIds.includes(element.id);
                    const isImage = element.type === 'image';
                    const label = isImage
                        ? `Image ${idx + 1}`
                        : (element.text?.substring(0, 15) || 'Text') + (element.text?.length > 15 ? '...' : '');

                    return (
                        <div
                            key={element.id}
                            className={`layer-item ${isSelected ? 'selected' : ''}`}
                            onClick={(e) => selectElement(element.id, e.shiftKey)}
                        >
                            <div className="layer-icon">
                                {isImage ? <FiImage size={14} /> : <FiType size={14} />}
                            </div>
                            <span className="layer-name">{label}</span>
                            <div className="layer-actions">
                                <button
                                    className="layer-action-btn"
                                    onClick={(e) => { e.stopPropagation(); moveUp(element.id); }}
                                    title="Move Up"
                                >
                                    <FiChevronUp size={12} />
                                </button>
                                <button
                                    className="layer-action-btn"
                                    onClick={(e) => { e.stopPropagation(); moveDown(element.id); }}
                                    title="Move Down"
                                >
                                    <FiChevronDown size={12} />
                                </button>
                                <button
                                    className="layer-action-btn"
                                    onClick={(e) => { e.stopPropagation(); duplicateElement(element.id); }}
                                    title="Duplicate"
                                >
                                    <FiCopy size={12} />
                                </button>
                                <button
                                    className="layer-action-btn delete"
                                    onClick={(e) => { e.stopPropagation(); removeElement(element.id); }}
                                    title="Delete"
                                >
                                    <FiTrash2 size={12} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LayerPanel;
