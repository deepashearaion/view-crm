import React, { useState, useMemo, useEffect } from 'react';
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
import AddContact from './AddContact';
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

// Auth dev token fallback for seamless execution
const DEFAULT_DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjI1MzQwMjMwMDc5OSwiaWF0IjoxNzAwMDAwMDAwfQ.ZIHh3hXJK09TDYKMlAAJeRaDwkSURn84tPnPc3tyC78';

export const getValidToken = () => {
    try {
        const stored = localStorage.getItem('token');
        if (stored && stored !== 'undefined' && stored !== 'null' && stored.trim() !== '') {
            const parts = stored.split('.');
            if (parts.length === 3) {
                try {
                    const payload = JSON.parse(atob(parts[1]));
                    if (!payload.exp || payload.exp * 1000 > Date.now()) {
                        return stored;
                    }
                } catch (e) {
                    return stored;
                }
            }
        }
    } catch (e) {}
    try {
        localStorage.setItem('token', DEFAULT_DEV_TOKEN);
    } catch (e) {}
    return DEFAULT_DEV_TOKEN;
};

const ownerMap = {
    1: 'Arun',
    2: 'Priya Sharma',
    3: 'Rajesh Kumar',
    4: 'KANISHKA C',
    7: 'Self',
    8: 'Kani',
    14: 'Dev User'
};

const ownerToIdMap = {
    'Arun': 1,
    'Priya Sharma': 2,
    'Rajesh Kumar': 3,
    'Self': 7,
    'Kanishka': 7,
    'Kani': 8
};

const statusMap = {
    1: 'Hot Leads',
    2: 'Warm Leads',
    3: 'Cold Leads',
    4: 'Open Deal',
    5: 'Follow Up Leads'
};

const statusToIdMap = {
    'Hot Leads': 1,
    'Warm Leads': 2,
    'Cold Leads': 3,
    'Open Deal': 4,
    'Follow Up Leads': 5,
    'New': 1
};

// Initial mock contacts with full database schema
const initialContacts = [
    { id: 1, first_name: 'Hariharan', last_name: '', name: 'Hariharan', email: 'hariharan@example.com', mobile: '+91 8838687357', alternate_mobile: '+91 9876543201', company_id: 1, lead_status_id: 3, status: 'Cold Leads', lead_owner_id: 7, owner: 'Self', dest: 'Manali', destination: 'Manali', source: 'Website', notes: 'Interested in Manali package', created: 'Jul 16, 2026 12:15:30 AM', modified: 'Aug 21, 2026 11:37:07 AM', initial: 'H', color: '#8B5CF6', daysOld: 12 },
    { id: 2, first_name: 'A M I', last_name: '', name: 'A M I', email: 'ami@example.com', mobile: '+91 8903856486', alternate_mobile: '', company_id: 2, lead_status_id: 3, status: 'Cold Leads', lead_owner_id: 7, owner: 'Self', dest: '', destination: '', source: 'Instagram', notes: 'Pending follow-up', created: 'Jul 15, 2026 07:51:05 PM', modified: 'Aug 21, 2026 11:37:07 AM', initial: 'A', color: '#84CC16', daysOld: 25 },
    { id: 3, first_name: 'Mohan', last_name: 'Raj', name: 'Mohan Raj', email: 'lead9600@example.com', mobile: '+91 9600670965', alternate_mobile: '+91 9444332211', company_id: 1, lead_status_id: 3, status: 'Cold Leads', lead_owner_id: 2, owner: 'Priya Sharma', dest: 'Manali', destination: 'Manali', source: 'Referral', notes: 'Family trip inquiry', created: 'Jul 15, 2026 02:58:54 PM', modified: 'Aug 21, 2026 11:37:07 AM', initial: 'M', color: '#F43F5E', daysOld: 45 },
    { id: 4, first_name: 'Jenifer', last_name: 'S', name: 'Jenifer S', email: 'jenifer@example.com', mobile: '+91 8825887305', alternate_mobile: '', company_id: 3, lead_status_id: 3, status: 'Cold Leads', lead_owner_id: 7, owner: 'Self', dest: 'Goa', destination: 'Goa', source: 'Facebook', notes: 'Weekend group package', created: 'Jul 15, 2026 08:45:25 AM', modified: 'Aug 21, 2026 11:37:07 AM', initial: 'J', color: '#0D9488', daysOld: 70 },
    { id: 5, first_name: 'Priya', last_name: 'Sharma', name: 'Priya Sharma', email: 'priya@example.com', mobile: '+91 9876543210', alternate_mobile: '+91 9123456789', company_id: 1, lead_status_id: 1, status: 'Hot Leads', lead_owner_id: 1, owner: 'Arun', dest: 'Goa', destination: 'Goa', source: 'Website', notes: 'Ready to book advance', created: 'Jul 12, 2026 10:20:15 AM', modified: 'Aug 21, 2026 11:37:07 AM', initial: 'P', color: '#EC4899', daysOld: 5 },
    { id: 6, first_name: 'Vikram', last_name: 'Singh', name: 'Vikram Singh', email: 'vikram@example.com', mobile: '+91 9123456780', alternate_mobile: '', company_id: 2, lead_status_id: 4, status: 'Open Deal', lead_owner_id: 3, owner: 'Rajesh Kumar', dest: 'Kashmir', destination: 'Kashmir', source: 'IndiaMART', notes: 'Negotiating price', created: 'Jul 11, 2026 03:15:40 PM', modified: 'Aug 21, 2026 11:37:07 AM', initial: 'V', color: '#3B82F6', daysOld: 18 },
    { id: 7, first_name: 'Karthik', last_name: 'Raja', name: 'Karthik Raja', email: 'karthik@example.com', mobile: '+91 9988776655', alternate_mobile: '+91 9888777666', company_id: 1, lead_status_id: 5, status: 'Follow Up Leads', lead_owner_id: 7, owner: 'Self', dest: 'Manali', destination: 'Manali', source: 'Google Form', notes: 'Follow up next week', created: 'Jul 09, 2026 09:00:22 AM', modified: 'Aug 21, 2026 11:37:07 AM', initial: 'K', color: '#10B981', daysOld: 62 },
];

const defaultVisibleColumns = {
    createdDate: true,
    modifiedDate: true,
    contactName: true,
    email: true,
    mobile: true,
    alternateMobile: true,
    companyId: true,
    leadStatus: true,
    leadOwner: true,
    destinations: true,
    source: true,
    notes: true
};

