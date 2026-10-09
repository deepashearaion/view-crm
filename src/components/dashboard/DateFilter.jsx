import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Star } from 'lucide-react';
import './DateFilter.css';

const dateOptions = [
    { label: 'Today', hasStar: true },
    { label: 'Yesterday', hasStar: false },
    { label: 'This Week', hasStar: false },
    { label: 'This Month', hasStar: false },
    { label: 'This Quarter', hasStar: false },
    { label: 'This Year', hasStar: false },
];

const DateFilter = ({ defaultValue = 'Today', onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(defaultValue);
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

    const handleSelect = (item) => {
        setSelected(item.label);
        setIsOpen(false);
        if (onChange) onChange(item.label);
    };

    const hasStar = selected === 'Today';

    return (
        <div className="date-filter-wrapper" ref={dropdownRef}>
            <button
                type="button"
                className="date-filter-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="date-filter-left">
                    <Calendar size={14} className="date-filter-cal-icon" />
                    <span className="date-filter-label">{selected}</span>
                    {hasStar && (
                        <Star size={12} className="date-filter-star-icon" />
                    )}
                </div>
                <ChevronDown size={14} className={`date-filter-chevron ${isOpen ? 'open' : ''}`} />
            </button>

            {isOpen && (
                <div className="date-filter-dropdown">
                    {dateOptions.map((item) => (
                        <div
                            key={item.label}
                            className={`date-filter-option ${selected === item.label ? 'active' : ''}`}
                            onClick={() => handleSelect(item)}
                        >
                            <span>{item.label}</span>
                            {item.hasStar && <Star size={11} className="option-star" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DateFilter;
