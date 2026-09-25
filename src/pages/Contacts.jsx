import React, { useState, useMemo } from 'react';
import {
    Search,
    ChevronDown,
    RefreshCw,
    FileSpreadsheet,
    User,
    Calendar,
    Columns,
    ChevronLeft,
    ChevronRight,
    Users,
    RotateCcw,
    BarChart2,
    ArrowLeft,
    Briefcase,
    X,
    Plus,
    Check,
    Copy,
    Trash2,
    Phone,
    Mail,
    MessageSquare,
    UploadCloud,
    Download
} from 'lucide-react';
import './Contacts.css';

// Bookmark ribbon SVG icon
const BookmarkIcon = ({ color = '#3B82F6' }) => (
    <svg width="14" height="17" viewBox="0 0 14 18" fill={color}>
        <path d="M0 0H14V18L7 13.5L0 18V0Z" />
    </svg>
);

// Blue info circle icon
const InfoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

// Funnel filter icon
const FunnelIcon = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

// Disabled filter icon for empty state
const DisabledFilterIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" opacity="0.6" />
        <line x1="2" y1="2" x2="22" y2="22" stroke="#9CA3AF" strokeWidth="2" />
    </svg>
);

// Initial mock contacts
const initialContacts = [
    { id: 1, created: 'Jul 16, 2026 12:15:30 AM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+918838687357', name: 'Hariharan', status: 'Cold Leads', dest: 'Manali', initial: 'H', color: '#8B5CF6', email: 'hariharan@example.com', owner: 'Self', daysOld: 12 },
    { id: 2, created: 'Jul 15, 2026 07:51:05 PM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+918903856486', name: 'A M I', status: 'Cold Leads', dest: '', initial: 'A', color: '#84CC16', email: 'ami@example.com', owner: 'Self', daysOld: 25 },
    { id: 3, created: 'Jul 15, 2026 02:58:54 PM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+919600670965', name: '+9196006...', status: 'Cold Leads', dest: 'Manali', initial: 'M', color: '#F43F5E', email: 'lead9600@example.com', owner: 'Agent 2', daysOld: 45 },
    { id: 4, created: 'Jul 15, 2026 02:43:22 PM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+917558838323', name: '+917558...', status: 'Cold Leads', dest: '', initial: 'J', color: '#8B5CF6', email: 'lead7558@example.com', owner: 'Agent 3', daysOld: 55 },
    { id: 5, created: 'Jul 15, 2026 08:45:25 AM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+918825887305', name: 'Jenifer', status: 'Cold Leads', dest: 'Goa', initial: 'J', color: '#0D9488', email: 'jenifer@example.com', owner: 'Self', daysOld: 70 },
    { id: 6, created: 'Jul 13, 2026 04:42:52 PM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+919840330098', name: 'rajasekar', status: 'Cold Leads', dest: 'Manali', initial: 'R', color: '#8B5CF6', email: 'raja@example.com', owner: 'Self', daysOld: 80 },
    { id: 7, created: 'Jul 12, 2026 10:20:15 AM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+919876543210', name: 'Priya Sharma', status: 'Hot Leads', dest: 'Goa', initial: 'P', color: '#EC4899', email: 'priya@example.com', owner: 'Self', daysOld: 5 },
    { id: 8, created: 'Jul 11, 2026 03:15:40 PM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+919123456780', name: 'Vikram Singh', status: 'Open Deal', dest: 'Kashmir', initial: 'V', color: '#3B82F6', email: 'vikram@example.com', owner: 'Self', daysOld: 18 },
    { id: 9, created: 'Jul 10, 2026 01:10:00 PM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+919444555666', name: 'Ananya Roy', status: 'Enquiries', dest: 'Dubai', initial: 'A', color: '#F59E0B', email: 'ananya@example.com', owner: 'Agent 2', daysOld: 35 },
    { id: 10, created: 'Jul 09, 2026 09:00:22 AM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+919988776655', name: 'Karthik Raja', status: 'Follow Up Leads', dest: 'Manali', initial: 'K', color: '#10B981', email: 'karthik@example.com', owner: 'Self', daysOld: 62 },
];

