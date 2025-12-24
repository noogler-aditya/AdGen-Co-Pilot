import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck, FiMonitor } from 'react-icons/fi';

const CustomDropdown = ({ options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Find current selected option
    const selectedOption = options.find(opt =>
        JSON.stringify({ width: opt.width, height: opt.height }) === JSON.stringify(value)
    ) || options[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange({ width: option.width, height: option.height });
        setIsOpen(false);
    };

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <div className="dropdown-trigger-content">
                    <FiMonitor className="dropdown-icon" />
                    <div className="dropdown-trigger-text">
                        <span className="dropdown-label">{selectedOption?.label || 'Select format'}</span>
                        <span className="dropdown-size">{selectedOption?.width} × {selectedOption?.height}px</span>
                    </div>
                </div>
                <FiChevronDown className={`dropdown-chevron ${isOpen ? 'rotated' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-menu-header">
                        <span>Select Canvas Size</span>
                    </div>
                    <div className="dropdown-options">
                        {options.map((option, index) => {
                            const isSelected = selectedOption?.width === option.width &&
                                selectedOption?.height === option.height;
                            return (
                                <button
                                    key={index}
                                    className={`dropdown-option ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleSelect(option)}
                                    type="button"
                                >
                                    <div className="option-info">
                                        <span className="option-label">{option.label}</span>
                                        <span className="option-size">{option.width} × {option.height}</span>
                                    </div>
                                    {isSelected && <FiCheck className="option-check" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
