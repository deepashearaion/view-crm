import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Calendar,
    ChevronDown,
    RefreshCw,
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    Phone,
    Clock,
    Check,
    AlertTriangle,
    X,
    Trash2,
    CheckCircle2
} from 'lucide-react';
import './Activities.css';

// Empty state task icon matching Screenshot 1
const EmptyTaskIcon = () => (
    <svg width="46" height="52" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 2H14L20 8V24C20 25.1 19.1 26 18 26H4C2.9 26 2 25.1 2 24V4C2 2.9 2.9 2 4 2Z" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2V8H20" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 16L10.5 19.5L16.5 12" stroke="#94A3B8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const dateFilterOptions = ['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'All time'];
const leadOwnerFilterOptions = ['Lead Owner', 'Arun', 'Priya Sharma', 'Rajesh Kumar', 'Self'];

const taskValidatorOptions = [
    { label: 'Follow-up Call (Call)', type: 'call' },
    { label: 'Meeting (Client)', type: 'meeting' },
    { label: 'Email Follow-up', type: 'email' },
    { label: 'Demo / Presentation', type: 'demo' },
    { label: 'Send Quotation', type: 'quotation' },
];

const taskLeadOwners = ['Arun', 'Priya Sharma', 'Rajesh Kumar', 'Self'];

const sampleContacts = [
    'Arun Kumar',
    'Priya Sharma',
    'Kanishk M',
    'Rahul Verma',
    'Sneha Patel',
    'Vikram Singh'
];

const Activities = () => {
    // Tasks list state (persisted to localStorage)
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('dealconverter_activities_data');
        return saved ? JSON.parse(saved) : [];
    });

    // Save tasks to localStorage on update
    useEffect(() => {
        localStorage.setItem('dealconverter_activities_data', JSON.stringify(tasks));
    }, [tasks]);

    // Available companies list from localStorage
    const [companyOptions, setCompanyOptions] = useState(() => {
        const saved = localStorage.getItem('dealconverter_companies_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return parsed.map(c => c.name);
            } catch (e) {
                console.error(e);
            }
        }
        return ['Acme Corp', 'Infosys Technologies', 'TCS Solutions', 'Zenith Software'];
    });

    // Filtering & Navigation States
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'overdue', 'completed'
    const [selectedDateFilter, setSelectedDateFilter] = useState('Today');
    const [selectedOwnerFilter, setSelectedOwnerFilter] = useState('Lead Owner');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // Dropdown toggles
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
    const [isOwnerFilterOpen, setIsOwnerFilterOpen] = useState(false);

    // Create Task Slide-Over Drawer State
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

    // Drawer Form Fields State matching Screenshots 2 & 3
    const [taskValidator, setTaskValidator] = useState('Follow-up Call (Call)');
    const [leadOwner, setLeadOwner] = useState('');
    const [contact, setContact] = useState('');
    const [company, setCompany] = useState('');
    const [taskName, setTaskName] = useState('Follow-up Call');
    const [dueDate, setDueDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [dueTime, setDueTime] = useState('10:00 AM');
    const [description, setDescription] = useState(
        '- Next steps\n- Any questions or concerns\n- Timeline for decision'
    );

    // Drawer internal dropdown toggles
    const [isValidatorDropdownOpen, setIsValidatorDropdownOpen] = useState(false);
    const [isTaskOwnerDropdownOpen, setIsTaskOwnerDropdownOpen] = useState(false);
    const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

    const dateFilterRef = useRef(null);
    const ownerFilterRef = useRef(null);
    const validatorRef = useRef(null);
    const taskOwnerRef = useRef(null);
    const contactRef = useRef(null);
    const companyRef = useRef(null);

    // Close outside clicks
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dateFilterRef.current && !dateFilterRef.current.contains(e.target)) {
                setIsDateFilterOpen(false);
            }
            if (ownerFilterRef.current && !ownerFilterRef.current.contains(e.target)) {
                setIsOwnerFilterOpen(false);
            }
            if (validatorRef.current && !validatorRef.current.contains(e.target)) {
                setIsValidatorDropdownOpen(false);
            }
            if (taskOwnerRef.current && !taskOwnerRef.current.contains(e.target)) {
                setIsTaskOwnerDropdownOpen(false);
            }
            if (contactRef.current && !contactRef.current.contains(e.target)) {
                setIsContactDropdownOpen(false);
            }
            if (companyRef.current && !companyRef.current.contains(e.target)) {
                setIsCompanyDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Escape closes drawer
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsCreateDrawerOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            showToast('Activities refreshed');
        }, 500);
    };

    // Filter tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            // Tab filter
            if (activeTab === 'upcoming' && t.status !== 'Upcoming') return false;
            if (activeTab === 'overdue' && t.status !== 'Overdue') return false;
            if (activeTab === 'completed' && t.status !== 'Completed') return false;

            // Search filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = t.name && t.name.toLowerCase().includes(q);
                const matchCompany = t.company && t.company.toLowerCase().includes(q);
                const matchContact = t.contact && t.contact.toLowerCase().includes(q);
                if (!matchName && !matchCompany && !matchContact) return false;
            }

            // Owner filter
            if (selectedOwnerFilter !== 'Lead Owner' && t.owner !== selectedOwnerFilter) {
                return false;
            }

            return true;
        });
    }, [tasks, activeTab, searchQuery, selectedOwnerFilter]);

    const upcomingCount = tasks.filter(t => t.status === 'Upcoming').length;
    const overdueCount = tasks.filter(t => t.status === 'Overdue').length;
    const completedCount = tasks.filter(t => t.status === 'Completed').length;

    // Create Task Handler
    const handleCreateTask = (e) => {
        if (e) e.preventDefault();

        if (!taskName.trim()) {
            alert('Please enter a Task Name');
            return;
        }

        const newTask = {
            id: Date.now(),
            validator: taskValidator,
            owner: leadOwner || 'Arun',
            contact: contact || 'Arun Kumar',
            company: company || 'Acme Corp',
            name: taskName.trim(),
            dueDate: dueDate || new Date().toISOString().split('T')[0],
            dueTime: dueTime || '10:00 AM',
            description: description,
            status: 'Upcoming',
            createdAt: new Date().toISOString()
        };

        setTasks([newTask, ...tasks]);
        setIsCreateDrawerOpen(false);
        showToast(`Task "${newTask.name}" created successfully!`);

        // Reset form
        setTaskValidator('Follow-up Call (Call)');
        setTaskName('Follow-up Call');
        setLeadOwner('');
        setContact('');
        setCompany('');
    };

    const handleToggleComplete = (id) => {
        setTasks(prev => prev.map(t => {
            if (t.id === id) {
                const nextStatus = t.status === 'Completed' ? 'Upcoming' : 'Completed';
                return { ...t, status: nextStatus };
            }
            return t;
        }));
        showToast('Task status updated');
    };

    const handleDeleteTask = (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        showToast('Task removed');
    };

    return (
        <div className="activities-container">
            {toastMessage && (
                <div className="contacts-toast" style={{ zIndex: 1200 }}>
                    <Check size={16} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* ---------------- Action Bar 1 (Screenshot 1) ---------------- */}
            <div className="activities-action-bar-1">
                {/* Date filter dropdown (Today) */}
                <div className="act-popover-anchor" ref={dateFilterRef}>
                    <button
                        type="button"
                        className="act-date-filter-btn"
                        onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                    >
                        <Calendar size={15} color="#4B5563" />
                        <span>{selectedDateFilter}</span>
                        <ChevronDown size={14} color="#6B7280" />
                    </button>
                    {isDateFilterOpen && (
                        <div className="act-dropdown-menu">
                            {dateFilterOptions.map(opt => (
                                <div
                                    key={opt}
                                    className={`act-dropdown-item ${selectedDateFilter === opt ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedDateFilter(opt);
                                        setIsDateFilterOpen(false);
                                    }}
                                >
                                    <span>{opt}</span>
                                    {selectedDateFilter === opt && <Check size={14} color="#2563EB" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lead Owner dropdown */}
                <div className="act-popover-anchor" ref={ownerFilterRef}>
                    <button
                        type="button"
                        className="act-owner-filter-btn"
                        onClick={() => setIsOwnerFilterOpen(!isOwnerFilterOpen)}
                    >
                        <span>{selectedOwnerFilter}</span>
                        <ChevronDown size={14} color="#6B7280" />
                    </button>
                    {isOwnerFilterOpen && (
                        <div className="act-dropdown-menu">
                            {leadOwnerFilterOptions.map(own => (
                                <div
                                    key={own}
                                    className={`act-dropdown-item ${selectedOwnerFilter === own ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedOwnerFilter(own);
                                        setIsOwnerFilterOpen(false);
                                    }}
                                >
                                    <span>{own}</span>
                                    {selectedOwnerFilter === own && <Check size={14} color="#2563EB" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Refresh circular button */}
                <button
                    type="button"
                    className={`act-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
                    onClick={handleRefresh}
                    title="Refresh Activities"
                >
                    <RefreshCw size={16} />
                </button>

                {/* Blue "+ New" Button matching Screenshot 1 */}
                <button
                    type="button"
                    className="act-new-task-btn"
                    onClick={() => setIsCreateDrawerOpen(true)}
                >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>New</span>
                </button>

                {/* Status Group Pills (Overdue, Upcoming, Completed) */}
                <div className="act-status-pills-group">
                    <button
                        type="button"
                        className={`act-status-pill ${activeTab === 'overdue' ? 'active-overdue' : ''}`}
                        onClick={() => setActiveTab('overdue')}
                    >
                        <AlertTriangle size={14} />
                        <span>Overdue ({overdueCount})</span>
                    </button>

                    <button
                        type="button"
                        className={`act-status-pill ${activeTab === 'upcoming' ? 'active-upcoming' : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        <Calendar size={14} />
                        <span>Upcoming ({upcomingCount})</span>
                        <span style={{ fontSize: '11px', fontWeight: 700 }}>↑</span>
                    </button>

                    <button
                        type="button"
                        className={`act-status-pill ${activeTab === 'completed' ? 'active-completed' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        <CheckCircle2 size={14} />
                        <span>Completed ({completedCount})</span>
                    </button>
                </div>
            </div>

            {/* ---------------- Action Bar 2: Search (Screenshot 1) ---------------- */}
            <div className="activities-action-bar-2">
                <div className="act-search-box">
                    <Search size={15} color="#9CA3AF" />
                    <input
                        type="text"
                        className="act-search-input"
                        placeholder="Search activities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* ---------------- Main Content: Empty State or Table ---------------- */}
            <div className="activities-main-content">
                {filteredTasks.length === 0 ? (
                    <div className="activities-empty-state">
                        <div className="act-empty-icon-wrap">
                            <EmptyTaskIcon />
                        </div>
                        <p className="act-empty-text">No tasks available</p>
                    </div>
                ) : (
                    <div className="activities-table-wrapper">
                        <table className="activities-table">
                            <thead>
                                <tr>
                                    <th>Task Name</th>
                                    <th>Validator</th>
                                    <th>Company</th>
                                    <th>Contact</th>
                                    <th>Lead Owner</th>
                                    <th>Due Date & Time</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map(t => (
                                    <tr key={t.id}>
                                        <td style={{ fontWeight: 600 }}>{t.name}</td>
                                        <td>{t.validator}</td>
                                        <td>{t.company}</td>
                                        <td>{t.contact}</td>
                                        <td>{t.owner}</td>
                                        <td>{t.dueDate} • {t.dueTime}</td>
                                        <td>
                                            <span
                                                style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    backgroundColor: t.status === 'Upcoming' ? '#DCFCE7' : t.status === 'Completed' ? '#EFF6FF' : '#FEE2E2',
                                                    color: t.status === 'Upcoming' ? '#15803D' : t.status === 'Completed' ? '#2563EB' : '#DC2626'
                                                }}
                                            >
                                                {t.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    type="button"
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#10B981' }}
                                                    onClick={() => handleToggleComplete(t.id)}
                                                    title="Mark Complete"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444' }}
                                                    onClick={() => handleDeleteTask(t.id)}
                                                    title="Delete Task"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ---------------- Footer Pagination Bar (Screenshot 1) ---------------- */}
            <div className="activities-footer-bar">
                <div className="act-pill-total-tasks">
                    Total Tasks: <span className="act-blue-val">{tasks.length}</span>
                </div>
                <div className="act-pill-total-upcoming">
                    Total Upcoming: <span className="act-blue-val">{upcomingCount} / {tasks.length}</span>
                </div>
                <div className="act-pill-page">
                    Page: 1 / 1
                </div>

                <div className="act-rows-per-page-box">
                    <span>Rows per page: 10</span>
                    <span className="act-star-icon">☆</span>
                    <ChevronDown size={14} color="#6B7280" />
                </div>

                <div className="act-pagination-controls">
                    <button type="button" className="act-page-nav-btn" disabled>
                        <ChevronLeft size={16} />
                    </button>
                    <button type="button" className="act-page-nav-btn active">
                        1
                    </button>
                    <button type="button" className="act-page-nav-btn">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* ---------------- Slide-Over Drawer: Create Task (Screenshots 2 & 3) ---------------- */}
            {isCreateDrawerOpen && (
                <div className="create-task-drawer-overlay" onClick={() => setIsCreateDrawerOpen(false)}>
                    <div className="create-task-drawer-panel" onClick={(e) => e.stopPropagation()}>
                        {/* Drawer Header */}
                        <div className="create-task-drawer-header">
                            <div>
                                <h2 className="create-task-drawer-title">Create Task</h2>
                                <p className="create-task-drawer-subtitle">Fill in the details below</p>
                            </div>
                            <button
                                type="button"
                                className="create-task-close-btn"
                                onClick={() => setIsCreateDrawerOpen(false)}
                            >
                                Close
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="create-task-drawer-body">
                            <form onSubmit={handleCreateTask}>
                                <h3 className="task-section-heading">Basic Information</h3>

                                <div className="task-form-grid-2col">
                                    {/* Task Validator */}
                                    <div className="task-field-group">
                                        <label className="task-field-label">
                                            Task Validator<span className="task-red-star">*</span>
                                        </label>
                                        <div className="act-popover-anchor" ref={validatorRef}>
                                            <button
                                                type="button"
                                                className="task-dropdown-trigger"
                                                onClick={() => setIsValidatorDropdownOpen(!isValidatorDropdownOpen)}
                                            >
                                                <div className="task-validator-content">
                                                    <Phone size={15} color="#2563EB" />
                                                    <span>{taskValidator}</span>
                                                </div>
                                                <ChevronDown size={16} color="#6B7280" />
                                            </button>
                                            {isValidatorDropdownOpen && (
                                                <div className="task-dropdown-popover">
                                                    {taskValidatorOptions.map(tv => (
                                                        <div
                                                            key={tv.label}
                                                            className={`task-dropdown-option ${taskValidator === tv.label ? 'selected' : ''}`}
                                                            onClick={() => {
                                                                setTaskValidator(tv.label);
                                                                setTaskName(tv.label.replace(/\s*\(.*?\)/, ''));
                                                                setIsValidatorDropdownOpen(false);
                                                            }}
                                                        >
                                                            <Phone size={14} color="#2563EB" />
                                                            <span>{tv.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Lead Owner */}
                                    <div className="task-field-group">
                                        <label className="task-field-label">
                                            Lead Owner<span className="task-red-star">*</span>
                                        </label>
                                        <div className="act-popover-anchor" ref={taskOwnerRef}>
                                            <button
                                                type="button"
                                                className="task-dropdown-trigger"
                                                onClick={() => setIsTaskOwnerDropdownOpen(!isTaskOwnerDropdownOpen)}
                                            >
                                                <span className={leadOwner ? 'task-selected-text' : 'task-placeholder-text'}>
                                                    {leadOwner || 'Select lead owner'}
                                                </span>
                                                <ChevronDown size={16} color="#6B7280" />
                                            </button>
                                            {isTaskOwnerDropdownOpen && (
                                                <div className="task-dropdown-popover">
                                                    {taskLeadOwners.map(own => (
                                                        <div
                                                            key={own}
                                                            className={`task-dropdown-option ${leadOwner === own ? 'selected' : ''}`}
                                                            onClick={() => {
                                                                setLeadOwner(own);
                                                                setIsTaskOwnerDropdownOpen(false);
                                                            }}
                                                        >
                                                            <span>{own}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="task-field-group">
                                        <label className="task-field-label">
                                            Contact<span className="task-red-star">*</span>
                                        </label>
                                        <div className="act-popover-anchor" ref={contactRef}>
                                            <button
                                                type="button"
                                                className="task-dropdown-trigger"
                                                onClick={() => setIsContactDropdownOpen(!isContactDropdownOpen)}
                                            >
                                                <span className={contact ? 'task-selected-text' : 'task-placeholder-text'}>
                                                    {contact || 'Select contact'}
                                                </span>
                                                <ChevronDown size={16} color="#6B7280" />
                                            </button>
                                            {isContactDropdownOpen && (
                                                <div className="task-dropdown-popover">
                                                    {sampleContacts.map(c => (
                                                        <div
                                                            key={c}
                                                            className={`task-dropdown-option ${contact === c ? 'selected' : ''}`}
                                                            onClick={() => {
                                                                setContact(c);
                                                                setIsContactDropdownOpen(false);
                                                            }}
                                                        >
                                                            <span>{c}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Company */}
                                    <div className="task-field-group">
                                        <label className="task-field-label">
                                            Company<span className="task-red-star">*</span>
                                        </label>
                                        <div className="act-popover-anchor" ref={companyRef}>
                                            <button
                                                type="button"
                                                className="task-dropdown-trigger"
                                                onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                                            >
                                                <span className={company ? 'task-selected-text' : 'task-placeholder-text'}>
                                                    {company || 'Select company'}
                                                </span>
                                                <ChevronDown size={16} color="#6B7280" />
                                            </button>
                                            {isCompanyDropdownOpen && (
                                                <div className="task-dropdown-popover">
                                                    {companyOptions.map(co => (
                                                        <div
                                                            key={co}
                                                            className={`task-dropdown-option ${company === co ? 'selected' : ''}`}
                                                            onClick={() => {
                                                                setCompany(co);
                                                                setIsCompanyDropdownOpen(false);
                                                            }}
                                                        >
                                                            <span>{co}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Task Name (Full width) */}
                                    <div className="task-field-group task-field-fullwidth">
                                        <label className="task-field-label">
                                            Task Name<span className="task-red-star">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="task-text-input"
                                            value={taskName}
                                            onChange={(e) => setTaskName(e.target.value)}
                                            placeholder="Enter task name"
                                        />
                                    </div>

                                    {/* Due Date & Time (Full width) */}
                                    <div className="task-field-group task-field-fullwidth">
                                        <label className="task-field-label">
                                            Due Date<span className="task-red-star">*</span>
                                        </label>
                                        <div className="task-due-date-row">
                                            <div className="task-date-box">
                                                <input
                                                    type="date"
                                                    required
                                                    className="task-date-input"
                                                    value={dueDate}
                                                    onChange={(e) => setDueDate(e.target.value)}
                                                />
                                                <Calendar size={16} color="#2563EB" style={{ pointerEvents: 'none' }} />
                                            </div>
                                            <div className="task-time-box">
                                                <input
                                                    type="text"
                                                    required
                                                    className="task-time-input"
                                                    value={dueTime}
                                                    onChange={(e) => setDueTime(e.target.value)}
                                                    placeholder="Time"
                                                />
                                                <Clock size={16} color="#2563EB" style={{ pointerEvents: 'none' }} />
                                            </div>
                                        </div>
                                        <p className="task-error-text">Please select a due date and time</p>
                                    </div>

                                    {/* Description (Full width) */}
                                    <div className="task-field-group task-field-fullwidth">
                                        <label className="task-field-label">Description</label>
                                        <textarea
                                            className="task-textarea"
                                            rows={4}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="- Next steps&#10;- Any questions or concerns&#10;- Timeline for decision"
                                        />
                                    </div>
                                </div>

                                {/* Bottom Centered "+ Create" Button matching Screenshot 3 */}
                                <div className="task-bottom-action-row">
                                    <button type="submit" className="task-create-submit-btn">
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Activities;
