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
    Menu,
    BarChart2,
    Infinity,
    History,
    Columns,
    ArrowLeft
} from 'lucide-react';
import './Attendance.css';

const summaryFilterOptions = [
    { label: 'All Time', icon: Infinity },
    { label: 'Today', icon: Calendar },
    { label: 'Yesterday', icon: History },
    { label: 'This Week', icon: Columns },
    { label: 'Last Week', icon: ArrowLeft },
    { label: 'This Month', icon: Calendar },
    { label: 'Last Month', icon: ChevronLeft },
    { label: 'This Year', icon: Calendar },
    { label: 'Last Year', icon: Clock },
    { label: 'Custom', icon: Calendar }
];

const daysOfWeekShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const shortMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const miniWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const mainWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Attendance = () => {
    // Active View Tab: 'table', 'monthly', 'weekly'
    const [activeTab, setActiveTab] = useState('monthly'); // Defaults to monthly as requested

    // Selected user filter: 'All', 'Arun'
    const [selectedUserFilter, setSelectedUserFilter] = useState('All');
    const [isUserFilterOpen, setIsUserFilterOpen] = useState(false);

    // Refresh state
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Date Picker State for Table View
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [pickerMode, setPickerMode] = useState('calendar'); // 'calendar' | 'input'

    // Selected reference date: Sunday, Sep 27, 2026 (matching screenshots)
    const [selectedDate, setSelectedDate] = useState(new Date(2026, 8, 27));
    const [viewYear, setViewYear] = useState(2026);
    const [viewMonth, setViewMonth] = useState(8); // September (0-indexed)
    const [manualDateText, setManualDateText] = useState('09/27/2026');

    // Temp date while picker is open in Table View
    const [tempDate, setTempDate] = useState(new Date(2026, 8, 27));

    // Monthly View States
    const [monthlyUserFilter, setMonthlyUserFilter] = useState('All');
    const [isMonthlyUserFilterOpen, setIsMonthlyUserFilterOpen] = useState(false);

    const [summaryFilter, setSummaryFilter] = useState('Today');
    const [isSummaryFilterOpen, setIsSummaryFilterOpen] = useState(false);

    // Year & Month Direct Jump Picker Popover
    const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
    const [pickerYear, setPickerYear] = useState(2026);

    const userFilterRef = useRef(null);
    const monthlyUserFilterRef = useRef(null);
    const summaryFilterRef = useRef(null);
    const monthYearPickerRef = useRef(null);

    // Touch & Mouse Drag Swipe handling
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const mouseStartX = useRef(null);
    const isMouseDown = useRef(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    };

    // Close popovers on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userFilterRef.current && !userFilterRef.current.contains(e.target)) {
                setIsUserFilterOpen(false);
            }
            if (monthlyUserFilterRef.current && !monthlyUserFilterRef.current.contains(e.target)) {
                setIsMonthlyUserFilterOpen(false);
            }
            if (summaryFilterRef.current && !summaryFilterRef.current.contains(e.target)) {
                setIsSummaryFilterOpen(false);
            }
            if (monthYearPickerRef.current && !monthYearPickerRef.current.contains(e.target)) {
                setShowMonthYearPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Synchronize pickerYear whenever viewYear changes
    useEffect(() => {
        setPickerYear(viewYear);
    }, [viewYear]);

    // Format header date display for Table view: e.g. "Today, 27 Sep 26"
    const formatTriggerDate = (d) => {
        const day = d.getDate();
        const mon = d.toLocaleString('en-US', { month: 'short' });
        const yr = String(d.getFullYear()).slice(-2);
        return `Today, ${day} ${mon} ${yr}`;
    };

    // Format big date in picker left pane: e.g. "Sun, Sep 27"
    const formatBigDate = (d) => {
        const weekday = d.toLocaleString('en-US', { weekday: 'short' });
        const mon = d.toLocaleString('en-US', { month: 'short' });
        const day = d.getDate();
        return `${weekday}, ${mon} ${day}`;
    };

    // Month Navigation: Previous month (crosses years seamlessly)
    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(prev => prev - 1);
        } else {
            setViewMonth(prev => prev - 1);
        }
    };

    // Month Navigation: Next month (crosses years seamlessly)
    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(prev => prev + 1);
        } else {
            setViewMonth(prev => prev + 1);
        }
    };

    // Generate Calendar Days for Monday-first calendar grid (42 cells: 6 rows x 7 cols)
    const getMonthlyGridDays = (year, month) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const totalDays = lastDay.getDate();

        // Monday-start weekday: Mon=0, Tue=1, ..., Sun=6
        const startWeekday = (firstDay.getDay() + 6) % 7;

        const prevMonthLastDay = new Date(year, month, 0).getDate();
        const days = [];

        // Leading days from previous month
        for (let i = startWeekday - 1; i >= 0; i--) {
            const d = prevMonthLastDay - i;
            const prevM = month === 0 ? 11 : month - 1;
            const prevY = month === 0 ? year - 1 : year;
            days.push({
                day: d,
                month: prevM,
                year: prevY,
                isCurrentMonth: false,
                isPrevMonth: true
            });
        }

        // Days of current month
        for (let d = 1; d <= totalDays; d++) {
            days.push({
                day: d,
                month: month,
                year: year,
                isCurrentMonth: true,
                isPrevMonth: false
            });
        }

        // Trailing days from next month to reach 42 cells
        let nextMonthDay = 1;
        while (days.length < 42) {
            const nextM = month === 11 ? 0 : month + 1;
            const nextY = month === 11 ? year + 1 : year;
            days.push({
                day: nextMonthDay,
                month: nextM,
                year: nextY,
                isCurrentMonth: false,
                isNextMonth: true
            });
            nextMonthDay++;
        }

        return days;
    };

    const monthlyGrid = getMonthlyGridDays(viewYear, viewMonth);

    // Mini Calendar Days: 35 days (5 rows) if row 6 has no current month days, otherwise 42
    const miniCalendarDays = monthlyGrid.slice(0, monthlyGrid[35]?.isCurrentMonth ? 42 : 35);

    // Handle day selection in either Mini Calendar or Main Calendar
    const handleSelectDay = (item) => {
        setSelectedDate(new Date(item.year, item.month, item.day));
        // If clicked on other month day, update viewMonth/viewYear
        if (item.year !== viewYear || item.month !== viewMonth) {
            setViewYear(item.year);
            setViewMonth(item.month);
        }
    };

    // Swipe & Drag handlers for swiping between months
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const deltaX = touchStartX.current - e.changedTouches[0].clientX;
        const deltaY = touchStartY.current - e.changedTouches[0].clientY;
        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                handleNextMonth();
            } else {
                handlePrevMonth();
            }
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    const handleMouseDown = (e) => {
        if (
            e.target.closest('button') ||
            e.target.closest('.att-user-dropdown-popover') ||
            e.target.closest('.att-summary-popover') ||
            e.target.closest('.att-month-year-picker-popover')
        ) {
            return;
        }
        isMouseDown.current = true;
        mouseStartX.current = e.clientX;
    };

    const handleMouseUp = (e) => {
        if (!isMouseDown.current || mouseStartX.current === null) return;
        const deltaX = mouseStartX.current - e.clientX;
        if (Math.abs(deltaX) > 60) {
            if (deltaX > 0) {
                handleNextMonth();
            } else {
                handlePrevMonth();
            }
        }
        isMouseDown.current = false;
        mouseStartX.current = null;
    };

    // Table view date picker modal helpers
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

    // Table view calendar modal days
    const calendarDays = () => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push({ day: '', isCurrent: false });
        }

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

    return (
        <div className="attendance-page-container">
            {/* ---------------- Top View Tabs (Table, Monthly, Weekly) ---------------- */}
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

            {/* ========================================================================= */}
            {/* MONTHLY VIEW (Exact match to Screenshots)                                 */}
            {/* ========================================================================= */}
            {activeTab === 'monthly' ? (
                <div
                    className="att-monthly-layout"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                >
                    {/* Left Column: Mini Calendar + Attendance Summary */}
                    <div className="att-monthly-sidebar">
                        {/* 1. Mini Calendar Card */}
                        <div className="att-mini-cal-card">
                            <div className="att-mini-cal-header">
                                <button
                                    type="button"
                                    className="att-mini-cal-arrow-btn"
                                    onClick={handlePrevMonth}
                                    title="Previous Month"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                <div
                                    className="att-mini-cal-title-wrap"
                                    onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
                                    title="Click to pick any month or year"
                                >
                                    <span className="att-mini-cal-title">
                                        {months[viewMonth]} {viewYear}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="att-mini-cal-arrow-btn"
                                    onClick={handleNextMonth}
                                    title="Next Month"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Mini Calendar Weekdays */}
                            <div className="att-mini-cal-weekdays">
                                {miniWeekdays.map((w, idx) => (
                                    <span key={idx}>{w}</span>
                                ))}
                            </div>

                            {/* Mini Calendar Days Grid */}
                            <div className="att-mini-cal-days-grid">
                                {miniCalendarDays.map((item, idx) => {
                                    const isSelected =
                                        selectedDate.getFullYear() === item.year &&
                                        selectedDate.getMonth() === item.month &&
                                        selectedDate.getDate() === item.day;
                                    return (
                                        <div
                                            key={idx}
                                            className={`att-mini-day-cell ${!item.isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleSelectDay(item)}
                                        >
                                            <span>{item.day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Attendance Summary Card */}
                        <div className="att-summary-card">
                            <h4 className="att-summary-title">Attendance Summary</h4>

                            <div className="att-summary-filter-container" ref={summaryFilterRef}>
                                <div
                                    className="att-summary-filter-btn"
                                    onClick={() => setIsSummaryFilterOpen(!isSummaryFilterOpen)}
                                >
                                    <div className="att-summary-filter-left">
                                        {(() => {
                                            const activeOpt = summaryFilterOptions.find(o => o.label === summaryFilter) || summaryFilterOptions[1];
                                            const IconComp = activeOpt.icon;
                                            return <IconComp size={14} color="#2563EB" />;
                                        })()}
                                        <span>{summaryFilter}</span>
                                    </div>
                                    <ChevronDown size={14} color="#2563EB" />
                                </div>

                                {isSummaryFilterOpen && (
                                    <div className="att-summary-popover">
                                        {summaryFilterOptions.map((opt) => {
                                            const IconComp = opt.icon;
                                            const isSelected = summaryFilter === opt.label;
                                            return (
                                                <div
                                                    key={opt.label}
                                                    className={`att-summary-option ${isSelected ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setSummaryFilter(opt.label);
                                                        setIsSummaryFilterOpen(false);
                                                    }}
                                                >
                                                    <IconComp size={16} color="#2563EB" />
                                                    <span>{opt.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="att-summary-stats-block">
                                <span className="att-summary-label">{summaryFilter}</span>

                                <div className="att-summary-stat-row">
                                    <div className="att-stat-label-with-dot">
                                        <span className="att-dot green" />
                                        <span>Present</span>
                                    </div>
                                    <span className="att-stat-val">0</span>
                                </div>

                                <div className="att-summary-stat-row">
                                    <div className="att-stat-label-with-dot">
                                        <span className="att-dot red" />
                                        <span>Absent</span>
                                    </div>
                                    <span className="att-stat-val">0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Main Monthly Calendar View */}
                    <div className="att-monthly-main">
                        {/* Main Calendar Navigation Header */}
                        <div className="att-main-cal-header">
                            <div className="att-main-cal-nav-left">
                                <button
                                    type="button"
                                    className="att-main-cal-arrow-btn"
                                    onClick={handlePrevMonth}
                                    title="Previous Month"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <div
                                    className="att-main-cal-title-wrap"
                                    onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
                                    title="Click to pick any month or year"
                                >
                                    <h2 className="att-main-cal-title">
                                        {shortMonths[viewMonth]}, {viewYear}
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    className="att-main-cal-arrow-btn"
                                    onClick={handleNextMonth}
                                    title="Next Month"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Year & Month Direct Jump Selector Popover */}
                            {showMonthYearPicker && (
                                <div className="att-month-year-picker-popover" ref={monthYearPickerRef}>
                                    <div className="att-myp-year-bar">
                                        <button
                                            type="button"
                                            className="att-myp-arrow"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPickerYear(y => y - 1);
                                            }}
                                            title="Previous Year"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="att-myp-year-text">{pickerYear}</span>
                                        <button
                                            type="button"
                                            className="att-myp-arrow"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPickerYear(y => y + 1);
                                            }}
                                            title="Next Year"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                    <div className="att-myp-months-grid">
                                        {shortMonths.map((m, idx) => (
                                            <button
                                                key={m}
                                                type="button"
                                                className={`att-myp-month-btn ${viewMonth === idx && viewYear === pickerYear ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setViewYear(pickerYear);
                                                    setViewMonth(idx);
                                                    setShowMonthYearPicker(false);
                                                }}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* User Filter Dropdown on Right */}
                            <div className="att-main-cal-filter-wrap" ref={monthlyUserFilterRef}>
                                <button
                                    type="button"
                                    className="att-main-cal-user-btn"
                                    onClick={() => setIsMonthlyUserFilterOpen(!isMonthlyUserFilterOpen)}
                                >
                                    <span>{monthlyUserFilter}</span>
                                    <ChevronDown size={14} color="#6B7280" />
                                </button>

                                {isMonthlyUserFilterOpen && (
                                    <div className="att-user-dropdown-popover right-align">
                                        <div
                                            className={`att-user-dropdown-option ${monthlyUserFilter === 'All' ? 'selected' : ''}`}
                                            onClick={() => {
                                                setMonthlyUserFilter('All');
                                                setIsMonthlyUserFilterOpen(false);
                                            }}
                                        >
                                            <span>All</span>
                                        </div>
                                        <div
                                            className={`att-user-dropdown-option ${monthlyUserFilter === 'Arun' ? 'selected' : ''}`}
                                            onClick={() => {
                                                setMonthlyUserFilter('Arun');
                                                setIsMonthlyUserFilterOpen(false);
                                            }}
                                        >
                                            <div className="att-option-avatar">A</div>
                                            <span>Arun</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Days of Week Header Row */}
                        <div className="att-main-cal-weekdays-row">
                            {mainWeekdays.map((w, idx) => (
                                <div key={idx} className="att-main-cal-th">
                                    {w}
                                </div>
                            ))}
                        </div>

                        {/* Main Calendar 6-Row Grid */}
                        <div className="att-main-cal-grid">
                            {monthlyGrid.map((item, idx) => {
                                const isSelected =
                                    selectedDate.getFullYear() === item.year &&
                                    selectedDate.getMonth() === item.month &&
                                    selectedDate.getDate() === item.day;
                                return (
                                    <div
                                        key={idx}
                                        className={`att-main-cal-cell ${!item.isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleSelectDay(item)}
                                    >
                                        <div className="att-main-cal-cell-header">
                                            {isSelected ? (
                                                <span className="att-main-cal-badge-selected">{item.day}</span>
                                            ) : (
                                                <span className={`att-main-cal-day-num ${!item.isCurrentMonth ? 'other' : ''}`}>
                                                    {item.day}
                                                </span>
                                            )}
                                        </div>
                                        <div className="att-main-cal-cell-body">
                                            {/* Cell content for attendance activities */}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : activeTab === 'weekly' ? (
                /* Weekly View */
                <div className="att-view-placeholder">
                    <BarChart2 size={48} color="#9CA3AF" style={{ marginBottom: '12px' }} />
                    <h3 style={{ margin: '0 0 6px 0', color: '#111827' }}>Weekly Attendance Analysis</h3>
                    <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
                        Daily working hours and session duration graph for this week.
                    </p>
                </div>
            ) : (
                /* ========================================================================= */
                /* TABLE VIEW                                                                */
                /* ========================================================================= */
                <>
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
                            {/* User Filter Dropdown */}
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

                            {/* Date Picker Trigger */}
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

                        {/* Table View */}
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
                    </div>

                    {/* Footer Bar */}
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
                </>
            )}

            {/* ---------------- Material Design Date Picker Modal (For Table View) ---------------- */}
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

                            <button
                                type="button"
                                className="att-dp-mode-toggle-btn"
                                onClick={() =>
                                    setPickerMode(pickerMode === 'calendar' ? 'input' : 'calendar')
                                }
                                title={pickerMode === 'calendar' ? 'Switch to text input' : 'Switch to calendar'}
                            >
                                <Edit2 size={16} />
                            </button>
                        </div>

                        {/* Right Pane (Calendar or Input) */}
                        <div className="att-dp-right-pane">
                            {pickerMode === 'calendar' ? (
                                <div>
                                    {/* Month / Year header */}
                                    <div className="att-dp-month-bar">
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
                                        {daysOfWeekShort.map((d, idx) => (
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
