import React, { useState, useRef, useEffect } from 'react';
import './Sidebar.css';
import {
    LayoutGrid,
    Home,
    DollarSign,
    User,
    Building2,
    CheckCircle2,
    Calendar,
    BarChart2,
    Folder,
    Wallet,
    Receipt,
    ChevronsUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Check
} from 'lucide-react';

export const DealConverterLogo = ({ size = 26, color = '#2563EB' }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M8.5 21C5.46 21 3 18.54 3 15.5C3 12.46 5.46 10 8.5 10C11.5 10 13.8 12.8 16 15.5C18.2 18.2 20.5 21 23.5 21C26.54 21 29 18.54 29 15.5C29 12.46 26.54 10 23.5 10C20.5 10 18.2 12.8 16 15.5C13.8 18.2 11.5 21 8.5 21Z"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="8.5" cy="15.5" r="1.75" fill={color} />
        <circle cx="23.5" cy="15.5" r="1.75" fill={color} />
    </svg>
);

const InstagramIcon = ({ size = 16, color = '#E11D48' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const QuotationIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M12 18v-6"></path>
        <path d="M10 13.5a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 0 3h-1a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 0 1.5-1.5"></path>
    </svg>
);

const crmItems = [
    { label: 'Deals', icon: DollarSign },
    { label: 'Contacts', icon: User },
    { label: 'Companies', icon: Building2 },
    { label: 'Activities', icon: CheckCircle2 },
    { label: 'Attendance', icon: Calendar },
    { label: 'Reports', icon: BarChart2 },
    { label: 'File Cabinet', icon: Folder },
];

const financeItems = [
    { label: 'Quotation', icon: QuotationIcon },
    { label: 'Invoice', icon: Receipt },
];

const Sidebar = ({ currentPage = 'Home', setCurrentPage, isCollapsed, setIsCollapsed }) => {
    const [selectedWorkspace, setSelectedWorkspace] = useState('Sales Workspace');
    const [workspaceOpen, setWorkspaceOpen] = useState(false);
    const [crmExpanded, setCrmExpanded] = useState(true);
    const [financeExpanded, setFinanceExpanded] = useState(true);

    const workspaceRef = useRef(null);
    const autoCloseTimerRef = useRef(null);

    const cancelAutoCloseTimer = React.useCallback(() => {
        if (autoCloseTimerRef.current) {
            clearTimeout(autoCloseTimerRef.current);
        }
    }, []);

    const startAutoCloseTimer = React.useCallback((delay = 2000) => {
        cancelAutoCloseTimer();
        autoCloseTimerRef.current = setTimeout(() => {
            setIsCollapsed(true);
            setWorkspaceOpen(false);
        }, delay);
    }, [cancelAutoCloseTimer, setIsCollapsed]);

    // Auto-close within 2 seconds whenever expanded
    useEffect(() => {
        if (!isCollapsed) {
            startAutoCloseTimer(2000);
        } else {
            cancelAutoCloseTimer();
        }
        return () => cancelAutoCloseTimer();
    }, [isCollapsed, startAutoCloseTimer, cancelAutoCloseTimer]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (workspaceRef.current && !workspaceRef.current.contains(event.target)) {
                setWorkspaceOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleWorkspaceSelect = (ws) => {
        setSelectedWorkspace(ws);
        setWorkspaceOpen(false);
        startAutoCloseTimer(2000);
    };

    const handleNavClick = (pageName) => {
        if (setCurrentPage) {
            setCurrentPage(pageName);
        }
        // Automatically close within 2 seconds after selecting
        startAutoCloseTimer(2000);
    };

    const handleCollapsedItemClick = (type) => {
        setIsCollapsed(false);
        if (type === 'crm') {
            setCrmExpanded(true);
        } else if (type === 'finance') {
            setFinanceExpanded(true);
        } else if (type === 'workspace') {
            setWorkspaceOpen(true);
        }
        startAutoCloseTimer(2000);
    };

    const isCrmActive = [
        'Deals',
        'Contacts',
        'Companies',
        'Bulk Import',
        'Add Company',
        'Activities',
        'Attendance',
        'Reports',
        'File Cabinet'
    ].includes(currentPage);

    const isFinanceActive = [
        'Quotation',
        'Invoice'
    ].includes(currentPage);

    return (
        <aside
            className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
            onMouseEnter={() => cancelAutoCloseTimer()}
            onMouseLeave={() => {
                if (!isCollapsed) {
                    startAutoCloseTimer(2000);
                }
            }}
        >
            {/* Top Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon-wrapper">
                    <DealConverterLogo size={26} color="#2563EB" />
                </div>
                {!isCollapsed && <span className="logo-text">DealConverter</span>}
            </div>

            {/* Workspace Selector */}
            <div className="workspace-container" ref={workspaceRef}>
                <button
                    type="button"
                    className="workspace-btn"
                    onClick={() => {
                        if (isCollapsed) {
                            handleCollapsedItemClick('workspace');
                        } else {
                            setWorkspaceOpen(!workspaceOpen);
                            startAutoCloseTimer(2000);
                        }
                    }}
                    title={isCollapsed ? selectedWorkspace : undefined}
                >
                    <div className="workspace-btn-left">
                        <LayoutGrid size={21} className="workspace-icon" />
                        {!isCollapsed && <span className="workspace-name">{selectedWorkspace}</span>}
                    </div>
                    {!isCollapsed && <ChevronsUpDown size={15} className="workspace-chevrons" />}
                </button>

                {/* Workspace Dropdown Menu */}
                {workspaceOpen && (
                    <div className={`workspace-dropdown-menu ${isCollapsed ? 'collapsed-flyout' : ''}`}>
                        <div
                            className={`workspace-option ${selectedWorkspace === 'Sales Workspace' ? 'active' : ''}`}
                            onClick={() => handleWorkspaceSelect('Sales Workspace')}
                        >
                            <div className="workspace-option-left">
                                <LayoutGrid size={16} color="#2563EB" />
                                <span>Sales Workspace</span>
                            </div>
                            {selectedWorkspace === 'Sales Workspace' && (
                                <Check size={16} color="#2563EB" className="workspace-check" />
                            )}
                        </div>

                        <div
                            className={`workspace-option ${selectedWorkspace === 'Marketing Workspace' ? 'active' : ''}`}
                            onClick={() => handleWorkspaceSelect('Marketing Workspace')}
                        >
                            <div className="workspace-option-left">
                                <InstagramIcon size={16} color="#E11D48" />
                                <span>Marketing Workspace</span>
                            </div>
                            {selectedWorkspace === 'Marketing Workspace' && (
                                <Check size={16} color="#2563EB" className="workspace-check" />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Body */}
            <nav className="sidebar-nav">
                {/* Home Button */}
                <div
                    className={`home-nav-item ${currentPage === 'Home' ? 'active' : ''}`}
                    onClick={() => handleNavClick('Home')}
                    title="Home"
                >
                    <div className="home-nav-content">
                        <Home size={19} className="home-icon" />
                        {!isCollapsed && <span className="home-text">Home</span>}
                    </div>
                </div>

                {/* CRM Section */}
                <div className="nav-group">
                    <div
                        className={`group-header ${isCrmActive ? 'active' : ''}`}
                        onClick={() => {
                            if (isCollapsed) {
                                handleCollapsedItemClick('crm');
                            } else {
                                setCrmExpanded(!crmExpanded);
                                startAutoCloseTimer(2000);
                            }
                        }}
                        title={isCollapsed ? 'CRM' : undefined}
                    >
                        <div className="group-header-left">
                            <LayoutGrid size={21} className="group-icon crm-icon" />
                            {!isCollapsed && <span className="group-title">CRM</span>}
                        </div>
                        {!isCollapsed && (
                            <ChevronDown
                                size={15}
                                className={`group-chevron ${crmExpanded ? 'expanded' : ''}`}
                            />
                        )}
                    </div>

                    {!isCollapsed && crmExpanded && (
                        <div className="sub-items-list">
                            {crmItems.map((item) => {
                                const ItemIcon = item.icon;
                                const isActive = currentPage === item.label || (['Bulk Import', 'Add Company'].includes(currentPage) && item.label === 'Companies');
                                return (
                                    <div
                                        key={item.label}
                                        className={`sub-item ${isActive ? 'active' : ''}`}
                                        onClick={() => handleNavClick(item.label)}
                                    >
                                        <ItemIcon size={16} className="sub-item-icon" />
                                        <span className="sub-item-label">{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Finance Section */}
                <div className="nav-group">
                    <div
                        className={`group-header ${isFinanceActive ? 'active' : ''}`}
                        onClick={() => {
                            if (isCollapsed) {
                                handleCollapsedItemClick('finance');
                            } else {
                                setFinanceExpanded(!financeExpanded);
                                startAutoCloseTimer(2000);
                            }
                        }}
                        title={isCollapsed ? 'Finance' : undefined}
                    >
                        <div className="group-header-left">
                            <Wallet size={21} className="group-icon finance-icon" />
                            {!isCollapsed && <span className="group-title">Finance</span>}
                        </div>
                        {!isCollapsed && (
                            <ChevronDown
                                size={15}
                                className={`group-chevron ${financeExpanded ? 'expanded' : ''}`}
                            />
                        )}
                    </div>

                    {!isCollapsed && financeExpanded && (
                        <div className="sub-items-list">
                            {financeItems.map((item) => {
                                const ItemIcon = item.icon;
                                const isActive = currentPage === item.label;
                                return (
                                    <div
                                        key={item.label}
                                        className={`sub-item ${isActive ? 'active' : ''}`}
                                        onClick={() => handleNavClick(item.label)}
                                    >
                                        <ItemIcon size={16} className="sub-item-icon" />
                                        <span className="sub-item-label">{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </nav>

            {/* Bottom Collapse Button */}
            <div className="sidebar-footer">
                <button
                    type="button"
                    className="collapse-btn"
                    onClick={() => {
                        const nextState = !isCollapsed;
                        setIsCollapsed(nextState);
                        if (!nextState) {
                            startAutoCloseTimer(2000);
                        }
                    }}
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? (
                        <ChevronRight size={16} color="#64748B" />
                    ) : (
                        <ChevronLeft size={16} color="#64748B" />
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