const Contacts = () => {
    // Contacts Data State
    const [contacts, setContacts] = useState(initialContacts);

    // Dropdown & Popover Toggles
    const [isAllContactsOpen, setIsAllContactsOpen] = useState(false);
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [isColSettingsOpen, setIsColSettingsOpen] = useState(false);
    const [isRowsPerPageOpen, setIsRowsPerPageOpen] = useState(false);
    const [statusPopoverId, setStatusPopoverId] = useState(null);

    // Modals & Drawers
    const [activeModal, setActiveModal] = useState(null); // 'form', 'import', 'integration'
    const [selectedIntegration, setSelectedIntegration] = useState(null);
    const [selectedContactForDrawer, setSelectedContactForDrawer] = useState(null);

    // Filter and Tab States
    const [selectedView, setSelectedView] = useState('All Contacts');
    const [selectedDateFilter, setSelectedDateFilter] = useState('All time');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'assigned', 'workable'
    const [selectedDayRange, setSelectedDayRange] = useState(null); // '0-30', '30-60', '60-90'
    const [searchQuery, setSearchQuery] = useState('');
    const [filterConditions, setFilterConditions] = useState([]);

    // Table Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState({
        createdDate: true,
        modifiedDate: true,
        mobile: true,
        contactName: true,
        leadStatus: true,
        destinations: true
    });

    // Table Sorting State
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Row Selection State
    const [selectedRowIds, setSelectedRowIds] = useState([]);

    // Pagination State
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // UI Feedback States
    const [toastMessage, setToastMessage] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // New Contact Form State
    const [newContact, setNewContact] = useState({
        name: '',
        mobile: '',
        email: '',
        status: 'Cold Leads',
        dest: 'Manali',
        owner: 'Self'
    });

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const closeAllDropdowns = () => {
        setIsAllContactsOpen(false);
        setIsDateFilterOpen(false);
        setIsFilterModalOpen(false);
        setIsAddMenuOpen(false);
        setIsColSettingsOpen(false);
        setIsRowsPerPageOpen(false);
        setStatusPopoverId(null);
    };

    // Filter View options (Image 1)
    const viewOptions = [
        { id: 'all', label: 'All Contacts', icon: <Users size={16} color="#4B5563" />, hasInfo: false },
        { id: 'hot', label: 'Hot Leads', icon: <span style={{ fontSize: '16px' }}>🔥</span>, hasInfo: false },
        { id: 'follow_up', label: 'Follow Up Leads', icon: <span style={{ fontSize: '15px' }}>📑</span>, hasInfo: false },
        { id: 'open_deal', label: 'Open Deal', icon: <BookmarkIcon color="#14B8A6" />, hasInfo: true },
        { id: 'cold_leads', label: 'Cold Leads', icon: <BookmarkIcon color="#F43F5E" />, hasInfo: true },
        { id: 'enquiries', label: 'Enquiries', icon: <BookmarkIcon color="#F43F5E" />, hasInfo: true },
        { id: 'suggesting', label: 'suggesing Preferance with us', icon: <BookmarkIcon color="#8B5CF6" />, hasInfo: true },
        { id: 'new_leads', label: 'new leads', icon: <BookmarkIcon color="#14B8A6" />, hasInfo: true },
        { id: 'lead_owner', label: 'Lead Owner', icon: <BookmarkIcon color="#8B5CF6" />, hasInfo: true },
        { id: 'attempted', label: 'attempted to contact', icon: <BookmarkIcon color="#10B981" />, hasInfo: true },
    ];

    // Date options (Image 2)
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

    // Add contacts sources (Image 4)
    const addSources = [
        {
            id: 'show_form',
            label: 'Show Form',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18.178 8c5.096 0 5.096 8 0 8-2.68 0-4.14-1.92-6.178-4-2.038-2.08-3.498-4-6.178-4-5.096 0-5.096 8 0 8 2.68 0 4.14-1.92 6.178-4 2.038-2.08 3.498-4 6.178-4z" />
                </svg>
            ),
            type: 'form'
        },
        {
            id: 'bulk_import',
            label: 'Bulk Import',
            icon: (
                <div style={{ width: 22, height: 22, backgroundColor: '#107C41', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800, fontSize: 12 }}>
                    X
                </div>
            ),
            type: 'import'
        },
        {
            id: 'instagram',
            label: 'Instagram Form',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <defs>
                        <radialGradient id="instaGrad" cx="30%" cy="107%" r="150%">
                            <stop offset="0%" stopColor="#fdf497" />
                            <stop offset="5%" stopColor="#fdf497" />
                            <stop offset="45%" stopColor="#fd5949" />
                            <stop offset="60%" stopColor="#d6249f" />
                            <stop offset="90%" stopColor="#285AEB" />
                        </radialGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#instaGrad)" />
                    <rect x="6.5" y="6.5" width="11" height="11" rx="3" stroke="#ffffff" strokeWidth="1.6" fill="none" />
                    <circle cx="12" cy="12" r="2.8" stroke="#ffffff" strokeWidth="1.6" fill="none" />
                    <circle cx="15.5" cy="8.5" r="0.8" fill="#ffffff" />
                </svg>
            ),
            type: 'integration'
        },
        {
            id: 'facebook',
            label: 'Facebook Form',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            ),
            type: 'integration'
        },
        {
            id: 'google_form',
            label: 'Google Form',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2H14L19 7V20C19 21.1 18.1 22 17 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2Z" fill="#7248B9" />
                    <path d="M14 2L19 7H14V2Z" fill="#5B3794" />
                    <line x1="8" y1="11" x2="16" y2="11" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="8" y1="14" x2="16" y2="14" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="8" y1="17" x2="13" y2="17" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
            ),
            type: 'integration'
        },
        {
            id: 'indiamart',
            label: 'IndiaMART',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#C51829">
                    <path d="M12 2L2 8v8l10 6 10-6V8L12 2zm-1.5 13.5H8.2V9.8h2.3v5.7zm5.3 0h-2.3V12c0-.7-.4-1-1-1-.6 0-1 .4-1 1v3.5h-2.3V9.8h2.2v.9c.5-.7 1.3-1 2.1-1 1.5 0 2.3.9 2.3 2.5v3.3z" />
                </svg>
            ),
            type: 'integration'
        },
        {
            id: 'whatsapp',
            label: 'Whatsapp to Leads',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.04 20.21c-1.49 0-2.95-.4-4.22-1.16l-.3-.18-3.13.82.84-3.05-.2-.31a8.21 8.21 0 0 1-1.27-4.42c0-4.57 3.72-8.29 8.29-8.29 2.22 0 4.29.86 5.86 2.43a8.22 8.22 0 0 1 2.43 5.86c0 4.57-3.72 8.29-8.29 8.29zm4.55-6.22c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.31z" />
                </svg>
            ),
            type: 'integration'
        },
        {
            id: '99acres',
            label: '99 Acres',
            icon: (
                <div style={{ width: 22, height: 22, backgroundColor: '#0284C7', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800, fontSize: 9, lineHeight: 1 }}>
                    <span>99</span>
                    <span style={{ fontSize: 6, fontWeight: 600 }}>acres</span>
                </div>
            ),
            type: 'integration'
        }
    ];

    // Filter, Search, Tab, and Sort logic
    const filteredAndSortedContacts = useMemo(() => {
        let result = [...contacts];

        // 1. Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.mobile.includes(query) ||
                c.dest.toLowerCase().includes(query) ||
                c.status.toLowerCase().includes(query)
            );
        }

        // 2. View Category filter
        if (selectedView !== 'All Contacts') {
            result = result.filter(c => c.status.toLowerCase() === selectedView.toLowerCase());
        }

        // 3. Tab filter: My Assigned vs Workable
        if (activeTab === 'assigned') {
            result = result.filter(c => c.owner === 'Self');
        } else if (activeTab === 'workable') {
            result = result.filter(c => c.status !== 'Cold Leads');
        }

        // 4. Day range filter
        if (selectedDayRange === '0-30') {
            result = result.filter(c => c.daysOld <= 30);
        } else if (selectedDayRange === '30-60') {
            result = result.filter(c => c.daysOld > 30 && c.daysOld <= 60);
        } else if (selectedDayRange === '60-90') {
            result = result.filter(c => c.daysOld > 60 && c.daysOld <= 90);
        }

        // 5. Custom filter conditions
        if (filterConditions.length > 0) {
            result = result.filter(contact => {
                return filterConditions.every(cond => {
                    const fieldValue = String(contact[cond.field] || '').toLowerCase();
                    const targetValue = cond.value.toLowerCase();
                    if (!targetValue) return true;
                    if (cond.operator === 'contains') return fieldValue.includes(targetValue);
                    if (cond.operator === 'equals') return fieldValue === targetValue;
                    if (cond.operator === 'starts') return fieldValue.startsWith(targetValue);
                    return true;
                });
            });
        }

        // 6. Sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                let valA = a[sortConfig.key] || '';
                let valB = b[sortConfig.key] || '';
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [contacts, searchQuery, selectedView, activeTab, selectedDayRange, filterConditions, sortConfig]);

    // Pagination slice
    const totalPages = Math.max(1, Math.ceil(filteredAndSortedContacts.length / rowsPerPage));
    const paginatedContacts = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredAndSortedContacts.slice(start, start + rowsPerPage);
    }, [filteredAndSortedContacts, currentPage, rowsPerPage]);

    // Handle column sorting
    const handleSort = (key) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                if (prev.direction === 'asc') return { key, direction: 'desc' };
                return { key: null, direction: 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    // Handle Row selection
    const toggleSelectAll = () => {
        if (selectedRowIds.length === paginatedContacts.length) {
            setSelectedRowIds([]);
        } else {
            setSelectedRowIds(paginatedContacts.map(c => c.id));
        }
    };

    const toggleSelectRow = (id) => {
        setSelectedRowIds(prev =>
            prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
        );
    };

    // Handle Export CSV
    const handleExportCSV = () => {
        const headers = ['ID,Created Date,Modified Date,Mobile,Name,Status,Destination,Owner'];
        const rows = filteredAndSortedContacts.map(c =>
            `"${c.id}","${c.created}","${c.modified}","${c.mobile}","${c.name}","${c.status}","${c.dest}","${c.owner}"`
        );
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'dealconverter_contacts.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Contacts exported to dealconverter_contacts.csv');
    };

    // Handle Refresh
    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            showToast('Contacts list refreshed');
        }, 600);
    };

    // Handle Create New Contact
    const handleSaveContact = (e) => {
        e.preventDefault();
        if (!newContact.name.trim() || !newContact.mobile.trim()) {
            alert('Please fill in Contact Name and Mobile Number.');
            return;
        }

        const createdItem = {
            id: Date.now(),
            created: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            modified: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            mobile: newContact.mobile,
            name: newContact.name,
            status: newContact.status,
            dest: newContact.dest,
            initial: newContact.name.charAt(0).toUpperCase(),
            color: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'][Math.floor(Math.random() * 5)],
            email: newContact.email || `${newContact.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
            owner: newContact.owner,
            daysOld: 0
        };

        setContacts([createdItem, ...contacts]);
        setActiveModal(null);
        setNewContact({ name: '', mobile: '', email: '', status: 'Cold Leads', dest: 'Manali', owner: 'Self' });
        showToast(`Contact "${createdItem.name}" created successfully!`);
    };

    // Quick Status Update
    const handleUpdateStatus = (id, newStatus) => {
        setContacts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        setStatusPopoverId(null);
        showToast(`Status updated to ${newStatus}`);
    };

    // Bulk Delete
    const handleBulkDelete = () => {
        setContacts(prev => prev.filter(c => !selectedRowIds.includes(c.id)));
        setSelectedRowIds([]);
        showToast('Selected contacts deleted');
    };

    // Bulk Status Change
    const handleBulkStatusChange = (status) => {
        setContacts(prev => prev.map(c => selectedRowIds.includes(c.id) ? { ...c, status } : c));
        setSelectedRowIds([]);
        showToast(`Selected contacts marked as ${status}`);
    };

    return (
        <div className="contacts-container">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="contacts-toast">
                    <Check size={16} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Global backdrop for popups */}
            {(isAllContactsOpen || isDateFilterOpen || isFilterModalOpen || isAddMenuOpen || isColSettingsOpen || isRowsPerPageOpen || statusPopoverId !== null) && (
                <div className="dropdown-backdrop" onClick={closeAllDropdowns} />
            )}

            {/* ---------------- Top Actions Bar 1 ---------------- */}
            <div className="contacts-top-bar">
                <div className="contacts-top-left">
                    {/* View Selector Trigger (Screenshot 1) */}
                    <div
                        className={`contacts-dropdown-trigger ${isAllContactsOpen ? 'active' : ''}`}
                        onClick={() => {
                            const next = !isAllContactsOpen;
                            closeAllDropdowns();
                            setIsAllContactsOpen(next);
                        }}
                    >
                        <User size={16} color="#3B82F6" />
                        <span>{selectedView}</span>
                        <ChevronDown size={15} color="#6B7280" />
                    </div>

                    {/* Date Filter Trigger (Screenshot 2) */}
                    <div
                        className={`date-filter-trigger ${isDateFilterOpen ? 'active' : ''}`}
                        onClick={() => {
                            const next = !isDateFilterOpen;
                            closeAllDropdowns();
                            setIsDateFilterOpen(next);
                        }}
                    >
                        <span style={{ color: '#2563EB', fontWeight: 'bold' }}>∞</span>
                        <span>{selectedDateFilter}</span>
                        <span style={{ color: '#EAB308' }}>★</span>
                        <ChevronDown size={14} color="#6B7280" />
                    </div>

                    {/* Funnel Filter Icon Button (Screenshot 3) */}
                    <button
                        className={`funnel-filter-btn ${isFilterModalOpen ? 'active' : ''}`}
                        title="Filter Data"
                        onClick={() => {
                            const next = !isFilterModalOpen;
                            closeAllDropdowns();
                            setIsFilterModalOpen(next);
                        }}
                    >
                        <FunnelIcon size={18} color="#2563EB" />
                        {filterConditions.length > 0 && <span className="filter-active-dot" />}
                    </button>

                    {/* My Assigned Leads Tab Button */}
                    <button
                        className={`lead-type-tab ${activeTab === 'assigned' ? 'active' : ''}`}
                        onClick={() => {
                            const next = activeTab === 'assigned' ? 'all' : 'assigned';
                            setActiveTab(next);
                            showToast(next === 'assigned' ? 'Showing My Assigned Leads' : 'Showing All Leads');
                        }}
                    >
                        <span style={{ fontSize: '15px' }}>🙎</span>
                        <span>My Assigned Leads</span>
                    </button>

                    {/* Workable Leads Tab Button */}
                    <button
                        className={`lead-type-tab ${activeTab === 'workable' ? 'active' : ''}`}
                        onClick={() => {
                            const next = activeTab === 'workable' ? 'all' : 'workable';
                            setActiveTab(next);
                            showToast(next === 'workable' ? 'Showing Workable Leads' : 'Showing All Leads');
                        }}
                    >
                        <Briefcase size={15} color="#4B5563" />
                        <span>Workable Leads</span>
                    </button>
                </div>

                <div className="contacts-top-right">
                    {/* Column Settings Button */}
                    <button
                        className={`column-settings-btn ${isColSettingsOpen ? 'active' : ''}`}
                        onClick={() => {
                            const next = !isColSettingsOpen;
                            closeAllDropdowns();
                            setIsColSettingsOpen(next);
                        }}
                    >
                        <Columns size={16} color="#6B7280" />
                        <span>Column Settings</span>
                    </button>

                    {/* Add New Contacts Button (Screenshot 4) */}
                    <button
                        className="add-contacts-btn"
                        onClick={() => {
                            const next = !isAddMenuOpen;
                            closeAllDropdowns();
                            setIsAddMenuOpen(next);
                        }}
                    >
                        Add New Contacts
                    </button>
                </div>

                {/* ---------------- 1. "All Contacts" Dropdown Menu (Image 1) ---------------- */}
                {isAllContactsOpen && (
                    <div className="all-contacts-menu" onClick={e => e.stopPropagation()}>
                        {viewOptions.map((opt) => (
                            <div
                                key={opt.id}
                                className={`all-contacts-item ${selectedView === opt.label ? 'selected' : ''}`}
                                onClick={() => {
                                    setSelectedView(opt.label);
                                    setIsAllContactsOpen(false);
                                    showToast(`Filter: ${opt.label}`);
                                }}
                            >
                                <span className="bookmark-icon">{opt.icon}</span>
                                <span>{opt.label}</span>
                                {opt.hasInfo && (
                                    <span
                                        className="item-info-icon"
                                        title="View category details"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            showToast(`Category info for ${opt.label}`);
                                        }}
                                    >
                                        <InfoIcon />
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ---------------- 2. Date Filter Dropdown Menu (Image 2) ---------------- */}
                {isDateFilterOpen && (
                    <div className="date-filter-menu" onClick={e => e.stopPropagation()}>
                        {dateOptions.map((opt) => (
                            <div
                                key={opt.id}
                                className={`date-filter-item ${selectedDateFilter === opt.label ? 'selected' : ''}`}
                                onClick={() => {
                                    setSelectedDateFilter(opt.label);
                                    setIsDateFilterOpen(false);
                                    showToast(`Date Range: ${opt.label}`);
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

                {/* ---------------- 3. "Filter Data" Modal / Popover (Image 3) ---------------- */}
                {isFilterModalOpen && (
                    <div className="filter-data-popover" onClick={e => e.stopPropagation()}>
                        <div className="filter-data-header">
                            <div className="filter-header-icon-box">
                                <FunnelIcon size={18} color="#6366F1" />
                            </div>
                            <span className="filter-data-title">Filter Data</span>
                            <button className="filter-close-btn" onClick={() => setIsFilterModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="filter-data-body">
                            {filterConditions.length === 0 ? (
                                <>
                                    <div className="filter-empty-circle">
                                        <DisabledFilterIcon />
                                    </div>
                                    <div className="filter-empty-title">No filters added yet</div>
                                    <div className="filter-empty-subtitle">Add a condition below to filter your data</div>
                                </>
                            ) : (
                                <div className="filter-conditions-list">
                                    {filterConditions.map((cond, idx) => (
                                        <div key={idx} className="filter-condition-row">
                                            <select
                                                className="condition-select"
                                                value={cond.field}
                                                onChange={(e) => {
                                                    const updated = [...filterConditions];
                                                    updated[idx].field = e.target.value;
                                                    setFilterConditions(updated);
                                                }}
                                            >
                                                <option value="name">Name</option>
                                                <option value="mobile">Mobile</option>
                                                <option value="status">Status</option>
                                                <option value="dest">Destination</option>
                                            </select>
                                            <select
                                                className="condition-select"
                                                value={cond.operator}
                                                onChange={(e) => {
                                                    const updated = [...filterConditions];
                                                    updated[idx].operator = e.target.value;
                                                    setFilterConditions(updated);
                                                }}
                                            >
                                                <option value="contains">contains</option>
                                                <option value="equals">equals</option>
                                                <option value="starts">starts with</option>
                                            </select>
                                            <input
                                                type="text"
                                                className="condition-input"
                                                placeholder="Value..."
                                                value={cond.value}
                                                onChange={(e) => {
                                                    const updated = [...filterConditions];
                                                    updated[idx].value = e.target.value;
                                                    setFilterConditions(updated);
                                                }}
                                            />
                                            <button
                                                className="condition-remove-btn"
                                                onClick={() => setFilterConditions(filterConditions.filter((_, i) => i !== idx))}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                className="add-condition-btn"
                                onClick={() => {
                                    setFilterConditions([
                                        ...filterConditions,
                                        { field: 'name', operator: 'contains', value: '' }
                                    ]);
                                }}
                            >
                                <Plus size={16} />
                                <span>Add Filter Condition</span>
                            </button>
                        </div>

                        <div className="filter-data-footer">
                            <button
                                className="clear-filters-btn"
                                onClick={() => {
                                    setFilterConditions([]);
                                    setIsFilterModalOpen(false);
                                    showToast('Filters cleared');
                                }}
                            >
                                <X size={14} />
                                <span>Clear Filters</span>
                            </button>
                            <button
                                className="apply-filters-btn"
                                onClick={() => {
                                    setIsFilterModalOpen(false);
                                    showToast(`Applied ${filterConditions.length} filter condition(s)`);
                                }}
                            >
                                <Check size={16} />
                                <span>Apply</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ---------------- 4. "Add New Contacts" Menu (Image 4) ---------------- */}
                {isAddMenuOpen && (
                    <div className="add-contacts-menu" onClick={e => e.stopPropagation()}>
                        {addSources.map((source) => (
                            <button
                                key={source.id}
                                className="gradient-border-btn"
                                onClick={() => {
                                    setIsAddMenuOpen(false);
                                    if (source.type === 'form') {
                                        setActiveModal('form');
                                    } else if (source.type === 'import') {
                                        setActiveModal('import');
                                    } else {
                                        setSelectedIntegration(source);
                                        setActiveModal('integration');
                                    }
                                }}
                            >
                                <span className="source-icon-wrap">{source.icon}</span>
                                <span>{source.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* ---------------- 5. Column Settings Popover ---------------- */}
                {isColSettingsOpen && (
                    <div className="column-settings-popover" onClick={e => e.stopPropagation()}>
                        <div className="col-settings-header">
                            <span>Table Columns</span>
                            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Visible</span>
                        </div>
                        <div className="col-settings-list">
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.createdDate}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, createdDate: e.target.checked })}
                                />
                                <span>Created Date</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.modifiedDate}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, modifiedDate: e.target.checked })}
                                />
                                <span>Modified Date</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.mobile}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, mobile: e.target.checked })}
                                />
                                <span>Mobile</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.contactName}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, contactName: e.target.checked })}
                                />
                                <span>Contact Name</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.leadStatus}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, leadStatus: e.target.checked })}
                                />
                                <span>Lead Status</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.destinations}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, destinations: e.target.checked })}
                                />
                                <span>Destinations</span>
                            </label>
                        </div>
                        <div className="col-settings-footer">
                            <button
                                className="reset-cols-btn"
                                onClick={() => {
                                    setVisibleColumns({
                                        createdDate: true,
                                        modifiedDate: true,
                                        mobile: true,
                                        contactName: true,
                                        leadStatus: true,
                                        destinations: true
                                    });
                                    showToast('Columns reset to default');
                                }}
                            >
                                Reset All
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ---------------- Filter Bar 2 ---------------- */}
            <div className="contacts-filter-bar">
                <div className="contacts-search-box">
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

                <button
                    className={`day-filter-btn ${selectedDayRange === '0-30' ? 'active' : ''}`}
                    onClick={() => {
                        const next = selectedDayRange === '0-30' ? null : '0-30';
                        setSelectedDayRange(next);
                        showToast(next ? 'Filtered: 0-30 days' : 'Day filter removed');
                    }}
                >
                    <span>😍</span>
                    <span>0-30 days</span>
                </button>
                <button
                    className={`day-filter-btn ${selectedDayRange === '30-60' ? 'active' : ''}`}
                    onClick={() => {
                        const next = selectedDayRange === '30-60' ? null : '30-60';
                        setSelectedDayRange(next);
                        showToast(next ? 'Filtered: 30-60 days' : 'Day filter removed');
                    }}
                >
                    <span>😐</span>
                    <span>30-60 days</span>
                </button>
                <button
                    className={`day-filter-btn ${selectedDayRange === '60-90' ? 'active' : ''}`}
                    onClick={() => {
                        const next = selectedDayRange === '60-90' ? null : '60-90';
                        setSelectedDayRange(next);
                        showToast(next ? 'Filtered: 60-90 days' : 'Day filter removed');
                    }}
                >
                    <span>😔</span>
                    <span>60-90 days</span>
                </button>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button className="export-btn" onClick={handleExportCSV}>
                        <FileSpreadsheet size={16} />
                        <span>Export</span>
                    </button>
                    <button
                        className={`refresh-icon-btn ${isRefreshing ? 'refreshing' : ''}`}
                        title="Refresh"
                        onClick={handleRefresh}
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* ---------------- Table ---------------- */}
            <div className="contacts-table-wrapper">
                <table className="contacts-table">
                    <thead>
                        <tr>
                            <th className="col-check">
                                <input
                                    type="checkbox"
                                    style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                    checked={paginatedContacts.length > 0 && selectedRowIds.length === paginatedContacts.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            {visibleColumns.createdDate && (
                                <th className="sortable-th" onClick={() => handleSort('created')}>
                                    <div className="th-content">
                                        <Calendar size={14} color="#6B7280" />
                                        <span>Created Date</span>
                                        <span className={`sort-arrows ${sortConfig.key === 'created' ? 'active' : ''}`}>
                                            {sortConfig.key === 'created' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    </div>
                                </th>
                            )}
                            {visibleColumns.modifiedDate && (
                                <th className="sortable-th" onClick={() => handleSort('modified')}>
                                    <div className="th-content">
                                        <RefreshCw size={14} color="#6B7280" />
                                        <span>Modified Date</span>
                                        <span className={`sort-arrows ${sortConfig.key === 'modified' ? 'active' : ''}`}>
                                            {sortConfig.key === 'modified' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    </div>
                                </th>
                            )}
                            {visibleColumns.mobile && (
                                <th className="sortable-th" onClick={() => handleSort('mobile')}>
                                    <div className="th-content">
                                        <span>Mobile</span>
                                        <span className={`sort-arrows ${sortConfig.key === 'mobile' ? 'active' : ''}`}>
                                            {sortConfig.key === 'mobile' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    </div>
                                </th>
                            )}
                            {visibleColumns.contactName && (
                                <th className="sortable-th" onClick={() => handleSort('name')}>
                                    <div className="th-content">
                                        <User size={14} color="#6B7280" />
                                        <span>Contact Name</span>
                                        <span className={`sort-arrows ${sortConfig.key === 'name' ? 'active' : ''}`}>
                                            {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    </div>
                                </th>
                            )}
                            {visibleColumns.leadStatus && (
                                <th className="sortable-th" onClick={() => handleSort('status')}>
                                    <div className="th-content">
                                        <span>Lead Status</span>
                                        <span className={`sort-arrows ${sortConfig.key === 'status' ? 'active' : ''}`}>
                                            {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    </div>
                                </th>
                            )}
                            {visibleColumns.destinations && <th>Destinations</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedContacts.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                                    No contacts found matching the selected criteria.
                                </td>
                            </tr>
                        ) : (
                            paginatedContacts.map((contact) => (
                                <tr
                                    key={contact.id}
                                    className={selectedRowIds.includes(contact.id) ? 'row-selected' : ''}
                                >
                                    <td className="col-check">
                                        <input
                                            type="checkbox"
                                            style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                            checked={selectedRowIds.includes(contact.id)}
                                            onChange={() => toggleSelectRow(contact.id)}
                                        />
                                    </td>
                                    {visibleColumns.createdDate && <td>{contact.created}</td>}
                                    {visibleColumns.modifiedDate && <td>{contact.modified}</td>}
                                    {visibleColumns.mobile && <td style={{ fontWeight: 600 }}>{contact.mobile}</td>}
                                    {visibleColumns.contactName && (
                                        <td>
                                            <div className="contact-name-cell">
                                                <div
                                                    className="contact-avatar-circle"
                                                    style={{ backgroundColor: contact.color }}
                                                >
                                                    {contact.initial}
                                                </div>
                                                <span
                                                    className="contact-name-link"
                                                    onClick={() => setSelectedContactForDrawer(contact)}
                                                >
                                                    {contact.name}
                                                </span>
                                                <div
                                                    className="eye-view-btn"
                                                    title="View Profile Details"
                                                    onClick={() => setSelectedContactForDrawer(contact)}
                                                >
                                                    👁
                                                </div>
                                            </div>
                                        </td>
                                    )}
                                    {visibleColumns.leadStatus && (
                                        <td style={{ position: 'relative' }}>
                                            <span
                                                className="lead-status-pill"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setStatusPopoverId(statusPopoverId === contact.id ? null : contact.id);
                                                }}
                                                title="Click to change status"
                                            >
                                                <div className="status-dot"></div>
                                                {contact.status}
                                            </span>

                                            {statusPopoverId === contact.id && (
                                                <div className="status-dropdown-menu" onClick={e => e.stopPropagation()}>
                                                    {['Cold Leads', 'Hot Leads', 'Open Deal', 'Follow Up Leads', 'Enquiries'].map((st) => (
                                                        <div
                                                            key={st}
                                                            className="status-dropdown-item"
                                                            onClick={() => handleUpdateStatus(contact.id, st)}
                                                        >
                                                            <span>•</span>
                                                            <span>{st}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    )}
                                    {visibleColumns.destinations && (
                                        <td>
                                            {contact.dest && (
                                                <span
                                                    className={`destination-pill ${
                                                        contact.dest === 'Goa' ? 'dest-goa' :
                                                        contact.dest === 'Manali' ? 'dest-manali' :
                                                        contact.dest === 'Kashmir' ? 'dest-kashmir' :
                                                        contact.dest === 'Dubai' ? 'dest-dubai' : 'dest-generic'
                                                    }`}
                                                >
                                                    {contact.dest}
                                                </span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ---------------- Footer Pagination ---------------- */}
            <div className="contacts-footer">
                <div className="footer-stat-pill total-leads-pill">
                    Total Leads: <strong>{filteredAndSortedContacts.length} / 6006</strong>
                </div>
                <div className="footer-stat-pill untouched-leads-pill">
                    Untouched Leads: <strong>0 / 6006</strong>
                </div>
                <div className="footer-stat-pill page-count-pill">
                    Page: <strong>{currentPage} / {totalPages}</strong>
                </div>

                <div className="rows-per-page-container">
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
                    <button
                        className="pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                        <button
                            key={pageNum}
                            className={`pagination-btn ${currentPage === pageNum ? 'active-page' : ''}`}
                            onClick={() => setCurrentPage(pageNum)}
                        >
                            {pageNum}
                        </button>
                    ))}
                    <button
                        className="pagination-btn"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* ---------------- Floating Bulk Actions Bar ---------------- */}
            {selectedRowIds.length > 0 && (
                <div className="bulk-actions-floating-bar">
                    <span className="bulk-count-badge">{selectedRowIds.length} selected</span>
                    <button className="bulk-action-btn" onClick={() => handleBulkStatusChange('Hot Leads')}>
                        <span>🔥 Mark as Hot Leads</span>
                    </button>
                    <button className="bulk-action-btn" onClick={() => handleBulkStatusChange('Open Deal')}>
                        <span>🔖 Convert to Deal</span>
                    </button>
                    <button className="bulk-action-btn btn-danger" onClick={handleBulkDelete}>
                        <Trash2 size={14} />
                        <span>Delete</span>
                    </button>
                    <button className="bulk-action-btn" onClick={() => setSelectedRowIds([])}>
                        <X size={14} />
                        <span>Cancel</span>
                    </button>
                </div>
            )}

            {/* ---------------- Modal 1: Show Form (Add New Contact) ---------------- */}
            {activeModal === 'form' && (
                <div className="crm-modal-backdrop" onClick={() => setActiveModal(null)}>
                    <div className="crm-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="crm-modal-header">
                            <h3 className="crm-modal-title">Create New Contact</h3>
                            <button className="filter-close-btn" onClick={() => setActiveModal(null)}>
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveContact}>
                            <div className="crm-modal-body">
                                <div className="crm-form-group">
                                    <label>Contact Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Ramesh Kumar"
                                        value={newContact.name}
                                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    />
                                </div>
                                <div className="crm-form-group">
                                    <label>Mobile Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="e.g. +91 98765 43210"
                                        value={newContact.mobile}
                                        onChange={(e) => setNewContact({ ...newContact, mobile: e.target.value })}
                                    />
                                </div>
                                <div className="crm-form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="e.g. ramesh@example.com"
                                        value={newContact.email}
                                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="crm-form-group">
                                        <label>Lead Status</label>
                                        <select
                                            value={newContact.status}
                                            onChange={(e) => setNewContact({ ...newContact, status: e.target.value })}
                                        >
                                            <option value="Cold Leads">Cold Leads</option>
                                            <option value="Hot Leads">Hot Leads</option>
                                            <option value="Open Deal">Open Deal</option>
                                            <option value="Follow Up Leads">Follow Up Leads</option>
                                            <option value="Enquiries">Enquiries</option>
                                        </select>
                                    </div>
                                    <div className="crm-form-group">
                                        <label>Destination</label>
                                        <select
                                            value={newContact.dest}
                                            onChange={(e) => setNewContact({ ...newContact, dest: e.target.value })}
                                        >
                                            <option value="Manali">Manali</option>
                                            <option value="Goa">Goa</option>
                                            <option value="Kashmir">Kashmir</option>
                                            <option value="Dubai">Dubai</option>
                                            <option value="Kerala">Kerala</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="crm-modal-footer">
                                <button type="button" className="crm-btn-secondary" onClick={() => setActiveModal(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="crm-btn-primary">
                                    Save Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ---------------- Modal 2: Bulk Import ---------------- */}
            {activeModal === 'import' && (
                <div className="crm-modal-backdrop" onClick={() => setActiveModal(null)}>
                    <div className="crm-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="crm-modal-header">
                            <h3 className="crm-modal-title">Bulk Import Contacts</h3>
                            <button className="filter-close-btn" onClick={() => setActiveModal(null)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="crm-modal-body">
                            <div className="import-dropzone" onClick={() => {
                                showToast('Selected sample contacts file.');
                            }}>
                                <div className="dropzone-icon">
                                    <UploadCloud size={24} />
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
                                    onClick={handleExportCSV}
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
                                    setActiveModal(null);
                                    showToast('Imported 15 new contacts successfully!');
                                }}
                            >
                                Start Import
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- Modal 3: Integration Webhook (Instagram, FB, IndiaMART, etc.) ---------------- */}
            {activeModal === 'integration' && selectedIntegration && (
                <div className="crm-modal-backdrop" onClick={() => setActiveModal(null)}>
                    <div className="crm-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="crm-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>{selectedIntegration.icon}</span>
                                <h3 className="crm-modal-title">{selectedIntegration.label} Lead Webhook</h3>
                            </div>
                            <button className="filter-close-btn" onClick={() => setActiveModal(null)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="crm-modal-body">
                            <p style={{ margin: '0 0 14px 0', fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5 }}>
                                Automatically sync incoming leads from <strong>{selectedIntegration.label}</strong> directly into your DealConverter CRM.
                            </p>

                            <div className="crm-form-group">
                                <label>Your Instant Webhook URL</label>
                                <div className="webhook-box">
                                    <span>https://api.dealconverter.com/v1/webhook/{selectedIntegration.id}_leads_live</span>
                                    <button
                                        className="copy-webhook-btn"
                                        onClick={() => {
                                            navigator.clipboard?.writeText(`https://api.dealconverter.com/v1/webhook/${selectedIntegration.id}_leads_live`);
                                            showToast('Webhook URL copied to clipboard!');
                                        }}
                                    >
                                        <Copy size={12} /> Copy
                                    </button>
                                </div>
                            </div>

                            <div className="crm-form-group">
                                <label>Default Assignee for New Leads</label>
                                <select defaultValue="Self">
                                    <option value="Self">Self (Account Owner)</option>
                                    <option value="Round Robin">Round Robin (Distribute Equally)</option>
                                    <option value="Sales Team">Sales Team</option>
                                </select>
                            </div>
                        </div>
                        <div className="crm-modal-footer">
                            <button type="button" className="crm-btn-secondary" onClick={() => setActiveModal(null)}>
                                Close
                            </button>
                            <button
                                type="button"
                                className="crm-btn-primary"
                                onClick={() => {
                                    setActiveModal(null);
                                    showToast(`${selectedIntegration.label} connected successfully!`);
                                }}
                            >
                                Connect Integration
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- Slide-over Drawer: Contact Details ---------------- */}
            {selectedContactForDrawer && (
                <div className="contact-drawer-backdrop" onClick={() => setSelectedContactForDrawer(null)}>
                    <div className="contact-drawer" onClick={e => e.stopPropagation()}>
                        <div className="drawer-header">
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
                                Contact Overview
                            </h3>
                            <button className="filter-close-btn" onClick={() => setSelectedContactForDrawer(null)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="drawer-body">
                            <div className="drawer-profile-card">
                                <div
                                    className="drawer-avatar-lg"
                                    style={{ backgroundColor: selectedContactForDrawer.color }}
                                >
                                    {selectedContactForDrawer.initial}
                                </div>
                                <div>
                                    <h2 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700, color: '#111827' }}>
                                        {selectedContactForDrawer.name}
                                    </h2>
                                    <span className="lead-status-pill">
                                        <div className="status-dot"></div>
                                        {selectedContactForDrawer.status}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="quick-action-row">
                                <button className="quick-action-btn" onClick={() => showToast(`Calling ${selectedContactForDrawer.mobile}...`)}>
                                    <Phone size={18} color="#2563EB" />
                                    <span>Call</span>
                                </button>
                                <button className="quick-action-btn" onClick={() => showToast(`Opening WhatsApp for ${selectedContactForDrawer.mobile}...`)}>
                                    <MessageSquare size={18} color="#10B981" />
                                    <span>WhatsApp</span>
                                </button>
                                <button className="quick-action-btn" onClick={() => showToast(`Drafting email to ${selectedContactForDrawer.email}...`)}>
                                    <Mail size={18} color="#8B5CF6" />
                                    <span>Email</span>
                                </button>
                            </div>

                            <div className="drawer-section-title">Lead Information</div>
                            <div className="info-grid">
                                <div className="info-grid-item">
                                    <label>Mobile Number</label>
                                    <span>{selectedContactForDrawer.mobile}</span>
                                </div>
                                <div className="info-grid-item">
                                    <label>Email Address</label>
                                    <span>{selectedContactForDrawer.email}</span>
                                </div>
                                <div className="info-grid-item">
                                    <label>Destination</label>
                                    <span>{selectedContactForDrawer.dest || 'Not Specified'}</span>
                                </div>
                                <div className="info-grid-item">
                                    <label>Lead Owner</label>
                                    <span>{selectedContactForDrawer.owner}</span>
                                </div>
                                <div className="info-grid-item">
                                    <label>Created Date</label>
                                    <span style={{ fontSize: '0.8rem' }}>{selectedContactForDrawer.created}</span>
                                </div>
                                <div className="info-grid-item">
                                    <label>Modified Date</label>
                                    <span style={{ fontSize: '0.8rem' }}>{selectedContactForDrawer.modified}</span>
                                </div>
                            </div>

                            <div className="drawer-section-title" style={{ marginTop: '20px' }}>Recent Activity</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '10px', fontSize: '0.825rem' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3B82F6', marginTop: 5 }}></div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1F2937' }}>Lead viewed in Contacts table</div>
                                        <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Just now</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', fontSize: '0.825rem' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', marginTop: 5 }}></div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1F2937' }}>Lead status updated to {selectedContactForDrawer.status}</div>
                                        <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{selectedContactForDrawer.modified}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="crm-modal-footer">
                            <button
                                type="button"
                                className="crm-btn-primary"
                                style={{ width: '100%' }}
                                onClick={() => {
                                    showToast(`Contact ${selectedContactForDrawer.name} updated!`);
                                    setSelectedContactForDrawer(null);
                                }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contacts;