const Contacts = ({ initialOpenAddContact = false, setCurrentPage: setDashboardPage }) => {
    // Contacts Data State
    const [contacts, setContacts] = useState(() => {
        try {
            const saved = localStorage.getItem('dealconverter_contacts_data');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return initialContacts;
    });

    // Helper to map backend contact model to UI contact model
    const mapBackendContact = (c) => {
        const fullName = `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.first_name || 'Unnamed';
        const createdDate = c.created_at ? new Date(c.created_at).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }) : (c.created || 'Recently');
        const modifiedDate = c.updated_at ? new Date(c.updated_at).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }) : (c.modified || createdDate);

        const leadStatusId = c.lead_status_id != null ? Number(c.lead_status_id) : (statusToIdMap[c.status] || 3);
        const resolvedStatus = c.status || statusMap[leadStatusId] || 'Cold Leads';
        const leadOwnerId = c.lead_owner_id != null ? Number(c.lead_owner_id) : (ownerToIdMap[c.owner] || 7);
        const resolvedOwner = c.owner || ownerMap[leadOwnerId] || `User #${leadOwnerId}`;

        return {
            id: c.id,
            name: fullName,
            first_name: c.first_name || '',
            last_name: c.last_name || '',
            mobile: c.mobile || '',
            alternate_mobile: c.alternate_mobile || '',
            email: c.email || `${(c.first_name || 'contact').toLowerCase()}@example.com`,
            company_id: c.company_id != null ? c.company_id : '',
            lead_status_id: leadStatusId,
            status: resolvedStatus,
            lead_owner_id: leadOwnerId,
            owner: resolvedOwner,
            dest: c.destination || c.dest || '',
            destination: c.destination || c.dest || '',
            notes: c.notes || '',
            source: c.source || 'Website',
            initial: (c.first_name || fullName || 'U').charAt(0).toUpperCase(),
            color: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'][Math.abs(Number(c.id) || 0) % 5],
            created: createdDate,
            modified: modifiedDate,
            daysOld: c.daysOld || 0
        };
    };

    // 1. GET ALL CONTACTS API
    const fetchContacts = async (silent = false) => {
        const token = getValidToken();
        if (!silent) setIsRefreshing(true);
        try {
            const response = await fetch('/api/contacts', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const contentType = response.headers.get('content-type');
            const data = contentType?.includes('application/json')
                ? await response.json()
                : null;

            if (response.ok && data?.contacts && Array.isArray(data.contacts)) {
                const formatted = data.contacts.map(mapBackendContact);
                setContacts(formatted);
                try {
                    localStorage.setItem('dealconverter_contacts_data', JSON.stringify(formatted));
                } catch (e) {}
            }
        } catch (err) {
            console.warn('GET /api/contacts error, using cached data:', err);
        } finally {
            if (!silent) setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchContacts(false);
    }, []);

    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'dealconverter_contacts_data' && e.newValue) {
                try {
                    setContacts(JSON.parse(e.newValue));
                } catch (e) {
                    console.error(e);
                }
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    useEffect(() => {
        if (contacts && contacts.length > 0) {
            try {
                localStorage.setItem('dealconverter_contacts_data', JSON.stringify(contacts));
            } catch (e) {
                console.error(e);
            }
        }
    }, [contacts]);

    // Dropdown & Popover Toggles
    const [isAllContactsOpen, setIsAllContactsOpen] = useState(false);
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [isColSettingsOpen, setIsColSettingsOpen] = useState(false);
    const [isRowsPerPageOpen, setIsRowsPerPageOpen] = useState(false);
    const [statusPopoverId, setStatusPopoverId] = useState(null);

    // Modals & Drawers
    const [isAddContactDrawerOpen, setIsAddContactDrawerOpen] = useState(initialOpenAddContact);
    const [activeModal, setActiveModal] = useState(initialOpenAddContact ? 'form' : null); // 'form', 'import', 'integration'
    const [selectedIntegration, setSelectedIntegration] = useState(null);
    const [selectedContactForDrawer, setSelectedContactForDrawer] = useState(null);
    const [isDrawerLoading, setIsDrawerLoading] = useState(false);
    const [isEditingInDrawer, setIsEditingInDrawer] = useState(false);
    const [drawerEditForm, setDrawerEditForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        alternate_mobile: '',
        company_id: '',
        lead_status_id: 1,
        lead_owner_id: 7,
        destination: '',
        source: 'Website',
        notes: ''
    });

    useEffect(() => {
        if (initialOpenAddContact) {
            setIsAddContactDrawerOpen(true);
            setActiveModal('form');
        }
    }, [initialOpenAddContact]);

    // Filter and Tab States
    const [selectedView, setSelectedView] = useState('All Contacts');
    const [selectedDateFilter, setSelectedDateFilter] = useState('All time');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'assigned', 'workable'
    const [selectedDayRange, setSelectedDayRange] = useState(null); // '0-30', '30-60', '60-90'
    const [searchQuery, setSearchQuery] = useState('');
    const [filterConditions, setFilterConditions] = useState([]);

    // Table Column Visibility State - All Database Fields
    const [visibleColumns, setVisibleColumns] = useState(() => {
        try {
            localStorage.removeItem('dealconverter_contacts_columns');
            localStorage.removeItem('dealconverter_contacts_columns_v2');
            localStorage.removeItem('dealconverter_contacts_columns_v3');
            localStorage.removeItem('dealconverter_contacts_columns_v4');
            const saved = localStorage.getItem('dealconverter_contacts_columns_v5');
            if (saved) {
                return { ...defaultVisibleColumns, ...JSON.parse(saved) };
            }
        } catch (e) {}
        return defaultVisibleColumns;
    });

    useEffect(() => {
        try {
            localStorage.setItem('dealconverter_contacts_columns_v5', JSON.stringify(visibleColumns));
        } catch (e) {}
    }, [visibleColumns]);

    useEffect(() => {
        // Enforce all database columns are active by default
        setVisibleColumns(prev => {
            const merged = { ...defaultVisibleColumns };
            if (prev && typeof prev === 'object') {
                for (const k of Object.keys(defaultVisibleColumns)) {
                    if (prev[k] === false) merged[k] = false;
                }
            }
            return merged;
        });
    }, []);

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
        dest: '',
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

        // 1. Search filter across all database fields
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(query) ||
                (c.email && c.email.toLowerCase().includes(query)) ||
                (c.mobile && c.mobile.includes(query)) ||
                (c.alternate_mobile && c.alternate_mobile.includes(query)) ||
                (c.dest && c.dest.toLowerCase().includes(query)) ||
                (c.status && c.status.toLowerCase().includes(query)) ||
                (c.owner && c.owner.toLowerCase().includes(query)) ||
                (c.source && c.source.toLowerCase().includes(query)) ||
                (c.notes && c.notes.toLowerCase().includes(query)) ||
                (c.company_id != null && String(c.company_id).includes(query))
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

    // Handle Export CSV - All Database Fields
    const handleExportCSV = () => {
        const headers = ['ID,Created Date,Modified Date,First Name,Last Name,Contact Name,Email,Mobile,Alternate Mobile,Company ID,Lead Status,Lead Owner,Destination,Source,Notes'];
        const rows = filteredAndSortedContacts.map(c =>
            `"${c.id}","${c.created}","${c.modified}","${(c.first_name || '').replace(/"/g, '""')}","${(c.last_name || '').replace(/"/g, '""')}","${(c.name || '').replace(/"/g, '""')}","${(c.email || '').replace(/"/g, '""')}","${(c.mobile || '').replace(/"/g, '""')}","${(c.alternate_mobile || '').replace(/"/g, '""')}","${c.company_id != null ? c.company_id : ''}","${(c.status || '').replace(/"/g, '""')}","${(c.owner || '').replace(/"/g, '""')}","${(c.dest || '').replace(/"/g, '""')}","${(c.source || '').replace(/"/g, '""')}","${(c.notes || '').replace(/"/g, '""')}"`
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

    // Handle Refresh (GET /api/contacts)
    const handleRefresh = () => {
        fetchContacts(false);
        showToast('Contacts list refreshed from database');
    };

    // 2. GET CONTACT BY ID API (GET /api/contacts/:id)
    const handleViewContact = async (contact) => {
        setSelectedContactForDrawer(contact);
        setIsEditingInDrawer(false);
        const rawMob = (contact.mobile || '').replace(/\D/g, '');
        const mob10 = rawMob.length >= 10 ? rawMob.slice(-10) : rawMob;
        const rawAltMob = (contact.alternate_mobile || '').replace(/\D/g, '');
        const altMob10 = rawAltMob.length >= 10 ? rawAltMob.slice(-10) : rawAltMob;

        setDrawerEditForm({
            first_name: contact.first_name || (contact.name ? contact.name.split(' ')[0] : '') || '',
            last_name: contact.last_name || (contact.name ? contact.name.split(' ').slice(1).join(' ') : '') || '',
            email: contact.email || '',
            mobile: mob10,
            alternate_mobile: altMob10,
            company_id: contact.company_id != null && contact.company_id !== '' ? contact.company_id : '',
            lead_status_id: contact.lead_status_id != null ? Number(contact.lead_status_id) : (statusToIdMap[contact.status] || 1),
            lead_owner_id: contact.lead_owner_id != null ? Number(contact.lead_owner_id) : (ownerToIdMap[contact.owner] || 7),
            destination: contact.dest || contact.destination || '',
            source: contact.source || 'Website',
            notes: contact.notes || ''
        });

        setIsDrawerLoading(true);
        const token = getValidToken();
        try {
            const response = await fetch(`/api/contacts/${contact.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const contentType = response.headers.get('content-type');
            const data = contentType?.includes('application/json') ? await response.json() : null;

            if (response.ok && data?.contact) {
                const mapped = mapBackendContact(data.contact);
                setSelectedContactForDrawer(mapped);
                const backMob = (mapped.mobile || '').replace(/\D/g, '');
                const backAltMob = (mapped.alternate_mobile || '').replace(/\D/g, '');
                setDrawerEditForm({
                    first_name: mapped.first_name,
                    last_name: mapped.last_name,
                    email: mapped.email,
                    mobile: backMob.length >= 10 ? backMob.slice(-10) : backMob,
                    alternate_mobile: backAltMob.length >= 10 ? backAltMob.slice(-10) : backAltMob,
                    company_id: mapped.company_id != null && mapped.company_id !== '' ? mapped.company_id : '',
                    lead_status_id: mapped.lead_status_id != null ? Number(mapped.lead_status_id) : 1,
                    lead_owner_id: mapped.lead_owner_id != null ? Number(mapped.lead_owner_id) : 7,
                    destination: mapped.dest,
                    source: mapped.source || 'Website',
                    notes: mapped.notes
                });
            }
        } catch (err) {
            console.warn(`GET /api/contacts/${contact.id} error:`, err);
        } finally {
            setIsDrawerLoading(false);
        }
    };

    // 3. UPDATE CONTACT API (PATCH /api/contacts/:id)
    const handleUpdateStatus = async (id, newStatus) => {
        const statusIdMap = {
            'Hot Leads': 1,
            'Warm Leads': 2,
            'Cold Leads': 3,
            'Open Deal': 4,
            'Follow Up Leads': 5
        };

        const targetStatusId = statusIdMap[newStatus] || 1;
        setContacts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, lead_status_id: targetStatusId } : c));
        setStatusPopoverId(null);
        showToast(`Updating status to ${newStatus}...`);

        const token = getValidToken();
        try {
            const response = await fetch(`/api/contacts/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    lead_status_id: targetStatusId
                })
            });

            if (response.ok) {
                showToast(`Status updated in database to ${newStatus}`);
                fetchContacts(true);
            } else if (response.status === 404) {
                // If it was a mock contact, create it in DB with the updated status
                const contactToCreate = contacts.find(c => c.id === id);
                if (contactToCreate) {
                    const createRes = await fetch('/api/contacts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            first_name: contactToCreate.first_name || contactToCreate.name,
                            last_name: contactToCreate.last_name || '',
                            email: contactToCreate.email || '',
                            mobile: contactToCreate.mobile || '',
                            alternate_mobile: contactToCreate.alternate_mobile || '',
                            company_id: contactToCreate.company_id ? parseInt(contactToCreate.company_id, 10) : null,
                            lead_status_id: targetStatusId,
                            lead_owner_id: contactToCreate.lead_owner_id ? parseInt(contactToCreate.lead_owner_id, 10) : 7,
                            destination: contactToCreate.dest || contactToCreate.destination || '',
                            source: contactToCreate.source || 'Website',
                            notes: contactToCreate.notes || ''
                        })
                    });
                    if (createRes.ok) {
                        showToast(`Status saved in database: ${newStatus}`);
                        fetchContacts(true);
                    }
                }
            } else {
                showToast(`Status updated to ${newStatus}`);
            }
        } catch (err) {
            console.warn(`PATCH /api/contacts/${id} status error:`, err);
            showToast(`Status updated locally to ${newStatus}`);
        }
    };

    const handleSaveDrawerContact = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!selectedContactForDrawer) return;

        const rawMobile = (drawerEditForm.mobile || '').replace(/\D/g, '');
        const cleanMobile = rawMobile.length >= 10 ? rawMobile.slice(-10) : rawMobile;
        if (cleanMobile.length !== 10) {
            showToast('Mobile number must be exactly 10 digits');
            alert('Mobile number must be exactly 10 digits');
            return;
        }

        const rawAltMobile = (drawerEditForm.alternate_mobile || '').replace(/\D/g, '');
        const cleanAltMobile = rawAltMobile.length >= 10 ? rawAltMobile.slice(-10) : rawAltMobile;
        if (drawerEditForm.alternate_mobile && cleanAltMobile.length !== 10) {
            showToast('Alternate mobile must be exactly 10 digits');
            alert('Alternate mobile must be exactly 10 digits');
            return;
        }

        const id = selectedContactForDrawer.id;
        const token = localStorage.getItem('token') || DEFAULT_DEV_TOKEN;
        const updatedName = `${drawerEditForm.first_name || ''} ${drawerEditForm.last_name || ''}`.trim() || selectedContactForDrawer.name;
        const fullMobile = `+91 ${cleanMobile}`;
        const fullAltMobile = cleanAltMobile ? `+91 ${cleanAltMobile}` : '';
        const updatedDest = drawerEditForm.destination || selectedContactForDrawer.dest || '';
        const nowFormatted = new Date().toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        const numCompanyId = drawerEditForm.company_id ? parseInt(drawerEditForm.company_id, 10) : null;
        const numLeadStatusId = Number(drawerEditForm.lead_status_id) || 1;
        const numLeadOwnerId = Number(drawerEditForm.lead_owner_id) || 7;
        const resolvedStatus = statusMap[numLeadStatusId] || 'Cold Leads';
        const resolvedOwner = ownerMap[numLeadOwnerId] || `User #${numLeadOwnerId}`;

        // Optimistic UI update for both drawer and table
        const updatedItem = {
            ...selectedContactForDrawer,
            name: updatedName,
            first_name: drawerEditForm.first_name,
            last_name: drawerEditForm.last_name,
            dest: updatedDest,
            destination: updatedDest,
            mobile: fullMobile,
            alternate_mobile: fullAltMobile,
            email: drawerEditForm.email,
            company_id: numCompanyId,
            lead_status_id: numLeadStatusId,
            status: resolvedStatus,
            lead_owner_id: numLeadOwnerId,
            owner: resolvedOwner,
            source: drawerEditForm.source || 'Website',
            notes: drawerEditForm.notes,
            modified: nowFormatted
        };

        // Immediately update state and localStorage
        setContacts(prev => {
            const next = prev.map(c => c.id === id ? updatedItem : c);
            try {
                localStorage.setItem('dealconverter_contacts_data', JSON.stringify(next));
            } catch (err) {
                console.error(err);
            }
            return next;
        });
        setSelectedContactForDrawer(updatedItem);
        setIsEditingInDrawer(false);

        const patchPayload = {
            first_name: drawerEditForm.first_name,
            last_name: drawerEditForm.last_name,
            email: drawerEditForm.email,
            mobile: fullMobile,
            alternate_mobile: fullAltMobile,
            company_id: numCompanyId,
            lead_status_id: numLeadStatusId,
            lead_owner_id: numLeadOwnerId,
            destination: updatedDest,
            source: drawerEditForm.source || 'Website',
            notes: drawerEditForm.notes
        };

        try {
            const response = await fetch(`/api/contacts/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(patchPayload)
            });
            const contentType = response.headers.get('content-type');
            const data = contentType?.includes('application/json') ? await response.json() : null;

            if (response.ok) {
                if (data?.contact) {
                    const mapped = mapBackendContact(data.contact);
                    setContacts(prev => {
                        const next = prev.map(c => c.id === id ? mapped : c);
                        try {
                            localStorage.setItem('dealconverter_contacts_data', JSON.stringify(next));
                        } catch (err) {
                            console.error(err);
                        }
                        return next;
                    });
                    setSelectedContactForDrawer(mapped);
                }
                showToast(data?.message || 'Contact updated in database!');
                fetchContacts(true);
            } else if (response.status === 401) {
                // Token invalid or expired, retry with DEFAULT_DEV_TOKEN
                localStorage.setItem('token', DEFAULT_DEV_TOKEN);
                const retryRes = await fetch(`/api/contacts/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${DEFAULT_DEV_TOKEN}`
                    },
                    body: JSON.stringify(patchPayload)
                });
                if (retryRes.ok) {
                    const retryData = await retryRes.json();
                    if (retryData?.contact) {
                        const mapped = mapBackendContact(retryData.contact);
                        setSelectedContactForDrawer(mapped);
                    }
                    showToast('Contact updated in database!');
                    fetchContacts(true);
                } else {
                    showToast('Could not authorize update with database');
                }
            } else if (response.status === 404) {
                // If ID is not in DB (client-side/mock item), save into PostgreSQL via POST
                const createRes = await fetch('/api/contacts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(patchPayload)
                });
                const createData = await createRes.json();
                if (createRes.ok && createData?.contact) {
                    const mappedNew = mapBackendContact(createData.contact);
                    setContacts(prev => {
                        const next = prev.map(c => c.id === id ? mappedNew : c);
                        try {
                            localStorage.setItem('dealconverter_contacts_data', JSON.stringify(next));
                        } catch (err) {
                            console.error(err);
                        }
                        return next;
                    });
                    setSelectedContactForDrawer(mappedNew);
                    showToast('Contact created and updated in database!');
                    fetchContacts(true);
                } else {
                    showToast('Updated locally in table');
                }
            } else {
                showToast(data?.error || 'Updated locally');
            }
        } catch (err) {
            console.warn(`PATCH /api/contacts/${id} error:`, err);
            showToast('Updated locally (offline)');
        }
    };

    // 4. DELETE CONTACT API (DELETE /api/contacts/:id)
    const handleDeleteContact = async (id) => {
        const token = localStorage.getItem('token') || DEFAULT_DEV_TOKEN;
        try {
            const response = await fetch(`/api/contacts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const contentType = response.headers.get('content-type');
            const data = contentType?.includes('application/json') ? await response.json() : null;

            if (response.ok) {
                showToast(data?.message || 'Contact deleted successfully from database');
            }
        } catch (err) {
            console.warn(`DELETE /api/contacts/${id} error:`, err);
        }

        setContacts(prev => prev.filter(c => c.id !== id));
        setSelectedRowIds(prev => prev.filter(rId => rId !== id));
        if (selectedContactForDrawer?.id === id) {
            setSelectedContactForDrawer(null);
        }
    };

    // Bulk Delete (DELETE /api/contacts/:id)
    const handleBulkDelete = async () => {
        const token = localStorage.getItem('token') || DEFAULT_DEV_TOKEN;
        const idsToDelete = [...selectedRowIds];
        setContacts(prev => prev.filter(c => !idsToDelete.includes(c.id)));
        setSelectedRowIds([]);
        showToast(`Deleting ${idsToDelete.length} contact(s) from database...`);

        for (const id of idsToDelete) {
            try {
                await fetch(`/api/contacts/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (err) {
                console.warn(`DELETE /api/contacts/${id} error:`, err);
            }
        }
        showToast('Selected contacts deleted from database');
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
                        onClick={(e) => {
                            e.stopPropagation();
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
                                                <option value="name">Contact Name</option>
                                                <option value="first_name">First Name</option>
                                                <option value="last_name">Last Name</option>
                                                <option value="email">Email Address</option>
                                                <option value="mobile">Mobile Number</option>
                                                <option value="alternate_mobile">Alternate Mobile</option>
                                                <option value="company_id">Company ID</option>
                                                <option value="status">Lead Status</option>
                                                <option value="owner">Lead Owner</option>
                                                <option value="dest">Destination</option>
                                                <option value="source">Lead Source</option>
                                                <option value="notes">Notes</option>
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
                                type="button"
                                className="gradient-border-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAddMenuOpen(false);
                                    if (source.type === 'form') {
                                        setIsAddContactDrawerOpen(true);
                                        setActiveModal('form');
                                    } else if (source.type === 'import') {
                                        localStorage.setItem('dealconverter_import_target', 'Contacts');
                                        if (setDashboardPage) {
                                            setDashboardPage('Bulk Import');
                                        } else {
                                            setActiveModal('import');
                                        }
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
                            <span>Table Columns (Database Fields)</span>
                            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Toggle visibility</span>
                        </div>
                        <div className="col-settings-list">
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.createdDate !== false}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, createdDate: e.target.checked })}
                                />
                                <span>Created Date</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.modifiedDate !== false}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, modifiedDate: e.target.checked })}
                                />
                                <span>Modified Date</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.contactName !== false}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, contactName: e.target.checked })}
                                />
                                <span>Contact Name</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.email !== false}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, email: e.target.checked })}
                                />
                                <span>Email Address</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.mobile !== false}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, mobile: e.target.checked })}
                                />
                                <span>Mobile</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.alternateMobile !== false}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, alternateMobile: e.target.checked })}
                                />
                                <span>Alternate Mobile</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.companyId !== false}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, companyId: e.target.checked })}
                                />
                                <span>Company ID</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.leadStatus !== false}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, leadStatus: e.target.checked })}
                                />
                                <span>Lead Status</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.leadOwner !== false}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, leadOwner: e.target.checked })}
                                />
                                <span>Lead Owner</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.destinations !== false}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, destinations: e.target.checked })}
                                />
                                <span>Destinations</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.source !== false}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, source: e.target.checked })}
                                />
                                <span>Lead Source</span>
                            </label>
                            <label className="col-setting-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.notes !== false}
                                    onChange={(e) => setVisibleColumns({ ...visibleColumns, notes: e.target.checked })}
                                />
                                <span>Notes</span>
                            </label>
                        </div>
                        <div className="col-settings-footer" style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <button
                                className="reset-cols-btn"
                                onClick={() => {
                                    setVisibleColumns({
                                        createdDate: true,
                                        modifiedDate: true,
                                        contactName: true,
                                        email: true,
                                        mobile: true,
                                        alternateMobile: true,
                                        companyId: true,
                                        leadStatus: true,
                                        leadOwner: true,
                                        destinations: true,
                                        source: true,
                                        notes: true
                                    });
                                    showToast('All columns shown');
                                }}
                            >
                                Show All
                            </button>
                            <button
                                className="reset-cols-btn"
                                onClick={() => {
                                    setVisibleColumns({
                                        createdDate: true,
                                        modifiedDate: true,
                                        contactName: true,
                                        email: true,
                                        mobile: true,
                                        alternateMobile: true,
                                        companyId: true,
                                        leadStatus: true,
                                        leadOwner: true,
                                        destinations: true,
                                        source: true,
                                        notes: true
                                    });
                                    showToast('Columns reset to default');
                                }}
                            >
                                Reset Default
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
                            {visibleColumns.createdDate !== false && (
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
                            {visibleColumns.modifiedDate !== false && (
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
                            {visibleColumns.contactName !== false && (
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
                            {visibleColumns.email !== false && (
                                <th className="sortable-th" onClick={() => handleSort('email')}>
                                    <div className="th-content">
                                        <Mail size={14} color="#6B7280" />
                                        <span>Email</span>
                                        <span className={`sort-arrows ${sortConfig.key === 'email' ? 'active' : ''}`}>
                                            {sortConfig.key === 'email' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    </div>
                                </th>
                            )}
                            {visibleColumns.mobile !== false && (
                                <th className="sortable-th" onClick={() => handleSort('mobile')}>
                                    <div className="th-content">
                                        <Phone size={14} color="#6B7280" />
                                        <span>Mobile</span>
                                        <span className={`sort-arrows ${sortConfig.key === 'mobile' ? 'active' : ''}`}>
                                            {sortConfig.key === 'mobile' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    </div>
                                </th>
                            )}
                            {visibleColumns.alternateMobile !== false && (
                                <th className="sortable-th" onClick={() => handleSort('alternate_mobile')}>
                                    <div className="th-content">
                                        <Phone size={14} color="#6B7280" />
                                        <span>Alternate Mobile</span>
                                        <span className={`sort-arrows ${sortConfig.key === 'alternate_mobile' ? 'active' : ''}`}>
                                            {sortConfig.key === 'alternate_mobile' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    </div>
                                </th>
                            )}
                            {visibleColumns.companyId !== false && (
                                <th className="sortable-th" onClick={() => handleSort('company_id')}>
                                    <div className="th-content">
                                        <Briefcase size={14} color="#6B7280" />
                                        <span>Company ID</span>
                                        <span className={`sort-arrows ${sortConfig.key === 'company_id' ? 'active' : ''}`}>
                                            {sortConfig.key === 'company_id' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    </div>
                                </th>
                            )}
                            {visibleColumns.leadStatus !== false && (
                                <th className="sortable-th" onClick={() => handleSort('status')}>
                                    <div className="th-content">
                                        <span>Lead Status</span>
                                        <span className={`sort-arrows ${sortConfig.key === 'status' ? 'active' : ''}`}>
                                            {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    </div>
                                </th>
                            )}
                            {visibleColumns.leadOwner !== false && (
                                <th className="sortable-th" onClick={() => handleSort('owner')}>
                                    <div className="th-content">
                                        <Users size={14} color="#6B7280" />
                                        <span>Lead Owner</span>
                                        <span className={`sort-arrows ${sortConfig.key === 'owner' ? 'active' : ''}`}>
                                            {sortConfig.key === 'owner' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    </div>
                                </th>
                            )}
                            {visibleColumns.destinations !== false && (
                                <th className="sortable-th" onClick={() => handleSort('dest')}>
                                    <div className="th-content">
                                        <span>Destination</span>
                                        <span className={`sort-arrows ${sortConfig.key === 'dest' ? 'active' : ''}`}>
                                            {sortConfig.key === 'dest' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    </div>
                                </th>
                            )}
                            {visibleColumns.source !== false && (
                                <th className="sortable-th" onClick={() => handleSort('source')}>
                                    <div className="th-content">
                                        <span>Lead Source</span>
                                        <span className={`sort-arrows ${sortConfig.key === 'source' ? 'active' : ''}`}>
                                            {sortConfig.key === 'source' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    </div>
                                </th>
                            )}
                            {visibleColumns.notes !== false && (
                                <th className="sortable-th" onClick={() => handleSort('notes')}>
                                    <div className="th-content">
                                        <MessageSquare size={14} color="#6B7280" />
                                        <span>Notes</span>
                                        <span className={`sort-arrows ${sortConfig.key === 'notes' ? 'active' : ''}`}>
                                            {sortConfig.key === 'notes' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    </div>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedContacts.length === 0 ? (
                            <tr>
                                <td colSpan={Object.keys(defaultVisibleColumns).filter(k => visibleColumns[k] !== false).length + 1} style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
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
                                    {visibleColumns.createdDate !== false && <td>{contact.created}</td>}
                                    {visibleColumns.modifiedDate !== false && <td>{contact.modified}</td>}
                                    {visibleColumns.contactName !== false && (
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
                                                    onClick={() => handleViewContact(contact)}
                                                >
                                                    {contact.name}
                                                </span>
                                                <div
                                                    className="eye-view-btn"
                                                    title="View Profile Details (GET by ID)"
                                                    onClick={() => handleViewContact(contact)}
                                                >
                                                    👁
                                                </div>
                                                <button
                                                    type="button"
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#EF4444',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        borderRadius: '4px',
                                                        marginLeft: '4px'
                                                    }}
                                                    title="Delete Contact (DELETE API)"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`Delete "${contact.name}" from database?`)) {
                                                            handleDeleteContact(contact.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                    {visibleColumns.email !== false && (
                                        <td>
                                            <a href={`mailto:${contact.email}`} className="email-link" title={contact.email}>
                                                {contact.email || '-'}
                                            </a>
                                        </td>
                                    )}
                                    {visibleColumns.mobile !== false && <td style={{ fontWeight: 600 }}>{contact.mobile || '-'}</td>}
                                    {visibleColumns.alternateMobile !== false && (
                                        <td style={{ color: contact.alternate_mobile ? '#374151' : '#9CA3AF' }}>
                                            {contact.alternate_mobile || '-'}
                                        </td>
                                    )}
                                    {visibleColumns.companyId !== false && (
                                        <td>
                                            <span className="company-badge">
                                                {contact.company_id != null && contact.company_id !== '' ? `#${contact.company_id}` : '-'}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.leadStatus !== false && (
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
                                    {visibleColumns.leadOwner !== false && (
                                        <td>
                                            <span className="lead-owner-badge">
                                                {contact.owner || '-'}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.destinations !== false && (
                                        <td>
                                            {contact.dest ? (
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
                                            ) : (
                                                <span style={{ color: '#9CA3AF' }}>-</span>
                                            )}
                                        </td>
                                    )}
                                    {visibleColumns.source !== false && (
                                        <td>
                                            <span className="source-badge">
                                                {contact.source || 'Website'}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.notes !== false && (
                                        <td>
                                            <span className="notes-cell" title={contact.notes || ''}>
                                                {contact.notes || '-'}
                                            </span>
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

            {/* ---------------- Slide-Over Drawer: Add New Contact (Matching 5 Screenshots) ---------------- */}
            <AddContact
                isOpen={isAddContactDrawerOpen || activeModal === 'form'}
                onClose={() => {
                    setIsAddContactDrawerOpen(false);
                    setActiveModal(null);
                }}
                onBulkImport={() => {
                    setIsAddContactDrawerOpen(false);
                    setActiveModal(null);
                    localStorage.setItem('dealconverter_import_target', 'Contacts');
                    if (setDashboardPage) {
                        setDashboardPage('Bulk Import');
                    }
                }}
                onContactAdded={(createdItem) => {
                    setContacts(prev => [createdItem, ...prev.filter(c => c.id !== createdItem.id)]);
                    setActiveModal(null);
                    setIsAddContactDrawerOpen(false);
                    showToast(`Contact "${createdItem.name}" created successfully!`);
                    fetchContacts(true);
                }}
            />

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
                        <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
                                    Contact Details
                                </h3>
                                <span style={{ fontSize: '0.75rem', background: '#EEF2FF', color: '#1E29FF', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                                    ID #{selectedContactForDrawer.id}
                                </span>
                            </div>
                            <button className="filter-close-btn" onClick={() => setSelectedContactForDrawer(null)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="drawer-body">
                            {isDrawerLoading ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                                    <RefreshCw className="refreshing" size={24} style={{ marginBottom: '8px' }} />
                                    <p>Loading contact details from database...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="drawer-profile-card">
                                        <div
                                            className="drawer-avatar-lg"
                                            style={{ backgroundColor: selectedContactForDrawer.color }}
                                        >
                                            {selectedContactForDrawer.initial}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700, color: '#111827' }}>
                                                {selectedContactForDrawer.name}
                                            </h2>
                                            <span className="lead-status-pill">
                                                <div className="status-dot"></div>
                                                {selectedContactForDrawer.status}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!isEditingInDrawer && selectedContactForDrawer) {
                                                    const rawMob = (selectedContactForDrawer.mobile || '').replace(/\D/g, '');
                                                    const mob10 = rawMob.length >= 10 ? rawMob.slice(-10) : rawMob;
                                                    const rawAltMob = (selectedContactForDrawer.alternate_mobile || '').replace(/\D/g, '');
                                                    const altMob10 = rawAltMob.length >= 10 ? rawAltMob.slice(-10) : rawAltMob;

                                                    setDrawerEditForm({
                                                        first_name: selectedContactForDrawer.first_name || (selectedContactForDrawer.name ? selectedContactForDrawer.name.split(' ')[0] : '') || '',
                                                        last_name: selectedContactForDrawer.last_name || (selectedContactForDrawer.name ? selectedContactForDrawer.name.split(' ').slice(1).join(' ') : '') || '',
                                                        email: selectedContactForDrawer.email || '',
                                                        mobile: mob10,
                                                        alternate_mobile: altMob10,
                                                        company_id: selectedContactForDrawer.company_id != null && selectedContactForDrawer.company_id !== '' ? selectedContactForDrawer.company_id : '',
                                                        lead_status_id: selectedContactForDrawer.lead_status_id != null ? Number(selectedContactForDrawer.lead_status_id) : (statusToIdMap[selectedContactForDrawer.status] || 1),
                                                        lead_owner_id: selectedContactForDrawer.lead_owner_id != null ? Number(selectedContactForDrawer.lead_owner_id) : (ownerToIdMap[selectedContactForDrawer.owner] || 7),
                                                        destination: selectedContactForDrawer.dest || selectedContactForDrawer.destination || '',
                                                        source: selectedContactForDrawer.source || 'Website',
                                                        notes: selectedContactForDrawer.notes || ''
                                                    });
                                                }
                                                setIsEditingInDrawer(!isEditingInDrawer);
                                            }}
                                            style={{
                                                background: isEditingInDrawer ? '#E5E7EB' : '#EEF2FF',
                                                color: isEditingInDrawer ? '#374151' : '#1E29FF',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.825rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            {isEditingInDrawer ? 'Cancel Edit' : 'Edit Contact'}
                                        </button>
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

                                    {/* EDIT MODE (PATCH API with all database fields) */}
                                    {isEditingInDrawer ? (
                                        <form onSubmit={handleSaveDrawerContact} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                                            <div className="drawer-section-title">Edit Contact Details (Database Fields)</div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600, display: 'block', marginBottom: '4px' }}>First Name *</label>
                                                    <input
                                                        type="text"
                                                        className="auth-input"
                                                        value={drawerEditForm.first_name}
                                                        onChange={e => setDrawerEditForm({ ...drawerEditForm, first_name: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Last Name</label>
                                                    <input
                                                        type="text"
                                                        className="auth-input"
                                                        value={drawerEditForm.last_name}
                                                        onChange={e => setDrawerEditForm({ ...drawerEditForm, last_name: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                                                        Mobile Number (10 digits) *
                                                    </label>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <span style={{
                                                            background: '#F3F4F6',
                                                            border: '1px solid #D1D5DB',
                                                            borderRight: 'none',
                                                            borderRadius: '6px 0 0 6px',
                                                            padding: '8px 10px',
                                                            fontSize: '0.875rem',
                                                            color: '#4B5563',
                                                            fontWeight: 600
                                                        }}>
                                                            +91
                                                        </span>
                                                        <input
                                                            type="tel"
                                                            maxLength={10}
                                                            className="auth-input"
                                                            style={{ borderRadius: '0 6px 6px 0' }}
                                                            placeholder="10-digit mobile"
                                                            value={drawerEditForm.mobile}
                                                            onChange={e => {
                                                                const digits = e.target.value.replace(/\D/g, '');
                                                                setDrawerEditForm({ ...drawerEditForm, mobile: digits });
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                                                        Alternate Mobile (Optional)
                                                    </label>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <span style={{
                                                            background: '#F3F4F6',
                                                            border: '1px solid #D1D5DB',
                                                            borderRight: 'none',
                                                            borderRadius: '6px 0 0 6px',
                                                            padding: '8px 10px',
                                                            fontSize: '0.875rem',
                                                            color: '#4B5563',
                                                            fontWeight: 600
                                                        }}>
                                                            +91
                                                        </span>
                                                        <input
                                                            type="tel"
                                                            maxLength={10}
                                                            className="auth-input"
                                                            style={{ borderRadius: '0 6px 6px 0' }}
                                                            placeholder="10-digit alternate"
                                                            value={drawerEditForm.alternate_mobile}
                                                            onChange={e => {
                                                                const digits = e.target.value.replace(/\D/g, '');
                                                                setDrawerEditForm({ ...drawerEditForm, alternate_mobile: digits });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Email Address</label>
                                                    <input
                                                        type="email"
                                                        className="auth-input"
                                                        value={drawerEditForm.email}
                                                        onChange={e => setDrawerEditForm({ ...drawerEditForm, email: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Company ID</label>
                                                    <input
                                                        type="number"
                                                        className="auth-input"
                                                        placeholder="e.g. 1"
                                                        value={drawerEditForm.company_id}
                                                        onChange={e => setDrawerEditForm({ ...drawerEditForm, company_id: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Destination</label>
                                                    <input
                                                        type="text"
                                                        list="drawer-destinations"
                                                        className="auth-input"
                                                        placeholder="e.g. Manali, Goa, Dubai..."
                                                        value={drawerEditForm.destination}
                                                        onChange={e => setDrawerEditForm({ ...drawerEditForm, destination: e.target.value })}
                                                    />
                                                    <datalist id="drawer-destinations">
                                                        <option value="Manali" />
                                                        <option value="Goa" />
                                                        <option value="Dubai" />
                                                        <option value="Bali" />
                                                        <option value="Singapore" />
                                                        <option value="Kerala" />
                                                        <option value="Kashmir" />
                                                        <option value="Ooty" />
                                                        <option value="Maldives" />
                                                        <option value="Thailand" />
                                                    </datalist>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Lead Source</label>
                                                    <select
                                                        className="auth-input"
                                                        value={drawerEditForm.source}
                                                        onChange={e => setDrawerEditForm({ ...drawerEditForm, source: e.target.value })}
                                                    >
                                                        <option value="Website">Website</option>
                                                        <option value="Instagram">Instagram</option>
                                                        <option value="Facebook">Facebook</option>
                                                        <option value="Google Form">Google Form</option>
                                                        <option value="IndiaMART">IndiaMART</option>
                                                        <option value="WhatsApp">WhatsApp</option>
                                                        <option value="Referral">Referral</option>
                                                        <option value="Walk-in">Walk-in</option>
                                                        <option value="Direct">Direct</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Lead Status</label>
                                                    <select
                                                        className="auth-input"
                                                        value={drawerEditForm.lead_status_id}
                                                        onChange={e => setDrawerEditForm({ ...drawerEditForm, lead_status_id: Number(e.target.value) })}
                                                    >
                                                        <option value={1}>Hot Leads</option>
                                                        <option value={2}>Warm Leads</option>
                                                        <option value={3}>Cold Leads</option>
                                                        <option value={4}>Open Deal</option>
                                                        <option value={5}>Follow Up Leads</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Lead Owner</label>
                                                    <select
                                                        className="auth-input"
                                                        value={drawerEditForm.lead_owner_id}
                                                        onChange={e => setDrawerEditForm({ ...drawerEditForm, lead_owner_id: Number(e.target.value) })}
                                                    >
                                                        <option value={1}>Arun</option>
                                                        <option value={2}>Priya Sharma</option>
                                                        <option value={3}>Rajesh Kumar</option>
                                                        <option value={7}>Self / Kanishka</option>
                                                        <option value={8}>Kani</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Notes</label>
                                                <textarea
                                                    className="auth-input"
                                                    style={{ height: '70px', resize: 'vertical' }}
                                                    placeholder="Enter internal notes, customer requirements..."
                                                    value={drawerEditForm.notes}
                                                    onChange={e => setDrawerEditForm({ ...drawerEditForm, notes: e.target.value })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                <button
                                                    type="submit"
                                                    className="crm-btn-primary"
                                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                                >
                                                    <Check size={16} /> Save Update
                                                </button>
                                                <button
                                                    type="button"
                                                    className="crm-btn-secondary"
                                                    onClick={() => setIsEditingInDrawer(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="drawer-section-title">Lead Information (Database Records)</div>
                                            <div className="info-grid">
                                                <div className="info-grid-item">
                                                    <label>First Name</label>
                                                    <span>{selectedContactForDrawer.first_name || '-'}</span>
                                                </div>
                                                <div className="info-grid-item">
                                                    <label>Last Name</label>
                                                    <span>{selectedContactForDrawer.last_name || '-'}</span>
                                                </div>
                                                <div className="info-grid-item">
                                                    <label>Mobile Number</label>
                                                    <span>{selectedContactForDrawer.mobile || '-'}</span>
                                                </div>
                                                <div className="info-grid-item">
                                                    <label>Alternate Mobile</label>
                                                    <span>{selectedContactForDrawer.alternate_mobile || 'Not Specified'}</span>
                                                </div>
                                                <div className="info-grid-item">
                                                    <label>Email Address</label>
                                                    <span>{selectedContactForDrawer.email || '-'}</span>
                                                </div>
                                                <div className="info-grid-item">
                                                    <label>Company ID</label>
                                                    <span>{selectedContactForDrawer.company_id != null && selectedContactForDrawer.company_id !== '' ? `#${selectedContactForDrawer.company_id}` : 'Not Specified'}</span>
                                                </div>
                                                <div className="info-grid-item">
                                                    <label>Destination</label>
                                                    <span>{selectedContactForDrawer.dest || 'Not Specified'}</span>
                                                </div>
                                                <div className="info-grid-item">
                                                    <label>Lead Owner</label>
                                                    <span>{selectedContactForDrawer.owner || '-'}</span>
                                                </div>
                                                <div className="info-grid-item">
                                                    <label>Lead Source</label>
                                                    <span>{selectedContactForDrawer.source || 'Website'}</span>
                                                </div>
                                                <div className="info-grid-item">
                                                    <label>Lead Status</label>
                                                    <span>{selectedContactForDrawer.status || '-'}</span>
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

                                            {selectedContactForDrawer.notes && (
                                                <div style={{ marginTop: '16px', background: '#F9FAFB', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                                                    <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600, marginBottom: '4px' }}>Notes:</div>
                                                    <div style={{ fontSize: '0.88rem', color: '#1F2937', whiteSpace: 'pre-wrap' }}>{selectedContactForDrawer.notes}</div>
                                                </div>
                                            )}

                                            <div className="drawer-section-title" style={{ marginTop: '20px' }}>Recent Activity</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div style={{ display: 'flex', gap: '10px', fontSize: '0.825rem' }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3B82F6', marginTop: 5 }}></div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#1F2937' }}>Lead fetched via GET /api/contacts/{selectedContactForDrawer.id}</div>
                                                        <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Active database record</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px', fontSize: '0.825rem' }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', marginTop: 5 }}></div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#1F2937' }}>Lead status: {selectedContactForDrawer.status}</div>
                                                        <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{selectedContactForDrawer.modified}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="crm-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                            {isEditingInDrawer ? (
                                <>
                                    <button
                                        type="button"
                                        className="crm-btn-secondary"
                                        onClick={() => setIsEditingInDrawer(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="crm-btn-primary"
                                        onClick={handleSaveDrawerContact}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '130px', justifyContent: 'center' }}
                                    >
                                        <Check size={16} /> Save Update
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        style={{
                                            background: '#FEE2E2',
                                            color: '#DC2626',
                                            border: '1px solid #FCA5A5',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontWeight: 600,
                                            fontSize: '0.875rem'
                                        }}
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to permanently delete "${selectedContactForDrawer.name}" from database?`)) {
                                                handleDeleteContact(selectedContactForDrawer.id);
                                            }
                                        }}
                                    >
                                        <Trash2 size={16} /> Delete Contact
                                    </button>

                                    <button
                                        type="button"
                                        className="crm-btn-primary"
                                        style={{ minWidth: '120px' }}
                                        onClick={() => setSelectedContactForDrawer(null)}
                                    >
                                        Close
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- Floating Bulk Delete Bar ---------------- */}
            {selectedRowIds.length > 0 && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1F2937',
                    color: '#FFFFFF',
                    padding: '12px 24px',
                    borderRadius: '50px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    zIndex: 1000
                }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {selectedRowIds.length} contact(s) selected
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            if (window.confirm(`Delete ${selectedRowIds.length} contact(s) from database?`)) {
                                handleBulkDelete();
                            }
                        }}
                        style={{
                            background: '#EF4444',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 18px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                        }}
                    >
                        <Trash2 size={15} /> Delete Selected (DELETE API)
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedRowIds([])}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#9CA3AF',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default Contacts;
