import React, { useState, useRef, useEffect } from 'react';
import {
    Clock,
    RefreshCw,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    User,
    Radio,
    Repeat,
    LogIn,
    LogOut,
    Timer,
    MapPin,
    Navigation,
    PauseCircle,
    Edit2,
    Calendar as CalendarIcon,
    Menu,
    BarChart2
} from 'lucide-react';
import './Attendance.css';

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const Attendance = () => {
    // Active View Tab: 'table', 'monthly', 'weekly'
    const [activeTab, setActiveTab] = useState('table');

    // Selected user filter: 'All', 'Arun'
    const [selectedUserFilter, setSelectedUserFilter] = useState('All');
    const [isUserFilterOpen, setIsUserFilterOpen] = useState(false);

    // Refresh state
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Date Picker State
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [pickerMode, setPickerMode] = useState('calendar'); // 'calendar' | 'input'

    // Target reference date: Friday, Sep 25, 2026 (matching screenshots)
    const [selectedDate, setSelectedDate] = useState(new Date(2026, 8, 25));
    const [viewYear, setViewYear] = useState(2026);
    const [viewMonth, setViewMonth] = useState(8); // September (0-indexed)
    const [manualDateText, setManualDateText] = useState('09/25/2026');

    // Temp date while picker is open
    const [tempDate, setTempDate] = useState(new Date(2026, 8, 25));

    const userFilterRef = useRef(null);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    };

    // Close user filter popover on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userFilterRef.current && !userFilterRef.current.contains(e.target)) {
                setIsUserFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Format header date display: e.g. "Today, 25 Sep 26"
    const formatTriggerDate = (d) => {
        const day = d.getDate();
        const mon = d.toLocaleString('en-US', { month: 'short' });
        const yr = String(d.getFullYear()).slice(-2);
        return `Today, ${day} ${mon} ${yr}`;
    };

    // Format big date in picker left pane: e.g. "Fri, Sep 25"
    const formatBigDate = (d) => {
        const weekday = d.toLocaleString('en-US', { weekday: 'short' });
        const mon = d.toLocaleString('en-US', { month: 'short' });
        const day = d.getDate();
        return `${weekday}, ${mon} ${day}`;
    };

    // Generate calendar days for viewYear & viewMonth
    const calendarDays = () => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: '', isCurrent: false });
        }

        // Days of current month
        for (let i = 1; i <= totalDays; i++) {
            days.push({
                day: i,
                isCurrent: true,
                isSelected:
                    tempDate.getFullYear() === viewYear &&
                    tempDate.getMonth() === viewMonth &&
                    tempDate.getDate() === i
            });
        }

        return days;
    };

    const handleOpenDatePicker = () => {
        setTempDate(new Date(selectedDate));
        setViewYear(selectedDate.getFullYear());
        setViewMonth(selectedDate.getMonth());
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        const yyyy = selectedDate.getFullYear();
        setManualDateText(`${mm}/${dd}/${yyyy}`);
        setIsDatePickerOpen(true);
    };

    const handleConfirmDatePicker = () => {
        if (pickerMode === 'input') {
            // parse manual input MM/DD/YYYY
            const parts = manualDateText.split('/');
            if (parts.length === 3) {
                const m = parseInt(parts[0], 10) - 1;
                const d = parseInt(parts[1], 10);
                const y = parseInt(parts[2], 10);
                if (!isNaN(m) && !isNaN(d) && !isNaN(y)) {
                    const parsed = new Date(y, m, d);
                    setSelectedDate(parsed);
                }
            }
        } else {
            setSelectedDate(new Date(tempDate));
        }
        setIsDatePickerOpen(false);
    };

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    return (
        <div className="attendance-page-container">
            {/* ---------------- Top View Tabs (Screenshot 1) ---------------- */}
            <div className="attendance-top-tabs">
                <button
                    type="button"
                    className={`att-tab-btn ${activeTab === 'table' ? 'active' : ''}`}
                    onClick={() => setActiveTab('table')}
                >
                    <Menu size={16} />
                    <span>Table</span>
                </button>

                <button
                    type="button"
                    className={`att-tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
                    onClick={() => setActiveTab('monthly')}
                >
                    <Calendar size={16} />
                    <span>Monthly</span>
                </button>

                <button
                    type="button"
                    className={`att-tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
                    onClick={() => setActiveTab('weekly')}
                >
                    <BarChart2 size={16} />
                    <span>Weekly</span>
                </button>
            </div>

            {/* ---------------- Content Body ---------------- */}
            <div className="attendance-content-body">
                {/* Section Header Row */}
                <div className="att-section-header-row">
                    <div className="att-section-title-left">
                        <Clock size={18} />
                        <span>Attendance Management</span>
                    </div>

                    <button
                        type="button"
                        className={`att-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
                        onClick={handleRefresh}
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>

                {/* Filters Row */}
                <div className="att-filters-row">
                    {/* User Filter Dropdown (Screenshots 1 & 4) */}
                    <div className="att-popover-wrapper" ref={userFilterRef}>
                        <button
                            type="button"
                            className="att-user-filter-trigger"
                            onClick={() => setIsUserFilterOpen(!isUserFilterOpen)}
                        >
                            <span>{selectedUserFilter}</span>
                            <ChevronDown size={15} color="#6B7280" />
                        </button>

                        {isUserFilterOpen && (
                            <div className="att-user-dropdown-popover">
                                <div
                                    className={`att-user-dropdown-option ${selectedUserFilter === 'All' ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedUserFilter('All');
                                        setIsUserFilterOpen(false);
                                    }}
                                >
                                    <span>All</span>
                                </div>
                                <div
                                    className={`att-user-dropdown-option ${selectedUserFilter === 'Arun' ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedUserFilter('Arun');
                                        setIsUserFilterOpen(false);
                                    }}
                                >
                                    <div className="att-option-avatar">A</div>
                                    <span>Arun</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Date Picker Trigger (Screenshot 1) */}
                    <button
                        type="button"
                        className="att-date-filter-trigger"
                        onClick={handleOpenDatePicker}
                    >
                        <div className="att-date-label-left">
                            <Calendar size={15} color="#2563EB" />
                            <span>{formatTriggerDate(selectedDate)}</span>
                        </div>
                        <ChevronDown size={15} color="#6B7280" />
                    </button>
                </div>

                {/* Main Views */}
                {activeTab === 'table' ? (
                    /* Table View matching Screenshot 1 */
                    <div className="att-table-container">
                        <table className="att-table">
                            <thead>
                                <tr>
                                    <th>
                                        <span className="att-th-content">
                                            <User size={14} color="#6B7280" />
                                            <span>User</span>
                                        </span>
                                    </th>
                                    <th>
                                        <span className="att-th-content">
                                            <Radio size={14} color="#6B7280" />
                                            <span>Live</span>
                                        </span>
                                    </th>
                                    <th>
                                        <span className="att-th-content">
                                            <Repeat size={14} color="#6B7280" />
                                            <span>Sessions</span>
                                        </span>
                                    </th>
                                    <th>
                                        <span className="att-th-content">
                                            <LogIn size={14} color="#6B7280" />
                                            <span>First In</span>
                                        </span>
                                    </th>
                                    <th>
                                        <span className="att-th-content">
                                            <LogOut size={14} color="#6B7280" />
                                            <span>Last Out</span>
                                        </span>
                                    </th>
                                    <th>
                                        <span className="att-th-content">
                                            <Timer size={14} color="#6B7280" />
                                            <span>Total Duration</span>
                                        </span>
                                    </th>
                                    <th>
                                        <span className="att-th-content">
                                            <MapPin size={14} color="#6B7280" />
                                            <span>Check-in Loc.</span>
                                        </span>
                                    </th>
                                    <th>
                                        <span className="att-th-content">
                                            <Navigation size={14} color="#6B7280" />
                                            <span>Last Loc.</span>
                                        </span>
                                    </th>
                                    <th>
                                        <span className="att-th-content">
                                            <PauseCircle size={14} color="#6B7280" />
                                            <span>Breaks</span>
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Row 1: Arun (NO RECORD - Soft Pink Background) */}
                                <tr className="att-row-no-record">
                                    <td>
                                        <div className="att-user-cell">
                                            <div className="att-user-avatar">A</div>
                                            <div className="att-user-info-stack">
                                                <span className="att-user-name">Arun</span>
                                                <span className="att-no-record-badge">NO RECORD</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="att-offline-pill">
                                            <span className="att-offline-dot" />
                                            <span>Offline</span>
                                        </span>
                                    </td>
                                    <td className="att-dash-cell">—</td>
                                    <td className="att-dash-cell">—</td>
                                    <td className="att-dash-cell">—</td>
                                    <td className="att-dash-cell">—</td>
                                    <td className="att-dash-cell">—</td>
                                    <td className="att-dash-cell">—</td>
                                    <td className="att-dash-cell">—</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'monthly' ? (
                    <div className="att-view-placeholder">
                        <Calendar size={48} color="#9CA3AF" style={{ marginBottom: '12px' }} />
                        <h3 style={{ margin: '0 0 6px 0', color: '#111827' }}>Monthly Attendance Overview</h3>
                        <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
                            Summary view of attendance records for {months[viewMonth]} {viewYear}.
                        </p>
                    </div>
                ) : (
                    <div className="att-view-placeholder">
                        <BarChart2 size={48} color="#9CA3AF" style={{ marginBottom: '12px' }} />
                        <h3 style={{ margin: '0 0 6px 0', color: '#111827' }}>Weekly Attendance Analysis</h3>
                        <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
                            Daily working hours and session duration graph for this week.
                        </p>
                    </div>
                )}
            </div>

            {/* ---------------- Footer Bar (Screenshot 1) ---------------- */}
            <div className="att-footer-bar">
                <span className="att-showing-text">Showing 1 - 1 of 1</span>

                <div className="att-pagination-controls">
                    <button type="button" className="att-page-btn" disabled>
                        <ChevronLeft size={16} />
                    </button>
                    <button type="button" className="att-page-btn active">
                        1
                    </button>
                    <button type="button" className="att-page-btn" disabled>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* ---------------- Material Design Date Picker Modal (Screenshots 2 & 3) ---------------- */}
            {isDatePickerOpen && (
                <div
                    className="att-datepicker-modal-backdrop"
                    onClick={() => setIsDatePickerOpen(false)}
                >
                    <div
                        className="att-datepicker-dialog"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Left Pane (Big Date Display & Toggle Button) */}
                        <div className="att-dp-left-pane">
                            <div>
                                <p className="att-dp-select-date-label">Select date</p>
                                <h2 className="att-dp-big-date-text">
                                    {formatBigDate(tempDate)}
                                </h2>
                            </div>

                            {/* Mode Toggle Button: Pencil in calendar mode, Calendar in input mode */}
                            <button
                                type="button"
                                className="att-dp-mode-toggle-btn"
                                onClick={() => {
                                    if (pickerMode === 'calendar') {
                                        const mm = String(tempDate.getMonth() + 1).padStart(2, '0');
                                        const dd = String(tempDate.getDate()).padStart(2, '0');
                                        const yyyy = tempDate.getFullYear();
                                        setManualDateText(`${mm}/${dd}/${yyyy}`);
                                        setPickerMode('input');
                                    } else {
                                        setPickerMode('calendar');
                                    }
                                }}
                                title={pickerMode === 'calendar' ? 'Switch to text input' : 'Switch to calendar'}
                            >
                                {pickerMode === 'calendar' ? (
                                    <Edit2 size={18} />
                                ) : (
                                    <CalendarIcon size={18} />
                                )}
                            </button>
                        </div>

                        {/* Thin Vertical Divider */}
                        <div className="att-dp-vertical-divider" />

                        {/* Right Pane */}
                        <div className="att-dp-right-pane">
                            {pickerMode === 'calendar' ? (
                                /* Calendar View (Screenshot 2) */
                                <div>
                                    {/* Month Navigation */}
                                    <div className="att-dp-calendar-header">
                                        <div className="att-dp-month-selector">
                                            <span>{months[viewMonth]} {viewYear}</span>
                                            <ChevronDown size={15} color="#4B5563" />
                                        </div>

                                        <div className="att-dp-month-nav-arrows">
                                            <button
                                                type="button"
                                                className="att-dp-arrow-btn"
                                                onClick={handlePrevMonth}
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <button
                                                type="button"
                                                className="att-dp-arrow-btn"
                                                onClick={handleNextMonth}
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Days Header */}
                                    <div className="att-dp-days-header-row">
                                        {daysOfWeek.map((d, idx) => (
                                            <span key={idx}>{d}</span>
                                        ))}
                                    </div>

                                    {/* Days Grid */}
                                    <div className="att-dp-days-grid">
                                        {calendarDays().map((item, idx) => {
                                            if (!item.isCurrent) {
                                                return <div key={idx} className="att-dp-day-cell other-month" />;
                                            }
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`att-dp-day-cell ${item.isSelected ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        const newTemp = new Date(viewYear, viewMonth, item.day);
                                                        setTempDate(newTemp);
                                                    }}
                                                >
                                                    {item.day}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                /* Manual Text Input Mode (Screenshot 3) */
                                <div>
                                    <div className="att-dp-manual-input-box">
                                        <span className="att-dp-floating-label">Enter Date</span>
                                        <input
                                            type="text"
                                            className="att-dp-text-input"
                                            value={manualDateText}
                                            onChange={(e) => setManualDateText(e.target.value)}
                                            placeholder="MM/DD/YYYY"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Dialog Bottom Action Buttons */}
                            <div className="att-dp-dialog-actions">
                                <button
                                    type="button"
                                    className="att-dp-cancel-btn"
                                    onClick={() => setIsDatePickerOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="att-dp-ok-btn"
                                    onClick={handleConfirmDatePicker}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
