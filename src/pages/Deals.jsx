import React, { useState, useRef, useEffect } from 'react';
import './Deals.css';
import {
    RefreshCw,
    Plus,
    Calendar,
    ChevronDown,
    List,
    MoreVertical,
    Check,
    Phone,
    Mail,
    ArrowUpDown,
    GripVertical,
    Pointer,
    Infinity as InfinityIcon,
    Layers,
    Tag,
    Circle,
    X,
    Equal,
    CheckCircle2,
    XCircle,
    History,
    CalendarDays,
    ArrowLeft,
    ChevronLeft,
    Clock,
    Flag,
    Bookmark
} from 'lucide-react';
import OwnerFilter from '../components/dashboard/OwnerFilter';

const initialDeals = [
    { id: 1, title: 'Manali group tour', owner: 'Sahil', value: '126600.00', date: '03/04/2026', initial: 'A', stage: 'Closed Won' },
    { id: 2, title: 'manali grp trip', owner: 'mahesh', value: '15000.00', date: '06/04/2026', initial: 'A', stage: 'Closed Won' }
];

const initialStages = [
    { id: 'qual', name: 'Qualification', color: '#F59E0B', bgColor: '#FFF8EC', percentage: '16%', type: 'open', enabled: true },
    { id: 'needs', name: 'Needs Analysis', color: '#38BDF8', bgColor: '#F0F7FD', percentage: '33%', type: 'open', enabled: true },
    { id: 'prop', name: 'Proposal', color: '#C084FC', bgColor: '#F7F3FB', percentage: '50%', type: 'open', enabled: true },
    { id: 'neg', name: 'Negotiation', color: '#2DD4BF', bgColor: '#F0F8F6', percentage: '66%', type: 'open', enabled: true },
    { id: 'won', name: 'Closed Won', color: '#10B981', bgColor: '#F0FAF5', percentage: '100%', type: 'won', enabled: true },
    { id: 'lost', name: 'Closed Lost', color: '#EF4444', bgColor: '#FEF4F4', percentage: '100%', type: 'lost', enabled: true },
];

const timeFilterOptions = [
    { label: 'All Time', icon: InfinityIcon },
    { label: 'Today', icon: Calendar },
    { label: 'Yesterday', icon: History },
    { label: 'This Week', icon: CalendarDays },
    { label: 'Last Week', icon: ArrowLeft },
    { label: 'This Month', icon: Calendar },
    { label: 'Last Month', icon: ChevronLeft },
    { label: 'This Year', icon: Calendar },
    { label: 'Last Year', icon: Clock },
    { label: 'Custom', icon: Calendar },
];

