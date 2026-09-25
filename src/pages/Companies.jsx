import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    RefreshCw,
    FileSpreadsheet,
    ChevronLeft,
    ChevronRight,
    Users,
    RotateCcw,
    BarChart2,
    ArrowLeft,
    Calendar,
    X,
    Plus,
    Check,
    Briefcase,
    UploadCloud,
    Download
} from 'lucide-react';
import './Companies.css';
import AddCompany from './AddCompany';

// Empty Tray SVG Icon matching DealConverter screenshot
const EmptyTrayIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 14h5a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2h5" />
    </svg>
);

// 3-Bar icon for the blue Column Settings button
const ThreeBarsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1.5" y="2" width="3" height="12" rx="1" />
        <rect x="6.5" y="2" width="3" height="12" rx="1" />
        <rect x="11.5" y="2" width="3" height="12" rx="1" />
    </svg>
);

// Blue Contact Book icon for All Companies trigger (matching Screenshot 1)
const ContactBookIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect width="20" height="20" x="2" y="2" rx="4" fill="#3B82F6" />
        <path d="M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" fill="#FFFFFF" />
        <path d="M6 18c0-2.5 2.5-4 6-4s6 1.5 6 4" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="3" cy="7" r="1" fill="#FFFFFF" />
        <circle cx="3" cy="12" r="1" fill="#FFFFFF" />
        <circle cx="3" cy="17" r="1" fill="#FFFFFF" />
    </svg>
);

// Funnel Filter lines icon (Screenshot 1)
const FunnelIcon = ({ size = 18, color = '#2563EB' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <line x1="9" y1="18" x2="15" y2="18" />
    </svg>
);

// 3-Bar Drag / Column indicator icon in periwinkle (Screenshots 3 & 4)
const ColumnDragBars = () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="2.5" height="12" rx="1.2" fill="#A5B4FC" />
        <rect x="6.75" y="2" width="2.5" height="12" rx="1.2" fill="#A5B4FC" />
        <rect x="11.5" y="2" width="2.5" height="12" rx="1.2" fill="#A5B4FC" />
    </svg>
);

// TT (Text type) field icon (Screenshot 4 & 5)
const TextTypeIcon = () => (
    <span style={{ color: '#818CF8', fontWeight: 800, fontSize: '13px', lineHeight: 1, letterSpacing: '-0.5px' }}>
        Tt
    </span>
);

// Split branch / Lead source icon (Screenshot 4 & 5)
const SplitBranchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#818CF8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h6l4-3h3" />
        <path d="M4 14h6l4 3h3" />
        <circle cx="17" cy="3" r="1.5" fill="#818CF8" />
        <circle cx="17" cy="17" r="1.5" fill="#818CF8" />
    </svg>
);

// Checkbox field icon (Screenshot 4 & 5)
const CheckboxTypeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <rect width="18" height="18" rx="4" fill="#C7D2FE" />
        <path d="M5 9.5l2.5 2.5L13 6" stroke="#4F46E5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Custom Checkbox Component matching Screenshot 3, 4, 5
const CustomCheckbox = ({ checked, onChange }) => (
    <div
        className={`custom-check-square ${checked ? 'checked' : 'unchecked'}`}
        onClick={(e) => {
            e.stopPropagation();
            onChange();
        }}
    >
        {checked && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6.2L4.8 8.5L9.5 3.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )}
    </div>
);

// Infinity / Chain icon for Show Form (Screenshot 2)
const ShowFormIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.178 8c5.096 0 5.096 8 0 8-2.68 0-4.14-1.92-6.178-4-2.038-2.08-3.498-4-6.178-4-5.096 0-5.096 8 0 8 2.68 0 4.14-1.92 6.178-4 2.038-2.08 3.498-4 6.178-4z" />
    </svg>
);

// Green Excel icon for Bulk Import (Screenshot 2)
const ExcelTableIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect width="22" height="22" x="1" y="1" rx="4" fill="#107C41" />
        <path d="M6 5h12v14H6z" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="6" y1="10" x2="18" y2="10" stroke="#FFFFFF" strokeWidth="1.2" />
        <line x1="6" y1="14" x2="18" y2="14" stroke="#FFFFFF" strokeWidth="1.2" />
        <line x1="12" y1="5" x2="12" y2="19" stroke="#FFFFFF" strokeWidth="1.2" />
        <path d="M8 8l8 8M16 8l-8 8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// Initial Standard Fields matching Screenshot 3 & 4
const initialStandardFields = [
    { id: 'name', label: 'Company Name', checked: true },
    { id: 'mobile', label: 'Mobile', checked: true },
    { id: 'status', label: 'Lead Status', checked: true },
    { id: 'employees', label: 'Noofemployee', checked: true },
    { id: 'revenue', label: 'Annual Revenue', checked: false }, // Unchecked in Screenshot 3
    { id: 'city', label: 'Mailing City', checked: true },
    { id: 'email', label: 'Email', checked: true },
    { id: 'created', label: 'Created Date', checked: true },
    { id: 'owner', label: 'Lead Owner', checked: true },
    { id: 'modified', label: 'Modified Date', checked: true },
    { id: 'description', label: 'Description', checked: true },
    { id: 'country', label: 'Country', checked: false }, // Unchecked in Screenshot 4
];

