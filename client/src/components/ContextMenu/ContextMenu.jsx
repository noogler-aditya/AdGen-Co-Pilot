import React from 'react';
import { FiCopy, FiTrash2, FiChevronUp, FiChevronDown, FiArrowUpCircle, FiArrowDownCircle } from 'react-icons/fi';
import useAdStore from '../../store/useAdStore';

const ContextMenu = ({ x, y, elementId, onClose }) => {
    const {
        duplicateElement,
        removeElement,
        bringToFront,
        sendToBack,
        moveUp,
        moveDown
    } = useAdStore();

    const handleAction = (action) => {
        action();
        onClose();
    };

    return (
        <>
            <div className="context-menu-overlay" onClick={onClose} />
            <div
                className="context-menu"
                style={{
                    left: x,
                    top: y
                }}
            >
                <button
                    className="context-menu-item"
                    onClick={() => handleAction(() => duplicateElement(elementId))}
                >
                    <FiCopy size={14} />
                    <span>Duplicate</span>
                    <span className="shortcut">⌘D</span>
                </button>

                <div className="context-menu-divider" />

                <button
                    className="context-menu-item"
                    onClick={() => handleAction(() => bringToFront(elementId))}
                >
                    <FiArrowUpCircle size={14} />
                    <span>Bring to Front</span>
                </button>
                <button
                    className="context-menu-item"
                    onClick={() => handleAction(() => moveUp(elementId))}
                >
                    <FiChevronUp size={14} />
                    <span>Move Up</span>
                </button>
                <button
                    className="context-menu-item"
                    onClick={() => handleAction(() => moveDown(elementId))}
                >
                    <FiChevronDown size={14} />
                    <span>Move Down</span>
                </button>
                <button
                    className="context-menu-item"
                    onClick={() => handleAction(() => sendToBack(elementId))}
                >
                    <FiArrowDownCircle size={14} />
                    <span>Send to Back</span>
                </button>

                <div className="context-menu-divider" />

                <button
                    className="context-menu-item delete"
                    onClick={() => handleAction(() => removeElement(elementId))}
                >
                    <FiTrash2 size={14} />
                    <span>Delete</span>
                    <span className="shortcut">⌫</span>
                </button>
            </div>
        </>
    );
};

export default ContextMenu;