const Deals = () => {
    const [deals, setDeals] = useState(initialDeals);
    const [stages, setStages] = useState(initialStages);
    const [refresh, setRefresh] = useState(false);
    const [priorityOpen, setPriorityOpen] = useState(false);
    const [timeOpen, setTimeOpen] = useState(false);
    const [selectedPriority, setSelectedPriority] = useState('All Priorities');
    const [selectedTime, setSelectedTime] = useState('All Time');

    // Modals
    const [isManageStagesOpen, setIsManageStagesOpen] = useState(false);
    const [isReorderStagesOpen, setIsReorderStagesOpen] = useState(false);
    const [newStageName, setNewStageName] = useState('');
    const [newStageType, setNewStageType] = useState('Open');
    const [reorderStagesList, setReorderStagesList] = useState([]);

    // Create New Deal Side-Panel State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        contact: '',
        products: '',
        dueDate: '2/10/2026',
        value: '',
        owner: 'Arun',
        stage: 'Qualification',
        priority: 'Low'
    });

    const pRef = useRef(null);
    const tRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (pRef.current && !pRef.current.contains(e.target)) {
                setPriorityOpen(false);
            }
            if (tRef.current && !tRef.current.contains(e.target)) {
                setTimeOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Open Reorder Modal
    const handleOpenReorder = () => {
        setReorderStagesList([...stages]);
        setIsReorderStagesOpen(true);
    };

    // Toggle stage in Reorder Modal
    const handleToggleStageEnabled = (stageId) => {
        setReorderStagesList(prev => prev.map(s => s.id === stageId ? { ...s, enabled: !s.enabled } : s));
    };

    // Save Reorder Modal
    const handleSaveReorder = () => {
        setStages(reorderStagesList);
        setIsReorderStagesOpen(false);
    };

    // Add stage in Manage Stages Modal
    const handleAddNewStage = (e) => {
        if (e) e.preventDefault();
        if (!newStageName.trim()) return;

        const newId = 'stage_' + Date.now();
        const colors = ['#F59E0B', '#38BDF8', '#C084FC', '#2DD4BF', '#EC4899', '#6366F1'];
        const randomColor = colors[stages.filter(s => s.type === 'open').length % colors.length];

        const newStageObj = {
            id: newId,
            name: newStageName.trim(),
            color: randomColor,
            bgColor: '#F8FAFC',
            percentage: '20%',
            type: 'open',
            enabled: true
        };

        // Insert before won & lost
        const openStagesList = stages.filter(s => s.type === 'open');
        const closedStagesList = stages.filter(s => s.type !== 'open');
        setStages([...openStagesList, newStageObj, ...closedStagesList]);
        setNewStageName('');
    };

    // Remove stage in Manage Stages Modal
    const handleRemoveStage = (stageId) => {
        setStages(prev => prev.filter(s => s.id !== stageId));
    };

    const handleOpenCreate = (stageName = 'Qualification') => {
        setFormData(prev => ({
            ...prev,
            stage: stageName,
            title: '',
            value: ''
        }));
        setIsCreateOpen(true);
    };

    const handleCloseCreate = () => {
        setIsCreateOpen(false);
    };

    const handleCreateDeal = (e) => {
        if (e) e.preventDefault();
        const newDeal = {
            id: Date.now(),
            title: formData.title.trim() || 'New Deal',
            owner: formData.owner || 'Arun',
            value: formData.value.trim() || '0.00',
            date: '02/10/2026',
            initial: 'A',
            stage: formData.stage
        };
        setDeals(prev => [...prev, newDeal]);
        setIsCreateOpen(false);
    };

    const getStageDeals = (stageName) => {
        return deals.filter(d => d.stage === stageName);
    };

    const getStageAmount = (stageName) => {
        const stageDeals = getStageDeals(stageName);
        const sum = stageDeals.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);
        return sum.toFixed(2);
    };

    // Enabled stages only for display
    const visibleStages = stages.filter(s => s.enabled);
    const openStages = stages.filter(s => s.type === 'open');

    return (
        <div className="deals-page">
            {/* Main Toolbar */}
            <div className="deals-toolbar">
                <div className="toolbar-left">
                    <div className="pipeline-selector">
                        <div className="pipeline-icon">S</div>
                        <span>Sales Pipeline</span>
                        <span className="star-icon">⭐</span>
                        <ChevronDown size={14} color="#6B7280" />
                    </div>
                </div>

                <div className="toolbar-center">
                    <div className="scroll-tip">
                        <List size={13} color="#059669" />
                        <span className="scroll-tip-label">Scroll via</span>
                        <span className="key-hint"><ArrowUpDown size={11} className="hint-icon" /> Shift+Scroll</span>
                        <span className="key-hint"><GripVertical size={11} className="hint-icon" /> Drag bar</span>
                        <span className="key-hint"><Pointer size={11} className="hint-icon" /> 2-finger</span>
                    </div>
                </div>

                <div className="toolbar-right">
                    <div className="owner-filter-wrapper">
                        <OwnerFilter defaultLabel="All Lead Owners" />
                    </div>

                    <button
                        type="button"
                        className="icon-action-btn"
                        onClick={() => setRefresh(!refresh)}
                        title="Refresh"
                    >
                        <RefreshCw size={15} color="#4B5563" />
                    </button>

                    <button
                        type="button"
                        className="add-stage-btn"
                        onClick={() => setIsManageStagesOpen(true)}
                    >
                        <Plus size={15} color="#111827" /> Add Stage
                    </button>

                    <button
                        type="button"
                        className="reorder-btn"
                        onClick={handleOpenReorder}
                    >
                        <List size={15} color="#111827" /> Reorder Stages
                    </button>
                </div>
            </div>

            {/* Sub Toolbar */}
            <div className="deals-sub-toolbar">
                <div className="filters-left">
                    {/* All Priorities Dropdown (Image 5) */}
                    <div
                        ref={pRef}
                        className="filter-dropdown-btn"
                        onClick={() => setPriorityOpen(!priorityOpen)}
                    >
                        <span>{selectedPriority}</span>
                        <ChevronDown size={14} color="#6B7280" />
                        {priorityOpen && (
                            <div className="priority-menu dropdown-menu">
                                <div className="priority-header-item">
                                    All Priorities
                                </div>
                                <div
                                    className="menu-item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPriority('Low');
                                        setPriorityOpen(false);
                                    }}
                                >
                                    <Flag size={14} color="#E11D48" fill="#E11D48" />
                                    <span>Low</span>
                                </div>
                                <div
                                    className="menu-item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPriority('Medium');
                                        setPriorityOpen(false);
                                    }}
                                >
                                    <Flag size={14} color="#F59E0B" fill="#F59E0B" />
                                    <span>Medium</span>
                                </div>
                                <div
                                    className="menu-item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPriority('High');
                                        setPriorityOpen(false);
                                    }}
                                >
                                    <Flag size={14} color="#DC2626" fill="#DC2626" />
                                    <span>High</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* All Time Dropdown (Image 4) */}
                    <div
                        ref={tRef}
                        className="filter-dropdown-btn multi"
                        onClick={() => setTimeOpen(!timeOpen)}
                    >
                        <div className="icon-text">
                            <InfinityIcon size={15} color="#2563EB" />
                            <span>{selectedTime}</span>
                        </div>
                        <ChevronDown size={14} color="#6B7280" />
                        {timeOpen && (
                            <div className="time-menu dropdown-menu tall-dropdown">
                                {timeFilterOptions.map((item) => {
                                    const ItemIcon = item.icon;
                                    const isActive = selectedTime === item.label;
                                    return (
                                        <div
                                            key={item.label}
                                            className={`menu-item time-item ${isActive ? 'active-time-item' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedTime(item.label);
                                                setTimeOpen(false);
                                            }}
                                        >
                                            <ItemIcon size={14} color="#2563EB" />
                                            <span>{item.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="metrics-right">
                    <div className="deals-count">10 Deals</div>
                    <div className="deals-value">₹ 560238.00</div>
                </div>
            </div>

            {/* Kanban Pipeline Board (Matching media_1790327064584.png) */}
            <div className="pipeline-board-container">
                <div className="pipeline-board">
                    {visibleStages.map((stage) => {
                        const stageDeals = getStageDeals(stage.name);
                        const count = stage.id === 'won' ? (stageDeals.length || 2) : stageDeals.length;
                        const amount = stage.id === 'won' ? (stageDeals.length ? getStageAmount(stage.name) : '141600.00') : getStageAmount(stage.name);

                        return (
                            <div key={stage.id} className="pipeline-column-wrapper">
                                {/* The main colored box */}
                                <div
                                    className="column-box"
                                    style={{ backgroundColor: stage.bgColor }}
                                >
                                    {/* Column Header */}
                                    <div className="column-header">
                                        <div className="col-top">
                                            <h3 className="col-title">{stage.name}</h3>
                                            <span className="col-count" style={{ color: stage.color }}>{count}</span>
                                        </div>
                                        <div className="col-stats">
                                            <span className="amount">₹{amount}</span>
                                            <span className="deals">{count} deals</span>
                                        </div>
                                    </div>

                                    {/* Colored Horizontal Divider Strip */}
                                    <div
                                        className="column-color-divider"
                                        style={{ backgroundColor: stage.color }}
                                    />

                                    {/* In Pipeline Progress Ring */}
                                    <div className="column-progress-row">
                                        <div
                                            className="progress-ring"
                                            style={{
                                                background: `conic-gradient(${stage.color} 0% ${stage.percentage}, #E5E7EB ${stage.percentage} 100%)`
                                            }}
                                        >
                                            <div
                                                className="progress-ring-inner"
                                                style={{ backgroundColor: stage.bgColor }}
                                            >
                                                {stage.percentage}
                                            </div>
                                        </div>
                                        <div className="progress-text-block">
                                            <span className="progress-status-title">
                                                {stage.name === 'Closed Won' ? 'Closed Won' : 'In Pipeline'}
                                            </span>
                                            <span className="progress-activity-subtitle">
                                                Total activity: {count} items
                                            </span>
                                        </div>
                                    </div>

                                    {/* Deal Cards (if any exist) */}
                                    {stageDeals.length > 0 && (
                                        <div className="column-cards-list">
                                            {stageDeals.map((deal) => (
                                                <div key={deal.id} className="deal-card">
                                                    <div className="deal-title-row">
                                                        <span className="deal-title">{deal.title}</span>
                                                        <span className="flag low">⚑</span>
                                                    </div>
                                                    <div className="deal-owner">{deal.owner} •</div>
                                                    <div className="deal-meta">
                                                        <span className="deal-val">₹{deal.value}</span>
                                                        <span className="dot">•</span>
                                                        <span className="deal-date">{deal.date}</span>
                                                    </div>
                                                    <div className="deal-divider"></div>
                                                    <div className="deal-actions">
                                                        <div className="action-icons">
                                                            <div className="avatar-circle">A</div>
                                                            <div className="icon-circle check"><Check size={10} color="#fff" /></div>
                                                            <div className="icon-circle phone"><Phone size={10} color="#10B981" /></div>
                                                            <div className="icon-circle mail"><Mail size={10} color="#F59E0B" /></div>
                                                        </div>
                                                        <MoreVertical size={16} color="#9CA3AF" className="more-action" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* + Add Deal Button placed on white canvas below the box */}
                                <div
                                    className="column-add-deal-btn"
                                    onClick={() => handleOpenCreate(stage.name)}
                                >
                                    <Plus size={15} strokeWidth={2.4} />
                                    <span>Add Deal</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ================================================= */}
                {/* 1. MANAGE PIPELINE STAGES MODAL (Image 1)         */}
                {/* ================================================= */}
                {isManageStagesOpen && (
                    <div className="deals-modal-backdrop" onClick={() => setIsManageStagesOpen(false)}>
                        <div className="manage-stages-modal" onClick={(e) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="modal-top-header">
                                <div className="modal-title-box">
                                    <div className="modal-badge-icon purple-badge">
                                        <Layers size={20} color="#4F46E5" />
                                    </div>
                                    <h2 className="modal-main-title">Manage Pipeline Stages</h2>
                                </div>
                            </div>

                            {/* Modal Form */}
                            <div className="modal-form-content">
                                <div className="modal-input-section">
                                    <label className="section-label">Add New Stage</label>
                                    <div className="stage-name-input-box">
                                        <Tag size={16} color="#2563EB" />
                                        <input
                                            type="text"
                                            className="modal-text-input"
                                            placeholder="Stage Name"
                                            value={newStageName}
                                            onChange={(e) => setNewStageName(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddNewStage(e); }}
                                        />
                                    </div>

                                    <div className="stage-type-toggle-box">
                                        <div className="stage-type-left">
                                            <Circle size={16} color="#2563EB" />
                                            <span>Stage Type</span>
                                        </div>
                                        <div className="stage-type-right">
                                            <div className="open-type-pill">Open</div>
                                            <div
                                                className="type-toggle-switch"
                                                onClick={() => setNewStageType(newStageType === 'Open' ? 'Closed' : 'Open')}
                                            >
                                                <div className="toggle-circle" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Open Stages List with Red Delete Buttons */}
                                <div className="open-stages-section">
                                    <div className="open-stages-header">
                                        <div className="blue-bar-indicator" />
                                        <span className="open-stages-title">Open Stages</span>
                                        <div className="stage-count-badge">{openStages.length}</div>
                                    </div>

                                    <div className="stages-chips-grid">
                                        {openStages.map((stage) => (
                                            <div key={stage.id} className="stage-chip-card">
                                                <Bookmark size={14} color="#2563EB" fill="#2563EB" />
                                                <span className="stage-chip-title">{stage.name}</span>
                                                <div
                                                    className="delete-chip-btn"
                                                    onClick={() => handleRemoveStage(stage.id)}
                                                    title="Delete stage"
                                                >
                                                    <X size={10} color="#FFFFFF" strokeWidth={3} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="modal-footer-row">
                                <button
                                    type="button"
                                    className="modal-cancel-btn"
                                    onClick={() => setIsManageStagesOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="modal-submit-blue-btn"
                                    onClick={handleAddNewStage}
                                >
                                    <Plus size={16} /> Add Stage
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================================================= */}
                {/* 2. REORDER STAGES MODAL (Image 2 & Image 3)       */}
                {/* ================================================= */}
                {isReorderStagesOpen && (
                    <div className="deals-modal-backdrop" onClick={() => setIsReorderStagesOpen(false)}>
                        <div className="reorder-stages-modal" onClick={(e) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="reorder-header">
                                <div className="reorder-header-left">
                                    <div className="modal-badge-icon purple-badge">
                                        <List size={20} color="#4F46E5" />
                                    </div>
                                    <h2 className="modal-main-title">Reorder Stages</h2>
                                </div>
                                <button
                                    type="button"
                                    className="reorder-close-btn"
                                    onClick={() => setIsReorderStagesOpen(false)}
                                >
                                    <X size={18} color="#4F46E5" />
                                </button>
                            </div>

                            {/* Reorder Body */}
                            <div className="reorder-body">
                                {/* Open Stages Section */}
                                <div className="reorder-group-section">
                                    <div className="reorder-group-header">
                                        <div className="group-header-left-title">
                                            <Circle size={16} color="#3B82F6" />
                                            <span>Open Stages</span>
                                        </div>
                                        <div className="active-pill-badge">Active</div>
                                    </div>

                                    <div className="reorder-items-box">
                                        {reorderStagesList.filter(s => s.type === 'open').map((stage) => (
                                            <div key={stage.id} className="reorder-stage-row">
                                                <div className="reorder-stage-left">
                                                    <div className="equal-handle-badge">
                                                        <Equal size={14} color="#4F46E5" />
                                                    </div>
                                                    <span className="reorder-stage-name">{stage.name}</span>
                                                </div>
                                                <div
                                                    className={`reorder-toggle-switch ${stage.enabled ? 'enabled' : 'disabled'}`}
                                                    onClick={() => handleToggleStageEnabled(stage.id)}
                                                >
                                                    <div className="reorder-toggle-knob" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Closed Won Section (Image 3) */}
                                <div className="reorder-group-section">
                                    <div className="reorder-group-header">
                                        <div className="group-header-left-title">
                                            <CheckCircle2 size={16} color="#10B981" />
                                            <span>Closed Won</span>
                                        </div>
                                        <div className="won-pill-badge">Won</div>
                                    </div>

                                    <div className="reorder-items-box">
                                        {reorderStagesList.filter(s => s.type === 'won').map((stage) => (
                                            <div key={stage.id} className="reorder-stage-row">
                                                <div className="reorder-stage-left">
                                                    <div className="equal-handle-badge green-badge">
                                                        <Equal size={14} color="#059669" />
                                                    </div>
                                                    <span className="reorder-stage-name">{stage.name}</span>
                                                </div>
                                                <div
                                                    className="reorder-won-toggle"
                                                    onClick={() => handleToggleStageEnabled(stage.id)}
                                                >
                                                    <div className="won-knob-circle">
                                                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Closed Lost Section (Image 3) */}
                                <div className="reorder-group-section">
                                    <div className="reorder-group-header">
                                        <div className="group-header-left-title">
                                            <XCircle size={16} color="#EF4444" />
                                            <span>Closed Lost</span>
                                        </div>
                                        <div className="lost-pill-badge">Lost</div>
                                    </div>

                                    <div className="reorder-items-box">
                                        {reorderStagesList.filter(s => s.type === 'lost').map((stage) => (
                                            <div key={stage.id} className="reorder-stage-row">
                                                <div className="reorder-stage-left">
                                                    <div className="equal-handle-badge red-badge">
                                                        <Equal size={14} color="#DC2626" />
                                                    </div>
                                                    <span className="reorder-stage-name">{stage.name}</span>
                                                </div>
                                                <div
                                                    className="reorder-lost-toggle"
                                                    onClick={() => handleToggleStageEnabled(stage.id)}
                                                >
                                                    <div className="lost-knob-circle">
                                                        <X size={12} color="#FFFFFF" strokeWidth={3} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Reorder Footer */}
                            <div className="reorder-footer-row">
                                <button
                                    type="button"
                                    className="reorder-cancel-btn"
                                    onClick={() => setIsReorderStagesOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="reorder-save-btn"
                                    onClick={handleSaveReorder}
                                >
                                    Save Order
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================================================= */}
                {/* 3. CREATE NEW DEAL DRAWER (Image 2 from before)   */}
                {/* ================================================= */}
                {isCreateOpen && (
                    <div className="create-deal-drawer">
                        <div className="drawer-header">
                            <div className="drawer-header-left">
                                <h2 className="drawer-title">Create New Deal</h2>
                                <p className="drawer-subtitle">Fill in the details below</p>
                            </div>
                            <div className="drawer-header-actions">
                                <button
                                    type="button"
                                    className="drawer-create-top-btn"
                                    onClick={handleCreateDeal}
                                >
                                    Create
                                </button>
                                <button
                                    type="button"
                                    className="drawer-close-top-btn"
                                    onClick={handleCloseCreate}
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <form className="drawer-body" onSubmit={handleCreateDeal}>
                            <h3 className="form-section-title">Basic Information</h3>

                            <div className="form-grid">
                                {/* Title */}
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter Title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        autoFocus
                                    />
                                </div>

                                {/* Company Name */}
                                <div className="form-group">
                                    <label className="form-label">Company Name</label>
                                    <div className="select-wrapper">
                                        <select
                                            className="form-select"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        >
                                            <option value="">Search company...</option>
                                            <option value="Ivory Holidays">Ivory Holidays</option>
                                            <option value="Acme Corp">Acme Corp</option>
                                            <option value="Tech Solutions">Tech Solutions</option>
                                        </select>
                                        <ChevronDown size={14} className="select-chevron" />
                                    </div>
                                </div>

                                {/* Contact* */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Contact<span className="required-star">*</span>
                                    </label>
                                    <div className="select-wrapper">
                                        <select
                                            className="form-select"
                                            value={formData.contact}
                                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                        >
                                            <option value="">Search contact...</option>
                                            <option value="Sahil">Sahil</option>
                                            <option value="Mahesh">Mahesh</option>
                                            <option value="Arun">Arun</option>
                                        </select>
                                        <ChevronDown size={14} className="select-chevron" />
                                    </div>
                                </div>

                                {/* Products */}
                                <div className="form-group">
                                    <label className="form-label">Products</label>
                                    <div className="select-wrapper">
                                        <select
                                            className="form-select"
                                            value={formData.products}
                                            onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                                        >
                                            <option value="">Select products</option>
                                            <option value="Holiday Package">Holiday Package</option>
                                            <option value="Custom Tour">Custom Tour</option>
                                            <option value="Flight & Hotel">Flight & Hotel</option>
                                        </select>
                                        <ChevronDown size={14} className="select-chevron" />
                                    </div>
                                </div>

                                {/* Due Date */}
                                <div className="form-group">
                                    <label className="form-label">Due Date</label>
                                    <div className="input-with-icon">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        />
                                        <Calendar size={16} className="input-cal-icon" />
                                    </div>
                                </div>

                                {/* Value */}
                                <div className="form-group">
                                    <label className="form-label">Value</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter Value"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    />
                                </div>

                                {/* Owner* */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Owner<span className="required-star">*</span>
                                    </label>
                                    <div className="owner-select-box">
                                        <div className="owner-chip">
                                            <div className="owner-avatar-letter">A</div>
                                            <span className="owner-chip-name">{formData.owner}</span>
                                        </div>
                                        <ChevronDown size={14} color="#6B7280" />
                                    </div>
                                </div>

                                {/* Stage */}
                                <div className="form-group">
                                    <label className="form-label">Stage</label>
                                    <div className="stage-select-box">
                                        <div className="stage-chip">
                                            <div className="stage-letter-badge">
                                                {formData.stage ? formData.stage.charAt(0) : 'Q'}
                                            </div>
                                            <span className="stage-chip-name">{formData.stage}</span>
                                        </div>
                                        <select
                                            className="stage-hidden-select"
                                            value={formData.stage}
                                            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                                        >
                                            {stages.map(s => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} color="#6B7280" />
                                    </div>
                                </div>

                                {/* Priority */}
                                <div className="form-group">
                                    <label className="form-label">Priority</label>
                                    <div className="select-wrapper">
                                        <select
                                            className="form-select"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                        <ChevronDown size={14} className="select-chevron" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="create-deal-main-btn"
                                onClick={handleCreateDeal}
                            >
                                Create Deal
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Deals;
