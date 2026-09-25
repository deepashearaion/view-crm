import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const OwnerFilter = ({ defaultLabel = 'All Owners', onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState(defaultLabel);
    const [hoveredItem, setHoveredItem] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (label) => {
        setSelectedLabel(label);
        setIsOpen(false);
        if (onSelect) onSelect(label);
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative', flex: 1, display: 'flex' }}>
            <div
                className="filter-dropdown owner-filter"
                style={{
                    flex: 1,
                    justifyContent: 'space-between',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    height: '34px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#fff',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                    whiteSpace: 'nowrap',
                    gap: '8px'
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>{selectedLabel}</span>
                <ChevronDown size={14} className="filter-icon-right" style={{ color: '#6B7280', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: '0',
                    width: '100%',
                    minWidth: '180px',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    zIndex: 999
                }}>
                    <div
                        style={{
                            padding: '12px 16px',
                            backgroundColor: hoveredItem === 'default' ? '#F3F4F6' : '#FFFFFF',
                            fontSize: '0.85rem',
                            color: '#111827',
                            borderTopLeftRadius: '5px',
                            borderTopRightRadius: '5px',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={() => setHoveredItem('default')}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => handleSelect(defaultLabel)}
                    >
                        {defaultLabel}
                    </div>
                    <div
                        style={{
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            backgroundColor: hoveredItem === 'arun' ? '#F3F4F6' : '#FFFFFF',
                            borderBottomLeftRadius: '5px',
                            borderBottomRightRadius: '5px'
                        }}
                        onMouseEnter={() => setHoveredItem('arun')}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => handleSelect('Arun')}
                    >
                        <div style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: '#8B5CF6', // Purple color matching the new image
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            flexShrink: 0
                        }}>
                            A
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#111827' }}>Arun</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerFilter;