// Initial Additional Fields matching Screenshots 4 & 5
const initialAdditionalFields = [
    { id: 'lead_source', label: 'Lead Source', checked: true, type: 'split' },
    { id: 'instagram', label: 'Instagram', checked: true, type: 'text' },
    { id: 'sms_opt_out', label: 'SMS Opt Out', checked: true, type: 'checkbox' },
    { id: 'twitter', label: 'Twitter', checked: true, type: 'text' },
    { id: 'linkedin', label: 'LinkedIn', checked: true, type: 'text' },
    { id: 'email_opt_out', label: 'Email Opt Out', checked: true, type: 'checkbox' },
    { id: 'zipcode', label: 'ZipCode', checked: true, type: 'text' },
    { id: 'address_1', label: 'Address 1', checked: true, type: 'text' },
    { id: 'facebook', label: 'Facebook', checked: true, type: 'text' },
    { id: 'state', label: 'State', checked: true, type: 'text' },
];

const Companies = ({ setCurrentPage: setDashboardPage, initialOpenAddCompany = false }) => {
    // Companies list (defaults to empty matching screenshot 1)
    const [companies, setCompanies] = useState(() => {
        const saved = localStorage.getItem('dealconverter_companies_data');
        return saved ? JSON.parse(saved) : [];
    });

    // Listen to localStorage changes (e.g. from Bulk Import)
    useEffect(() => {
        const handleStorageUpdate = () => {
            const saved = localStorage.getItem('dealconverter_companies_data');
            if (saved) {
                try {
                    setCompanies(JSON.parse(saved));
                } catch (e) {
                    console.error(e);
                }
            }
        };
        handleStorageUpdate();
        window.addEventListener('storage', handleStorageUpdate);
        return () => window.removeEventListener('storage', handleStorageUpdate);
    }, []);

    // Dropdowns & Popovers
    const [isAllCompaniesOpen, setIsAllCompaniesOpen] = useState(false);
    const [isCreateViewOpen, setIsCreateViewOpen] = useState(false);
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
    const [isFilterDataOpen, setIsFilterDataOpen] = useState(false);
    const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [isRowsPerPageOpen, setIsRowsPerPageOpen] = useState(false);

    // Modals & Slide-Over Drawer
    const [activeModal, setActiveModal] = useState(null); // 'form', 'import', 'add_field'
    const [isAddCompanyDrawerOpen, setIsAddCompanyDrawerOpen] = useState(initialOpenAddCompany);

    useEffect(() => {
        if (initialOpenAddCompany) {
            setIsAddCompanyDrawerOpen(true);
        }
    }, [initialOpenAddCompany]);

    // Active Selection & Filter States
    const [selectedView, setSelectedView] = useState('All Companies');
    const [customViews, setCustomViews] = useState([]);
    const [selectedDateFilter, setSelectedDateFilter] = useState('All time');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'assigned', 'today'
    const [searchQuery, setSearchQuery] = useState('');

    // Column Fields State (persisted to localStorage)
    const [standardFields, setStandardFields] = useState(() => {
        const saved = localStorage.getItem('dealconverter_company_standard_fields');
        return saved ? JSON.parse(saved) : initialStandardFields;
    });

    const [additionalFields, setAdditionalFields] = useState(() => {
        const saved = localStorage.getItem('dealconverter_company_additional_fields');
        return saved ? JSON.parse(saved) : initialAdditionalFields;
    });

    const [columnSearch, setColumnSearch] = useState('');

    // Save fields to localStorage whenever changed
    useEffect(() => {
        localStorage.setItem('dealconverter_company_standard_fields', JSON.stringify(standardFields));
    }, [standardFields]);

    useEffect(() => {
        localStorage.setItem('dealconverter_company_additional_fields', JSON.stringify(additionalFields));
    }, [additionalFields]);

    useEffect(() => {
        localStorage.setItem('dealconverter_companies_data', JSON.stringify(companies));
    }, [companies]);

    // Filter Data State
    const [selectedField, setSelectedField] = useState('');
    const [appliedFilterField, setAppliedFilterField] = useState(null);

    // Create Custom View State
    const [newViewName, setNewViewName] = useState('');
    const [viewConditions, setViewConditions] = useState([]);

    // New Additional Field State (Screenshot 1: Add Additional Field)
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldSection, setNewFieldSection] = useState('Others');
    const [newFieldType, setNewFieldType] = useState('text');
    const [isFieldRequired, setIsFieldRequired] = useState(false);

    // Add New Company Form State
    const [newCompany, setNewCompany] = useState({
        name: '',
        mobile: '',
        email: '',
        status: 'Cold Leads',
        employees: '10-50',
        revenue: '$100k - $500k',
        city: 'Mumbai',
        owner: 'Self',
        lead_source: 'Website',
        instagram: '',
        twitter: '',
        linkedin: '',
        zipcode: '400001',
        address_1: '',
        facebook: '',
        state: 'Maharashtra'
    });

    // Pagination & UI States
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [toastMessage, setToastMessage] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const closeAllPopups = () => {
        setIsAllCompaniesOpen(false);
        setIsDateFilterOpen(false);
        setIsFilterDataOpen(false);
        setIsColumnSettingsOpen(false);
        setIsAddMenuOpen(false);
        setIsRowsPerPageOpen(false);
    };

    // Date filter options
    const dateOptions = [
        { id: 'all_time', label: 'All time', icon: <span style={{ color: '#2563EB', fontWeight: 'bold' }}>∞</span>, isGoldStar: true },
        { id: 'today', label: 'Today', icon: <Calendar size={15} color="#2563EB" /> },
        { id: 'yesterday', label: 'Yesterday', icon: <RotateCcw size={15} color="#2563EB" /> },
        { id: 'this_week', label: 'This Week', icon: <BarChart2 size={15} color="#2563EB" /> },
        { id: 'last_week', label: 'Last Week', icon: <ArrowLeft size={15} color="#2563EB" /> },
        { id: 'this_month', label: 'This Month', icon: <Calendar size={15} color="#2563EB" /> },
        { id: 'last_month', label: 'Last Month', icon: <ChevronLeft size={15} color="#2563EB" /> },
        { id: 'this_year', label: 'This Year', icon: <Calendar size={15} color="#2563EB" /> },
        { id: 'last_year', label: 'Last Year', icon: <RotateCcw size={15} color="#2563EB" /> },
        { id: 'custom', label: 'Custom', icon: <Calendar size={15} color="#2563EB" /> },
    ];

    // Search filters for column popover (Screenshots 3 & 4)
    const filteredStandard = standardFields.filter(f =>
        f.label.toLowerCase().includes(columnSearch.toLowerCase())
    );
    const filteredAdditional = additionalFields.filter(f =>
        f.label.toLowerCase().includes(columnSearch.toLowerCase())
    );

    // Toggle column checked
    const toggleStandardField = (id) => {
        setStandardFields(prev => prev.map(f => f.id === id ? { ...f, checked: !f.checked } : f));
    };

    const toggleAdditionalField = (id) => {
        setAdditionalFields(prev => prev.map(f => f.id === id ? { ...f, checked: !f.checked } : f));
    };

    // Filter companies
    const filteredCompanies = useMemo(() => {
        let result = [...companies];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                (c.name && c.name.toLowerCase().includes(q)) ||
                (c.mobile && c.mobile.includes(q)) ||
                (c.city && c.city.toLowerCase().includes(q)) ||
                (c.email && c.email.toLowerCase().includes(q))
            );
        }

        if (activeTab === 'assigned') {
            result = result.filter(c => c.owner === 'Self');
        } else if (activeTab === 'today') {
            result = result.filter(c => c.isNewToday);
        }

        if (appliedFilterField) {
            result = result.filter(c => Boolean(c[appliedFilterField]));
        }

        return result;
    }, [companies, searchQuery, activeTab, appliedFilterField]);

    // All active visible columns for the table
    const visibleColumns = useMemo(() => {
        return [...standardFields, ...additionalFields].filter(f => f.checked);
    }, [standardFields, additionalFields]);

    // Export to Excel / CSV
    const handleExportExcel = () => {
        if (filteredCompanies.length === 0) {
            showToast('No company records to export');
            return;
        }
        const activeCols = visibleColumns;
        const headers = activeCols.map(c => `"${c.label}"`).join(',');
        const rows = filteredCompanies.map(comp =>
            activeCols.map(col => `"${comp[col.id] || comp[col.label.toLowerCase()] || ''}"`).join(',')
        );
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'dealconverter_companies.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Exported to Excel (dealconverter_companies.csv)');
    };

    // Refresh data
    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            showToast('Companies data refreshed');
        }, 500);
    };

    // Save Custom View
    const handleSaveCustomView = (e) => {
        e.preventDefault();
        if (!newViewName.trim()) {
            alert('Please enter a view name');
            return;
        }

        setCustomViews([...customViews, newViewName.trim()]);
        setSelectedView(newViewName.trim());
        setNewViewName('');
        setViewConditions([]);
        setIsCreateViewOpen(false);
        showToast(`Custom view "${newViewName.trim()}" created!`);
    };

    // Add Custom Field (Screenshot 1: Add Additional Field)
    const handleAddCustomField = (e) => {
        e.preventDefault();
        if (!newFieldName.trim()) return;

        const newF = {
            id: newFieldName.toLowerCase().replace(/\s+/g, '_'),
            label: newFieldName.trim(),
            checked: true,
            type: newFieldType,
            section: newFieldSection,
            required: isFieldRequired
        };

        setAdditionalFields([...additionalFields, newF]);
        setActiveModal(null);
        setNewFieldName('');
        setIsFieldRequired(false);
        showToast(`Field "${newF.label}" added successfully!`);
    };

    // Save New Company
    const handleSaveCompany = (e) => {
        e.preventDefault();
        if (!newCompany.name.trim() || !newCompany.mobile.trim()) {
            alert('Please fill in Company Name and Mobile Number.');
            return;
        }

        const createdItem = {
            id: Date.now(),
            name: newCompany.name,
            mobile: newCompany.mobile,
            email: newCompany.email || `${newCompany.name.toLowerCase().replace(/\s+/g, '')}@company.com`,
            status: newCompany.status,
            employees: newCompany.employees,
            revenue: newCompany.revenue,
            city: newCompany.city,
            created: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            modified: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            owner: newCompany.owner,
            description: 'Active client account',
            country: 'India',
            lead_source: newCompany.lead_source || 'Website',
            instagram: newCompany.instagram || `@${newCompany.name.toLowerCase().replace(/\s+/g, '')}`,
            sms_opt_out: 'No',
            twitter: newCompany.twitter || '',
            linkedin: newCompany.linkedin || '',
            email_opt_out: 'No',
            zipcode: newCompany.zipcode || '400001',
            address_1: newCompany.address_1 || '',
            facebook: newCompany.facebook || '',
            state: newCompany.state || 'Maharashtra',
            isNewToday: true
        };

        setCompanies([createdItem, ...companies]);
        setActiveModal(null);
        setNewCompany({
            name: '',
            mobile: '',
            email: '',
            status: 'Cold Leads',
            employees: '10-50',
            revenue: '$100k - $500k',
            city: 'Mumbai',
            owner: 'Self',
            lead_source: 'Website',
            instagram: '',
            twitter: '',
            linkedin: '',
            zipcode: '400001',
            address_1: '',
            facebook: '',
            state: 'Maharashtra'
        });
        showToast(`Company "${createdItem.name}" added successfully!`);
    };

    return (
        <div className="companies-container">
            {/* Toast notification */}
            {toastMessage && (
                <div className="contacts-toast">
                    <Check size={16} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Click outside backdrop for all popups */}
            {(isAllCompaniesOpen || isDateFilterOpen || isFilterDataOpen || isColumnSettingsOpen || isAddMenuOpen || isRowsPerPageOpen) && (
                <div className="dropdown-backdrop" onClick={closeAllPopups} />
            )}

            {/* ---------------- Top Actions Bar 1 (Screenshot 1) ---------------- */}
            <div className="companies-top-bar">
                <div className="companies-top-left">
                    {/* View Selector Trigger */}
                    <div className="popover-anchor-wrapper">
                        <div
                            className={`companies-dropdown-trigger ${isAllCompaniesOpen ? 'active' : ''}`}
                            onClick={() => {
                                const next = !isAllCompaniesOpen;
                                closeAllPopups();
                                setIsAllCompaniesOpen(next);
                            }}
                        >
                            <ContactBookIcon />
                            <span>{selectedView}</span>
                            <ChevronDown size={15} color="#6B7280" />
                        </div>

                        {/* All Companies Dropdown */}
                        {isAllCompaniesOpen && (
                            <div className="all-companies-menu" onClick={e => e.stopPropagation()}>
                                <div
                                    className={`companies-view-item ${selectedView === 'All Companies' ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedView('All Companies');
                                        setIsAllCompaniesOpen(false);
                                    }}
                                >
                                    <Users size={16} color="#6B7280" />
                                    <span>All Companies</span>
                                </div>

                                {customViews.map((cView, idx) => (
                                    <div
                                        key={idx}
                                        className={`companies-view-item ${selectedView === cView ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedView(cView);
                                            setIsAllCompaniesOpen(false);
                                        }}
                                    >
                                        <Briefcase size={16} color="#3B82F6" />
                                        <span>{cView}</span>
                                    </div>
                                ))}

                                <div
                                    className="create-view-btn-row"
                                    onClick={() => {
                                        setIsAllCompaniesOpen(false);
                                        setIsCreateViewOpen(true);
                                    }}
                                >
                                    <Plus size={16} color="#2563EB" />
                                    <span>Create New View</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Date Filter Trigger */}
                    <div className="popover-anchor-wrapper">
                        <div
                            className={`date-filter-trigger ${isDateFilterOpen ? 'active' : ''}`}
                            onClick={() => {
                                const next = !isDateFilterOpen;
                                closeAllPopups();
                                setIsDateFilterOpen(next);
                            }}
                        >
                            <span style={{ color: '#2563EB', fontWeight: 'bold', fontSize: '15px' }}>∞</span>
                            <span>{selectedDateFilter}</span>
                            <span style={{ color: '#EAB308', fontSize: '13px' }}>★</span>
                            <ChevronDown size={14} color="#6B7280" />
                        </div>

                        {/* Date Filter Dropdown */}
                        {isDateFilterOpen && (
                            <div className="date-filter-menu" onClick={e => e.stopPropagation()}>
                                {dateOptions.map((opt) => (
                                    <div
                                        key={opt.id}
                                        className={`date-filter-item ${selectedDateFilter === opt.label ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedDateFilter(opt.label);
                                            setIsDateFilterOpen(false);
                                            showToast(`Date filter: ${opt.label}`);
                                        }}
                                    >
                                        <span style={{ width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {opt.icon}
                                        </span>
                                        <span>{opt.label}</span>
                                        <span className={`date-filter-star ${opt.isGoldStar ? 'gold' : 'outline'}`}>
                                            {opt.isGoldStar ? '★' : '☆'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Funnel Filter Button */}
                    <div className="popover-anchor-wrapper">
                        <button
                            className={`funnel-filter-btn ${isFilterDataOpen ? 'active' : ''}`}
                            title="Filter Data"
                            onClick={() => {
                                const next = !isFilterDataOpen;
                                closeAllPopups();
                                setIsFilterDataOpen(next);
                            }}
                        >
                            <FunnelIcon size={18} color="#2563EB" />
                            {appliedFilterField && <span className="filter-active-dot" />}
                        </button>

                        {/* Filter Data Popover */}
                        {isFilterDataOpen && (
                            <div className="companies-filter-popover" onClick={e => e.stopPropagation()}>
                                <div className="comp-filter-header">
                                    <span className="comp-filter-title">Filter Data</span>
                                    <button className="filter-close-btn" onClick={() => setIsFilterDataOpen(false)}>
                                        <X size={16} />
                                    </button>
                                </div>

                                <label className="comp-field-label">Field</label>
                                <select
                                    className="comp-field-select"
                                    value={selectedField}
                                    onChange={(e) => setSelectedField(e.target.value)}
                                >
                                    <option value="">Select Field</option>
                                    <option value="name">Company Name</option>
                                    <option value="mobile">Mobile</option>
                                    <option value="status">Lead Status</option>
                                    <option value="employees">Noofemployee</option>
                                    <option value="revenue">Annual Revenue</option>
                                    <option value="city">Mailing City</option>
                                    <option value="email">Email</option>
                                    <option value="owner">Lead Owner</option>
                                </select>

                                <div className="comp-filter-footer">
                                    <button
                                        className="comp-clear-btn"
                                        onClick={() => {
                                            setSelectedField('');
                                            setAppliedFilterField(null);
                                            setIsFilterDataOpen(false);
                                            showToast('Filter cleared');
                                        }}
                                    >
                                        <X size={14} />
                                        <span>Clear All</span>
                                    </button>
                                    <button
                                        className="comp-apply-btn"
                                        onClick={() => {
                                            setAppliedFilterField(selectedField || null);
                                            setIsFilterDataOpen(false);
                                            showToast(selectedField ? `Filter applied for ${selectedField}` : 'Filter applied');
                                        }}
                                    >
                                        <Check size={16} />
                                        <span>Apply Filter</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* My Assigned Leads Tab Button */}
                    <button
                        className={`lead-type-tab ${activeTab === 'assigned' ? 'active' : ''}`}
                        onClick={() => {
                            const next = activeTab === 'assigned' ? 'all' : 'assigned';
                            setActiveTab(next);
                            showToast(next === 'assigned' ? 'Filtered to My Assigned Leads' : 'Showing All Companies');
                        }}
                    >
                        <span style={{ fontSize: '15px' }}>🙎</span>
                        <span>My Assigned Leads</span>
                    </button>

                    {/* New Leads Today Tab Button */}
                    <button
                        className={`lead-type-tab ${activeTab === 'today' ? 'active' : ''}`}
                        onClick={() => {
                            const next = activeTab === 'today' ? 'all' : 'today';
                            setActiveTab(next);
                            showToast(next === 'today' ? 'Filtered to New Leads Today' : 'Showing All Companies');
                        }}
                    >
                        <span style={{ fontSize: '15px' }}>🌱</span>
                        <span>New Leads Today</span>
                    </button>

                    {/* Refresh Button */}
                    <button
                        className={`refresh-icon-btn ${isRefreshing ? 'refreshing' : ''}`}
                        title="Refresh"
                        onClick={handleRefresh}
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>

                <div className="companies-top-right">
                    {/* Column Settings Button with Visible Columns Popover (Screenshots 3, 4, 5) */}
                    <div className="popover-anchor-wrapper">
                        <button
                            className={`column-settings-blue-btn ${isColumnSettingsOpen ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                const next = !isColumnSettingsOpen;
                                closeAllPopups();
                                setIsColumnSettingsOpen(next);
                            }}
                        >
                            <ThreeBarsIcon />
                            <span>Column Settings</span>
                        </button>

                        {/* Visible Columns Popover */}
                        {isColumnSettingsOpen && (
                            <div className="visible-columns-popover" onClick={e => e.stopPropagation()}>
                                <div className="vis-col-header">
                                    <span className="vis-col-title">Visible Columns</span>
                                    <button className="filter-close-btn" onClick={() => setIsColumnSettingsOpen(false)}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="vis-col-search">
                                    <Search size={15} color="#9CA3AF" />
                                    <input
                                        type="text"
                                        placeholder="Search columns..."
                                        value={columnSearch}
                                        onChange={(e) => setColumnSearch(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="vis-col-list">
                                    {/* Standard Fields Section */}
                                    {filteredStandard.length > 0 && (
                                        <>
                                            <div className="vis-col-section-title">Standard Fields</div>
                                            {filteredStandard.map((field) => (
                                                <div
                                                    key={field.id}
                                                    className="vis-col-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleStandardField(field.id);
                                                    }}
                                                >
                                                    <div className={`custom-check-square ${field.checked ? 'checked' : 'unchecked'}`}>
                                                        {field.checked && (
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                                <path d="M2.5 6.2L4.8 8.5L9.5 3.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="vis-col-icon-slot">
                                                        <ColumnDragBars />
                                                    </div>
                                                    <span className="vis-col-label">{field.label}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {/* Additional Fields Section */}
                                    {filteredAdditional.length > 0 && (
                                        <>
                                            <div className="vis-col-divider" />
                                            <div className="vis-col-section-title">Additional Fields</div>
                                            {filteredAdditional.map((field) => (
                                                <div
                                                    key={field.id}
                                                    className="vis-col-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleAdditionalField(field.id);
                                                    }}
                                                >
                                                    <div className={`custom-check-square ${field.checked ? 'checked' : 'unchecked'}`}>
                                                        {field.checked && (
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                                <path d="M2.5 6.2L4.8 8.5L9.5 3.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="vis-col-icon-slot">
                                                        {field.type === 'split' ? (
                                                            <SplitBranchIcon />
                                                        ) : field.type === 'checkbox' ? (
                                                            <CheckboxTypeIcon />
                                                        ) : (
                                                            <TextTypeIcon />
                                                        )}
                                                    </div>
                                                    <span className="vis-col-label">{field.label}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>

                                {/* Footer Action Buttons: Save Changes & + Add Field */}
                                <div className="vis-col-footer-two-btns">
                                    <button
                                        className="vis-col-save-btn"
                                        onClick={() => {
                                            setIsColumnSettingsOpen(false);
                                            showToast('Visible columns saved successfully');
                                        }}
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        className="vis-col-add-btn"
                                        onClick={() => {
                                            setIsColumnSettingsOpen(false);
                                            setActiveModal('add_field');
                                        }}
                                    >
                                        <Plus size={16} />
                                        <span>Add Field</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Add New Companies Button with Dropdown (Screenshot 2) */}
                    <div className="popover-anchor-wrapper">
                        <button
                            className="add-companies-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                const next = !isAddMenuOpen;
                                closeAllPopups();
                                setIsAddMenuOpen(next);
                            }}
                        >
                            Add New Companies
                        </button>

                        {/* Add New Companies Menu */}
                        {isAddMenuOpen && (
                            <div className="add-companies-dropdown-menu" onClick={e => e.stopPropagation()}>
                                <button
                                    className="add-comp-gradient-btn"
                                    onClick={() => {
                                        setIsAddMenuOpen(false);
                                        setIsAddCompanyDrawerOpen(true);
                                    }}
                                >
                                    <span className="source-icon-wrap">
                                        <ShowFormIcon />
                                    </span>
                                    <span>Show Form</span>
                                </button>
                                <button
                                    className="add-comp-gradient-btn"
                                    onClick={() => {
                                        setIsAddMenuOpen(false);
                                        if (setDashboardPage) {
                                            setDashboardPage('Bulk Import');
                                        }
                                    }}
                                >
                                    <span className="source-icon-wrap">
                                        <ExcelTableIcon />
                                    </span>
                                    <span>Bulk Import</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ---------------- Actions Bar 2 (Screenshot 1) ---------------- */}
            <div className="companies-bar-2">
                <div className="companies-search-box">
                    <Search size={16} color="#9CA3AF" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Export to Excel Button */}
                <button className="export-excel-btn" onClick={handleExportExcel}>
                    <FileSpreadsheet size={16} color="#15803D" />
                    <span>Export to Excel</span>
                </button>
            </div>

            {/* ---------------- Main Content: Empty State or Table ---------------- */}
            {filteredCompanies.length === 0 ? (
                <div className="companies-empty-state">
                    <div className="empty-tray-icon">
                        <EmptyTrayIcon />
                    </div>
                    <p className="empty-state-text">No data available</p>
                </div>
            ) : (
                <div className="companies-table-wrapper">
                    <table className="companies-table">
                        <thead>
                            <tr>
                                <th className="col-check">
                                    <input type="checkbox" style={{ transform: 'scale(1.2)' }} />
                                </th>
                                {visibleColumns.map((col) => (
                                    <th key={col.id}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompanies.map((comp) => (
                                <tr key={comp.id}>
                                    <td className="col-check">
                                        <input type="checkbox" style={{ transform: 'scale(1.2)' }} />
                                    </td>
                                    {visibleColumns.map((col) => {
                                        if (col.id === 'name') {
                                            return (
                                                <td key={col.id} style={{ fontWeight: 600, color: '#2563EB' }}>
                                                    {comp.name}
                                                </td>
                                            );
                                        }
                                        if (col.id === 'status') {
                                            return (
                                                <td key={col.id}>
                                                    <span className="lead-status-pill">
                                                        <div className="status-dot"></div>
                                                        {comp.status}
                                                    </span>
                                                </td>
                                            );
                                        }
                                        return (
                                            <td key={col.id}>
                                                {comp[col.id] || comp[col.label.toLowerCase()] || '-'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ---------------- Bottom Pagination Bar (Screenshot 1) ---------------- */}
            <div className="contacts-footer">
                <div className="footer-stat-pill total-leads-pill">
                    Total Leads: <strong style={{ color: '#0284C7' }}>{filteredCompanies.length} / {companies.length}</strong>
                </div>
                <div className="footer-stat-pill untouched-leads-pill">
                    Untouched Leads: <strong style={{ color: '#E11D48' }}>0 / {companies.length}</strong>
                </div>
                <div className="footer-stat-pill page-count-pill">
                    Page: <strong>{currentPage} / {Math.max(1, Math.ceil(filteredCompanies.length / rowsPerPage))}</strong>
                </div>

                <div className="popover-anchor-wrapper">
                    <div
                        className="rows-per-page-pill"
                        onClick={() => setIsRowsPerPageOpen(!isRowsPerPageOpen)}
                    >
                        <span>Rows per page: {rowsPerPage}</span>
                        <span style={{ color: '#9CA3AF' }}>☆</span>
                        <ChevronDown size={14} color="#6B7280" />
                    </div>

                    {isRowsPerPageOpen && (
                        <div className="rows-per-page-menu" onClick={e => e.stopPropagation()}>
                            {[5, 10, 25, 50].map((num) => (
                                <div
                                    key={num}
                                    className={`rows-option ${rowsPerPage === num ? 'active' : ''}`}
                                    onClick={() => {
                                        setRowsPerPage(num);
                                        setCurrentPage(1);
                                        setIsRowsPerPageOpen(false);
                                    }}
                                >
                                    <span>{num} rows</span>
                                    {rowsPerPage === num && <Check size={14} />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pagination-controls">
                    <button className="pagination-btn" disabled>
                        <ChevronLeft size={16} />
                    </button>
                    <button className="pagination-btn active-page">
                        1
                    </button>
                    <button className="pagination-btn" disabled>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* ---------------- Modal: Create Custom View ---------------- */}
            {isCreateViewOpen && (
                <div className="crm-modal-backdrop" onClick={() => setIsCreateViewOpen(false)}>
                    <div className="custom-view-modal" onClick={e => e.stopPropagation()}>
                        <div className="custom-view-header">
                            <h3>Create Custom View</h3>
                            <button className="filter-close-btn" onClick={() => setIsCreateViewOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveCustomView}>
                            <div className="custom-view-body">
                                <label className="custom-view-label">View Name</label>
                                <input
                                    type="text"
                                    required
                                    className="custom-view-input"
                                    placeholder="Enter view name"
                                    value={newViewName}
                                    onChange={(e) => setNewViewName(e.target.value)}
                                />

                                {viewConditions.length > 0 && (
                                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {viewConditions.map((_, i) => (
                                            <div key={i} className="filter-condition-row">
                                                <select className="condition-select" defaultValue="name">
                                                    <option value="name">Company Name</option>
                                                    <option value="city">Mailing City</option>
                                                    <option value="status">Lead Status</option>
                                                </select>
                                                <input className="condition-input" placeholder="Condition value..." />
                                                <button
                                                    type="button"
                                                    className="condition-remove-btn"
                                                    onClick={() => setViewConditions(viewConditions.filter((_, idx) => idx !== i))}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="add-condition-link-btn"
                                    onClick={() => setViewConditions([...viewConditions, { field: 'name' }])}
                                >
                                    <Plus size={16} />
                                    <span>Add Filter Condition</span>
                                </button>
                            </div>
                            <div className="custom-view-footer">
                                <button
                                    type="button"
                                    className="btn-link-cancel"
                                    onClick={() => setIsCreateViewOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save-view">
                                    Save View
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ---------------- Slide-Over Drawer: Add New Company (Exact match to Screenshots) ---------------- */}
            <AddCompany
                isOpen={isAddCompanyDrawerOpen || activeModal === 'form'}
                onClose={() => {
                    setIsAddCompanyDrawerOpen(false);
                    setActiveModal(null);
                    if (setDashboardPage) {
                        setDashboardPage('Companies');
                    }
                }}
                onCompanyAdded={(newComp) => {
                    setCompanies(prev => [newComp, ...prev]);
                    setIsAddCompanyDrawerOpen(false);
                    setActiveModal(null);
                    if (setDashboardPage) {
                        setDashboardPage('Companies');
                    }
                }}
            />

            {/* ---------------- Modal: Bulk Import Companies ---------------- */}
            {activeModal === 'import' && (
                <div className="crm-modal-backdrop" onClick={() => setActiveModal(null)}>
                    <div className="crm-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="crm-modal-header">
                            <h3 className="crm-modal-title">Bulk Import Companies</h3>
                            <button className="filter-close-btn" onClick={() => setActiveModal(null)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="crm-modal-body">
                            <div className="import-dropzone" onClick={() => showToast('Sample companies file selected')}>
                                <div className="dropzone-icon">
                                    <UploadCloud size={28} color="#2563EB" />
                                </div>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#1E293B' }}>
                                    Click or Drag & Drop Excel / CSV file
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                                    Supports .xlsx, .xls, .csv up to 10MB
                                </p>
                            </div>

                            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Need sample format?</span>
                                <button
                                    type="button"
                                    className="reset-cols-btn"
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                                    onClick={handleExportExcel}
                                >
                                    <Download size={13} />
                                    <span>Download Sample CSV</span>
                                </button>
                            </div>
                        </div>
                        <div className="crm-modal-footer">
                            <button type="button" className="crm-btn-secondary" onClick={() => setActiveModal(null)}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="crm-btn-primary"
                                onClick={() => {
                                    const sampleComps = [
                                        {
                                            id: Date.now() + 1,
                                            name: 'Tata Consultancy Services',
                                            mobile: '+91 98200 12345',
                                            email: 'contact@tcs.com',
                                            status: 'Hot Leads',
                                            employees: '200+',
                                            revenue: '$1M+',
                                            city: 'Mumbai',
                                            created: new Date().toLocaleString(),
                                            modified: new Date().toLocaleString(),
                                            owner: 'Self',
                                            description: 'IT consulting enterprise',
                                            country: 'India',
                                            lead_source: 'Website',
                                            instagram: '@tcs',
                                            sms_opt_out: 'No',
                                            twitter: '@tcs',
                                            linkedin: 'linkedin.com/company/tcs',
                                            email_opt_out: 'No',
                                            zipcode: '400001',
                                            address_1: 'Fort',
                                            facebook: 'TataConsultancyServices',
                                            state: 'Maharashtra',
                                            isNewToday: true
                                        },
                                        {
                                            id: Date.now() + 2,
                                            name: 'Infosys Technologies',
                                            mobile: '+91 98450 67890',
                                            email: 'info@infosys.com',
                                            status: 'Cold Leads',
                                            employees: '200+',
                                            revenue: '$1M+',
                                            city: 'Bangalore',
                                            created: new Date().toLocaleString(),
                                            modified: new Date().toLocaleString(),
                                            owner: 'Priya Sharma',
                                            description: 'Software solutions',
                                            country: 'India',
                                            lead_source: 'LinkedIn',
                                            instagram: '@infosys',
                                            sms_opt_out: 'No',
                                            twitter: '@infosys',
                                            linkedin: 'linkedin.com/company/infosys',
                                            email_opt_out: 'No',
                                            zipcode: '560100',
                                            address_1: 'Electronic City',
                                            facebook: 'Infosys',
                                            state: 'Karnataka',
                                            isNewToday: false
                                        }
                                    ];
                                    setCompanies([...sampleComps, ...companies]);
                                    setActiveModal(null);
                                    showToast('Imported sample companies successfully!');
                                }}
                            >
                                Start Import
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- Modal: Add Additional Field (Screenshot 1) ---------------- */}
            {activeModal === 'add_field' && (
                <div className="crm-modal-backdrop" onClick={() => setActiveModal(null)}>
                    <div className="add-additional-field-modal" onClick={e => e.stopPropagation()}>
                        <div className="add-field-modal-header">
                            <h3 className="add-field-modal-title">Add Additional Field</h3>
                            <button
                                type="button"
                                className="add-field-close-btn"
                                onClick={() => setActiveModal(null)}
                                title="Close"
                            >
                                <X size={18} color="#2563EB" />
                            </button>
                        </div>
                        <form onSubmit={handleAddCustomField}>
                            <div className="add-field-modal-body">
                                <div className="add-field-form-group">
                                    <label className="add-field-label">Field Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="add-field-input"
                                        placeholder="Enter field name"
                                        value={newFieldName}
                                        onChange={(e) => setNewFieldName(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="add-field-form-group">
                                    <label className="add-field-label">Section</label>
                                    <div className="add-field-section-row">
                                        <select
                                            className="add-field-select"
                                            value={newFieldSection}
                                            onChange={(e) => setNewFieldSection(e.target.value)}
                                        >
                                            <option value="Others">Others</option>
                                            <option value="Basic Information">Basic Information</option>
                                            <option value="Contact Details">Contact Details</option>
                                            <option value="Social Media">Social Media</option>
                                        </select>
                                        <button
                                            type="button"
                                            className="add-section-plus-btn"
                                            onClick={() => {
                                                const customSec = prompt('Enter new section name:');
                                                if (customSec && customSec.trim()) {
                                                    setNewFieldSection(customSec.trim());
                                                    showToast(`Section "${customSec.trim()}" selected`);
                                                }
                                            }}
                                            title="Add new section"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="add-field-form-group">
                                    <label className="add-field-label">Field Type</label>
                                    <div className="add-field-type-wrapper">
                                        <div className="add-field-type-left">
                                            <TextTypeIcon />
                                            <select
                                                className="add-field-type-select"
                                                value={newFieldType}
                                                onChange={(e) => setNewFieldType(e.target.value)}
                                            >
                                                <option value="text">Text</option>
                                                <option value="checkbox">Checkbox</option>
                                                <option value="split">Lead Source / Branch</option>
                                                <option value="number">Number</option>
                                                <option value="date">Date</option>
                                            </select>
                                        </div>
                                        <ChevronDown size={16} color="#6B7280" />
                                    </div>
                                </div>

                                <div className="required-field-toggle-card">
                                    <div className="required-field-left">
                                        <span style={{ color: '#9CA3AF', fontSize: '16px' }}>★</span>
                                        <span className="required-field-text">Required Field</span>
                                    </div>
                                    <div
                                        className={`ios-toggle-switch ${isFieldRequired ? 'active' : ''}`}
                                        onClick={() => setIsFieldRequired(!isFieldRequired)}
                                        role="switch"
                                        aria-checked={isFieldRequired}
                                    >
                                        <div className="ios-toggle-thumb" />
                                    </div>
                                </div>

                                <button type="submit" className="add-field-submit-btn">
                                    Add Field
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Companies;
