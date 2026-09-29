import React, { useState, useRef, useEffect } from 'react';
import {
    LayoutGrid,
    Users,
    Building2,
    TrendingUp,
    CheckCircle2,
    Phone,
    Calendar,
    UserCheck,
    Coffee,
    PhoneForwarded,
    CheckSquare,
    Clock,
    BarChart2,
    FileText,
    Folder,
    Plus,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Star,
    Infinity,
    CalendarDays,
    CalendarX,
    CalendarRange,
    Columns3,
    X
} from 'lucide-react';
import './Reports.css';

const modulesList = [
    { id: 'all', name: 'All', icon: LayoutGrid, subtitle: 'Active' },
    { id: 'contacts', name: 'Contacts', icon: Users },
    { id: 'company', name: 'Company', icon: Building2 },
    { id: 'deals', name: 'Deals', icon: TrendingUp },
    { id: 'activities', name: 'Activities', icon: CheckCircle2 },
    { id: 'calls', name: 'Calls', icon: Phone },
    { id: 'meeting-appointments', name: 'Meeting Appointments', icon: Calendar },
    { id: 'attendance', name: 'Attendance', icon: UserCheck },
    { id: 'breaks', name: 'Breaks', icon: Coffee },
    { id: 'call-productivity', name: 'Call Productivity', icon: PhoneForwarded },
    { id: 'task-productivity', name: 'Task Productivity', icon: CheckSquare },
    { id: 'appointment-productivity', name: 'Appointment Productivity', icon: Clock },
    { id: 'user-performance-analytics', name: 'User Performance Analytics', icon: BarChart2 },
    { id: 'gstr-1', name: 'GSTR-1', icon: FileText }
];

const dateFilterOptions = [
    { id: 'all-time', label: 'All Time', icon: Infinity },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'yesterday', label: 'Yesterday', icon: Calendar },
    { id: 'this-week', label: 'This Week', icon: Columns3 },
    { id: 'last-week', label: 'Last Week', icon: Columns3 },
    { id: 'this-month', label: 'This Month', icon: CalendarDays },
    { id: 'last-month', label: 'Last Month', icon: CalendarDays },
    { id: 'this-year', label: 'This Year', icon: Calendar },
    { id: 'last-year', label: 'Last Year', icon: CalendarX },
    { id: 'custom-range', label: 'Custom Range', icon: CalendarRange }
];

const ownerOptions = [
    { name: 'Arun', letter: 'A', bg: '#059669' },
    { name: 'All', letter: 'A', bg: '#2563EB' },
    { name: 'Priya', letter: 'P', bg: '#7C3AED' }
];

const Reports = ({ setCurrentPage }) => {
    // 3-Second Auto-collapse state
    const [isModulesOpen, setIsModulesOpen] = useState(true);
    const [selectedModule, setSelectedModule] = useState('All');

    // Filter states
    const [moduleFilter, setModuleFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('All Time');
    const [ownerFilter, setOwnerFilter] = useState('Arun');
    const [starredOptions, setStarredOptions] = useState([]);

    // Dropdown open states
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleStarOption = (label) => {
        setStarredOptions(prev =>
            prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]
        );
    };

    const activeDateOpt = dateFilterOptions.find(d => d.label === dateFilter) || dateFilterOptions[0];
    const ActiveDateIcon = activeDateOpt.icon;

    // Add Report Modal state
    const [isAddReportOpen, setIsAddReportOpen] = useState(false);
    const [reportName, setReportName] = useState('');
    const [reportModule, setReportModule] = useState('Contacts');
    const [reportType, setReportType] = useState('Bar Chart');
    const [reportDesc, setReportDesc] = useState('');
    const [reportsList, setReportsList] = useState([]);

    const timerRef = useRef(null);
    const dropdownRef = useRef(null);

    // 3-Second Auto-Collapse Timer: Open initially, collapses after 3000ms
    useEffect(() => {
        timerRef.current = setTimeout(() => {
            setIsModulesOpen(false);
        }, 3000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleModules = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsModulesOpen(prev => !prev);
    };

    const handleSelectModule = (modName) => {
        setSelectedModule(modName);
        setModuleFilter(modName);
    };

    const handleCreateReport = (e) => {
        e.preventDefault();
        if (!reportName.trim()) {
            alert('Please enter Report Name');
            return;
        }

        const newReport = {
            id: Date.now(),
            name: reportName.trim(),
            module: reportModule,
            type: reportType,
            description: reportDesc.trim(),
            created: new Date().toLocaleDateString()
        };

        setReportsList(prev => [...prev, newReport]);
        setIsAddReportOpen(false);
        setReportName('');
        setReportDesc('');
    };

    return (
        <div className="reports-page-wrapper" ref={dropdownRef}>
            {/* ================================================================= */}
            {/* LEFT MODULES SIDEBAR (Expanded or Collapsed after 3s)             */}
            {/* ================================================================= */}
            <aside className={`reports-modules-sidebar ${isModulesOpen ? 'expanded' : 'collapsed'}`}>
                {isModulesOpen ? (
                    /* ---------------- Expanded Mode (Screenshots 1 & 2) ---------------- */
                    <div className="modules-sidebar-content">
                        {/* Top Header */}
                        <div className="modules-header-bar">
                            <div className="modules-brand-left">
                                <div className="modules-brand-icon-box">
                                    <LayoutGrid size={18} color="#FFFFFF" />
                                </div>
                                <div className="modules-brand-text">
                                    <h4 className="modules-brand-title">Modules</h4>
                                    <span className="modules-brand-subtitle">Workspace</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="modules-toggle-btn collapse-btn"
                                onClick={toggleModules}
                                title="Collapse modules"
                            >
                                <ChevronLeft size={16} />
                            </button>
                        </div>

                        {/* Scrollable Modules List */}
                        <div className="modules-items-list">
                            {modulesList.map((mod) => {
                                const IconComp = mod.icon;
                                const isSelected = selectedModule === mod.name;

                                return (
                                    <div
                                        key={mod.id}
                                        className={`modules-list-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleSelectModule(mod.name)}
                                    >
                                        <div className="modules-item-left">
                                            <div className="modules-item-icon-wrap">
                                                <IconComp size={18} />
                                            </div>
                                            <div className="modules-item-labels">
                                                <span className="modules-item-name">{mod.name}</span>
                                                {mod.subtitle && (
                                                    <span className="modules-item-sub">{mod.subtitle}</span>
                                                )}
                                            </div>
                                        </div>

                                        {isSelected && <span className="modules-item-active-dot" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* ---------------- Collapsed Rail Mode (Screenshots 3 & 4) ---------------- */
                    <div className="modules-rail-content">
                        {/* Expand Button at Top */}
                        <div className="modules-rail-top">
                            <button
                                type="button"
                                className="modules-toggle-btn expand-btn"
                                onClick={toggleModules}
                                title="Expand modules"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        {/* Vertical Icon Rail */}
                        <div className="modules-rail-icons-list">
                            {modulesList.map((mod) => {
                                const IconComp = mod.icon;
                                const isSelected = selectedModule === mod.name;

                                return (
                                    <button
                                        key={mod.id}
                                        type="button"
                                        className={`modules-rail-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleSelectModule(mod.name)}
                                        title={mod.name}
                                    >
                                        <IconComp size={18} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </aside>

            {/* ================================================================= */}
            {/* RIGHT MAIN REPORTS AREA                                           */}
            {/* ================================================================= */}
            <main className="reports-main-content">
                {/* Header Filter Section */}
                <div className="reports-top-filter-bar">
                    {/* Row 1: Title on left, Add Report on right */}
                    <div className="reports-header-top-row">
                        <div className="reports-active-title-wrap">
                            <h2 className="reports-active-title">{selectedModule}</h2>
                        </div>

                        <button
                            type="button"
                            className="reports-add-btn"
                            onClick={() => setIsAddReportOpen(true)}
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            <span>Add Report</span>
                        </button>
                    </div>

                    {/* Row 2: Filters right-aligned directly under Add Report */}
                    <div className="reports-filters-group-right">
                        {/* Module Dropdown */}
                        <div className="rep-filter-control">
                            <span className="rep-filter-label">Module:</span>
                            <div className="rep-dropdown-rel">
                                <button
                                    type="button"
                                    className="rep-dropdown-btn module-btn"
                                    onClick={() => setOpenDropdown(openDropdown === 'module' ? null : 'module')}
                                >
                                    <span>{moduleFilter}</span>
                                    <ChevronDown size={14} color="#6B7280" />
                                </button>

                                {openDropdown === 'module' && (
                                    <div className="rep-dropdown-menu rep-dropdown-module-menu">
                                        {modulesList.map(m => {
                                            const isSelected = moduleFilter === m.name;
                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`rep-module-menu-item ${isSelected ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setModuleFilter(m.name);
                                                        setSelectedModule(m.name);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span className="rep-module-item-label">{m.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Date Dropdown */}
                        <div className="rep-filter-control">
                            <span className="rep-filter-label">Date:</span>
                            <div className="rep-dropdown-rel">
                                <button
                                    type="button"
                                    className="rep-dropdown-btn date-btn"
                                    onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
                                >
                                    <div className="rep-date-btn-content">
                                        <ActiveDateIcon size={15} color="#2563EB" strokeWidth={1.8} />
                                        <span>{dateFilter}</span>
                                    </div>
                                    <div className="rep-date-btn-actions">
                                        <Star
                                            size={14}
                                            color={starredOptions.includes(dateFilter) ? "#F59E0B" : "#9CA3AF"}
                                            fill={starredOptions.includes(dateFilter) ? "#F59E0B" : "none"}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleStarOption(dateFilter);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <ChevronDown size={14} color="#6B7280" />
                                    </div>
                                </button>

                                {openDropdown === 'date' && (
                                    <div className="rep-dropdown-menu rep-dropdown-date-menu">
                                        {dateFilterOptions.map(opt => {
                                            const IconComp = opt.icon;
                                            const isSelected = dateFilter === opt.label;
                                            const isItemStarred = starredOptions.includes(opt.label);

                                            return (
                                                <div
                                                    key={opt.id}
                                                    className={`rep-date-menu-item ${isSelected ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setDateFilter(opt.label);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <div className="rep-date-item-left">
                                                        <IconComp size={16} color="#2563EB" strokeWidth={1.8} />
                                                        <span className="rep-date-item-label">{opt.label}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="rep-date-star-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleStarOption(opt.label);
                                                        }}
                                                        title="Favorite"
                                                    >
                                                        <Star
                                                            size={14}
                                                            color={isItemStarred ? "#F59E0B" : "#9CA3AF"}
                                                            fill={isItemStarred ? "#F59E0B" : "none"}
                                                            strokeWidth={1.5}
                                                        />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Owner: Arun (No dropdown menu underneath as requested) */}
                        <div className="rep-filter-control">
                            <span className="rep-filter-label">Owner:</span>
                            <div className="rep-dropdown-rel">
                                <div className="rep-dropdown-btn owner-btn static-owner">
                                    <div className="rep-owner-btn-content">
                                        <span className="rep-owner-avatar">A</span>
                                        <span>{ownerFilter}</span>
                                    </div>
                                    <ChevronDown size={14} color="#6B7280" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Empty State or Reports Content */}
                <div className="reports-content-body">
                    {reportsList.length === 0 ? (
                        <div className="reports-empty-state">
                            <div className="reports-folder-icon-box">
                                <Folder size={68} strokeWidth={1.2} color="#9CA3AF" />
                            </div>
                            <h3 className="reports-empty-title">No Reports Available</h3>
                            <p className="reports-empty-desc">
                                Click "Add Report" to create your first report
                            </p>
                        </div>
                    ) : (
                        <div className="reports-cards-grid">
                            {reportsList.map(rep => (
                                <div key={rep.id} className="report-card-item">
                                    <div className="report-card-header">
                                        <BarChart2 size={20} color="#2563EB" />
                                        <span className="report-card-badge">{rep.module}</span>
                                    </div>
                                    <h4 className="report-card-title">{rep.name}</h4>
                                    {rep.description && (
                                        <p className="report-card-desc">{rep.description}</p>
                                    )}
                                    <div className="report-card-footer">
                                        <span className="report-card-type">{rep.type}</span>
                                        <span className="report-card-date">{rep.created}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* ================================================================= */}
            {/* ADD REPORT MODAL                                                  */}
            {/* ================================================================= */}
            {isAddReportOpen && (
                <div className="report-modal-overlay" onClick={() => setIsAddReportOpen(false)}>
                    <div className="report-modal-dialog" onClick={e => e.stopPropagation()}>
                        <div className="report-modal-header">
                            <h3>Create New Report</h3>
                            <button
                                type="button"
                                className="report-modal-close"
                                onClick={() => setIsAddReportOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateReport}>
                            <div className="report-modal-body">
                                <div className="report-form-group">
                                    <label>Report Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Monthly Sales Summary"
                                        value={reportName}
                                        onChange={e => setReportName(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="report-form-grid-2">
                                    <div className="report-form-group">
                                        <label>Module</label>
                                        <select
                                            value={reportModule}
                                            onChange={e => setReportModule(e.target.value)}
                                        >
                                            {modulesList.filter(m => m.name !== 'All').map(m => (
                                                <option key={m.id} value={m.name}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="report-form-group">
                                        <label>Report Type</label>
                                        <select
                                            value={reportType}
                                            onChange={e => setReportType(e.target.value)}
                                        >
                                            <option value="Bar Chart">Bar Chart</option>
                                            <option value="Line Chart">Line Chart</option>
                                            <option value="Pie Chart">Pie Chart</option>
                                            <option value="Summary Table">Summary Table</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="report-form-group">
                                    <label>Description</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Briefly describe what this report analyzes..."
                                        value={reportDesc}
                                        onChange={e => setReportDesc(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="report-modal-footer">
                                <button
                                    type="button"
                                    className="report-modal-cancel-btn"
                                    onClick={() => setIsAddReportOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="report-modal-submit-btn"
                                >
                                    + Create Report
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
