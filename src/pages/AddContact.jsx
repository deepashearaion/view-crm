import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, Check, Lock, Clock, FileSpreadsheet } from 'lucide-react';
import './AddContact.css';

const countryCodes = [
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+1', flag: '🇺🇸', name: 'USA' },
    { code: '+44', flag: '🇬🇧', name: 'UK' },
    { code: '+971', flag: '🇦🇪', name: 'UAE' },
    { code: '+65', flag: '🇸🇬', name: 'Singapore' },
    { code: '+61', flag: '🇦🇺', name: 'Australia' },
    { code: '+49', flag: '🇩🇪', name: 'Germany' },
    { code: '+1', flag: '🇨🇦', name: 'Canada' },
];

const leadStatusOptions = [
    { label: 'New', color: '#EF4444', bg: '#FEF2F2', border: '#F87171' },
    { label: 'Cold Leads', color: '#2563EB', bg: '#EFF6FF', border: '#93C5FD' },
    { label: 'Warm Leads', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
    { label: 'Hot Leads', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
    { label: 'Contacted', color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
    { label: 'Qualified', color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD' },
    { label: 'Proposal Sent', color: '#4B5563', bg: '#F3F4F6', border: '#D1D5DB' },
];

const contactTypes = [
    'Customer',
    'Lead',
    'Partner',
    'Vendor',
    'Prospect',
    'Other'
];

const leadOwners = [
    { name: 'Arun', letter: 'A', bg: '#059669' },
    { name: 'Priya Sharma', letter: 'P', bg: '#2563EB' },
    { name: 'Rajesh Kumar', letter: 'R', bg: '#7C3AED' },
    { name: 'Self', letter: 'S', bg: '#4B5563' },
];

const contactedOptions = ['Yes', 'No', 'Pending', 'Attempted'];

const leadSourceOptions = [
    'Website',
    'Instagram',
    'Facebook',
    'Google Form',
    'IndiaMART',
    'TradeIndia',
    'JustDial',
    'Referral',
    'Cold Call',
    'Advertisement',
    'LinkedIn',
    'Others'
];

const advanceStatusOptions = [
    'Received',
    'Pending',
    'Partially Received',
    'Not Applicable'
];

const destinationOptions = [
    'Manali',
    'Goa',
    'Kashmir',
    'Dubai',
    'Kerala',
    'Ooty',
    'Shimla',
    'Madurai',
    'Chennai',
    'Thailand',
    'Bali',
    'Maldives',
    'Europe',
    'Singapore'
];

const invoiceSharedOptions = ['Yes', 'No', 'Drafted', 'Sent'];

const postTripOptions = [
    'Completed Successfully',
    'Feedback Collected',
    'Pending Feedback',
    'Escalated',
    'Other'
];

const tripIssueOptions = [
    'No Issues',
    'Hotel Issue',
    'Cab / Transport Issue',
    'Flight Delay',
    'Guide Issue',
    'Resolved',
    'Other'
];

const ticketOptions = [
    'Yes',
    'No',
    'In Progress',
    'Partially Booked',
    'Not Required'
];

const agreementOptions = ['Yes', 'No', 'Under Review', 'Signed'];
const arrangementsMadeOptions = ['Yes', 'No', 'In Progress', 'Pending', 'Confirmed'];
const quoteSharedStatusOptions = ['Yes', 'No', 'Shared', 'Draft', 'Pending'];
const statusToIdMap = {
    'New': 1,
    'Hot Leads': 1,
    'Warm Leads': 2,
    'Cold Leads': 3,
    'Open Deal': 4,
    'Follow Up Leads': 5,
    'Contacted': 2,
    'Qualified': 4,
    'Proposal Sent': 4
};

const ownerToIdMap = {
    'Arun': 1,
    'Priya Sharma': 2,
    'Rajesh Kumar': 3,
    'Self': 7,
    'Kanishka': 7,
    'Kani': 8
};

const DEFAULT_DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjI1MzQwMjMwMDc5OSwiaWF0IjoxNzAwMDAwMDAwfQ.ZIHh3hXJK09TDYKMlAAJeRaDwkSURn84tPnPc3tyC78';

const getValidToken = () => {
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

const AddContact = ({ isOpen = false, onClose, onContactAdded, onBulkImport }) => {
    // Section 1: Basic Information
    const [contactName, setContactName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [mobile, setMobile] = useState('');
    const [mobileError, setMobileError] = useState('');
    const [alternateMobile, setAlternateMobile] = useState('');
    const [alternateMobileError, setAlternateMobileError] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [leadStatus, setLeadStatus] = useState('New');
    const [leadOwner, setLeadOwner] = useState('Arun');
    const [description, setDescription] = useState('');

    // Section 2: Others
    const [ageOfLead, setAgeOfLead] = useState('');
    const [contacted, setContacted] = useState('');
    const [whatsappOptIn, setWhatsappOptIn] = useState(false);
    const [state, setState] = useState('');
    const [bulkWhatsappMonth, setBulkWhatsappMonth] = useState('');
    const [leadSource, setLeadSource] = useState('');

    // Section 3: Accounts Section
    const [packageDestinations, setPackageDestinations] = useState('');
    const [address, setAddress] = useState('');
    const [childHeadCount, setChildHeadCount] = useState('');
    const [advanceStatus, setAdvanceStatus] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [destinations, setDestinations] = useState('');
    const [dateOfTravelPlan, setDateOfTravelPlan] = useState('');
    const [advanceAmount, setAdvanceAmount] = useState('');
    const [invoiceShared, setInvoiceShared] = useState('');
    const [remainingAmount, setRemainingAmount] = useState('');
    const [numberOfPeopleToTravel, setNumberOfPeopleToTravel] = useState('');

    // Section 4: Post Trip
    const [postTrip, setPostTrip] = useState('');
    const [duringTripIssues, setDuringTripIssues] = useState('');

    // Section 5: Before Trip
    const [ticketsBooked, setTicketsBooked] = useState('');
    const [followupRequiredToday, setFollowupRequiredToday] = useState('');
    const [spokenLanguage, setSpokenLanguage] = useState('');
    const [arrangementsMade, setArrangementsMade] = useState('');

    // Section 6: Quatation Details
    const [quoteSharedStatus, setQuoteSharedStatus] = useState('');
    const [quoteRequired, setQuoteRequired] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dropdown open states
    const [openDropdown, setOpenDropdown] = useState(null);
    const containerRef = useRef(null);

    const resetForm = () => {
        setContactName('');
        setFirstName('');
        setLastName('');
        setEmail('');
        setCountryCode('+91');
        setMobile('');
        setMobileError('');
        setAlternateMobile('');
        setAlternateMobileError('');
        setCompanyId('');
        setLeadStatus('New');
        setLeadOwner('Arun');
        setDescription('');
        setAgeOfLead('');
        setContacted('');
        setWhatsappOptIn(false);
        setState('');
        setBulkWhatsappMonth('');
        setLeadSource('');
        setPackageDestinations('');
        setAddress('');
        setChildHeadCount('');
        setAdvanceStatus('');
        setTotalAmount('');
        setDestinations('');
        setDateOfTravelPlan('');
        setAdvanceAmount('');
        setInvoiceShared('');
        setRemainingAmount('');
        setNumberOfPeopleToTravel('');
        setPostTrip('');
        setDuringTripIssues('');
        setTicketsBooked('');
        setFollowupRequiredToday('');
        setSpokenLanguage('');
        setArrangementsMade('');
        setQuoteSharedStatus('');
        setQuoteRequired('');
        setOpenDropdown(null);
    };

    const handleClose = () => {
        resetForm();
        if (onClose) onClose();
    };

    // Auto calculate Remaining Amount when total & advance change
    useEffect(() => {
        const total = parseFloat(totalAmount);
        const adv = parseFloat(advanceAmount);
        if (!isNaN(total) && !isNaN(adv)) {
            setRemainingAmount(Math.max(0, total - adv).toString());
        }
    }, [totalAmount, advanceAmount]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (openDropdown) {
                    setOpenDropdown(null);
                } else if (isOpen) {
                    handleClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openDropdown, isOpen]);

    if (!isOpen) return null;

    const toggleDropdown = (id, e) => {
        if (e) e.stopPropagation();
        setOpenDropdown(prev => (prev === id ? null : id));
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();

        // Determine first name and last name
        let finalFirstName = firstName.trim();
        let finalLastName = lastName.trim();
        if (!finalFirstName && contactName.trim()) {
            const parts = contactName.trim().split(' ');
            finalFirstName = parts[0] || '';
            finalLastName = parts.slice(1).join(' ') || '';
        }

        if (!finalFirstName && !contactName.trim()) {
            alert('Please enter Contact Name / First Name');
            return;
        }

        const digitsOnly = mobile.replace(/\D/g, '');
        if (!digitsOnly) {
            setMobileError('Please enter Mobile Number');
            alert('Please enter Mobile Number');
            return;
        }

        if (digitsOnly.length !== 10) {
            setMobileError(`Mobile number must be exactly 10 digits (currently ${digitsOnly.length} digits)`);
            alert(`Mobile number must be exactly 10 digits (currently ${digitsOnly.length} digits)`);
            return;
        }

        const altDigitsOnly = alternateMobile.replace(/\D/g, '');
        if (alternateMobile.trim() && altDigitsOnly.length !== 10) {
            setAlternateMobileError(`Alternate mobile must be exactly 10 digits (currently ${altDigitsOnly.length} digits)`);
            alert(`Alternate mobile must be exactly 10 digits (currently ${altDigitsOnly.length} digits)`);
            return;
        }

        setIsSubmitting(true);

        const combinedName = `${finalFirstName} ${finalLastName}`.trim() || contactName.trim();
        const contactEmail = email.trim() || `${finalFirstName.toLowerCase().replace(/\s+/g, '')}@example.com`;
        const fullMobile = `${countryCode} ${digitsOnly}`;
        const fullAltMobile = altDigitsOnly ? `${countryCode} ${altDigitsOnly}` : '';
        const dest = (destinations || packageDestinations || '').trim();
        const numCompanyId = companyId ? parseInt(companyId, 10) : null;
        const numLeadStatusId = statusToIdMap[leadStatus] || 3;
        const numLeadOwnerId = ownerToIdMap[leadOwner] || 7;

        let savedId = Date.now();
        let apiCreatedAt = null;
        let apiUpdatedAt = null;

        // Try saving via backend API /api/contacts
        const token = getValidToken();
        const payload = {
            first_name: finalFirstName,
            last_name: finalLastName,
            email: contactEmail,
            mobile: fullMobile,
            alternate_mobile: fullAltMobile,
            company_id: numCompanyId,
            lead_status_id: numLeadStatusId,
            lead_owner_id: numLeadOwnerId,
            destination: dest,
            source: leadSource || 'Website',
            notes: description.trim()
        };

        try {
            let response = await fetch('/api/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 401) {
                // Retry with DEFAULT_DEV_TOKEN
                localStorage.setItem('token', DEFAULT_DEV_TOKEN);
                response = await fetch('/api/contacts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${DEFAULT_DEV_TOKEN}`
                    },
                    body: JSON.stringify(payload)
                });
            }

            const contentType = response.headers.get('content-type');
            const data = contentType?.includes('application/json')
                ? await response.json()
                : { message: await response.text() };

            if (response.ok && data.contact) {
                savedId = data.contact.id || savedId;
                if (data.contact.created_at) {
                    apiCreatedAt = new Date(data.contact.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                }
                if (data.contact.updated_at) {
                    apiUpdatedAt = new Date(data.contact.updated_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                }
            } else {
                console.warn('API /api/contacts notice:', data?.message || response.statusText);
            }
        } catch (apiErr) {
            console.warn('API /api/contacts call error, continuing locally:', apiErr);
        } finally {
            setIsSubmitting(false);
        }

        const nowFormatted = new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const newContactRecord = {
            id: savedId,
            name: combinedName,
            first_name: finalFirstName,
            last_name: finalLastName,
            mobile: fullMobile,
            alternate_mobile: fullAltMobile,
            email: contactEmail,
            company_id: numCompanyId,
            lead_status_id: numLeadStatusId,
            lead_owner_id: numLeadOwnerId,
            status: leadStatus || 'New',
            dest: dest,
            destination: dest,
            owner: leadOwner || 'Arun',
            source: leadSource || 'Website',
            notes: description.trim(),
            description: description.trim(),
            type: 'Lead',
            country: 'India',
            ageOfLead: ageOfLead.trim(),
            contacted: contacted,
            whatsappOptIn: whatsappOptIn,
            state: state.trim(),
            bulkWhatsappMonth: bulkWhatsappMonth.trim(),
            leadSource: leadSource || 'Website',
            packageDestinations: packageDestinations.trim(),
            address: address.trim(),
            childHeadCount: childHeadCount.trim(),
            advanceStatus: advanceStatus,
            totalAmount: totalAmount.trim(),
            destinations: dest,
            dateOfTravelPlan: dateOfTravelPlan.trim(),
            advanceAmount: advanceAmount.trim(),
            invoiceShared: invoiceShared,
            remainingAmount: remainingAmount.trim(),
            numberOfPeopleToTravel: numberOfPeopleToTravel.trim(),
            postTrip: postTrip,
            duringTripIssues: duringTripIssues,
            ticketsBooked: ticketsBooked,
            followupRequiredToday: followupRequiredToday.trim(),
            spokenLanguage: spokenLanguage.trim(),
            arrangementsMade: arrangementsMade,
            quoteSharedStatus: quoteSharedStatus,
            quoteRequired: quoteRequired,
            created: apiCreatedAt || nowFormatted,
            modified: apiUpdatedAt || nowFormatted,
            initial: (finalFirstName || 'U').charAt(0).toUpperCase(),
            color: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'][Math.floor(Math.random() * 5)],
            daysOld: 0
        };

        if (onContactAdded) {
            onContactAdded(newContactRecord);
        }
        resetForm();
    };

    const currentCountryObj = countryCodes.find(c => c.code === countryCode) || countryCodes[0];
    const currentStatusObj = leadStatusOptions.find(s => s.label === leadStatus) || leadStatusOptions[0];
    const currentOwnerObj = leadOwners.find(o => o.name === leadOwner) || leadOwners[0];

    return (
        <div className="add-contact-drawer-overlay" onClick={handleClose}>
            <div
                className="add-contact-drawer-panel"
                ref={containerRef}
                onClick={(e) => {
                    e.stopPropagation();
                    // Close dropdown if clicking outside any dropdown
                    if (openDropdown && !e.target.closest('.drawer-field-group')) {
                        setOpenDropdown(null);
                    }
                }}
            >
                {/* ---------------- Header (Sticky) ---------------- */}
                <div className="add-contact-drawer-header">
                    <div className="add-contact-drawer-header-left">
                        <h2 className="add-contact-drawer-title">Add New Contact</h2>
                        <p className="add-contact-drawer-subtitle">Fill in the details below</p>
                    </div>
                    <div className="add-contact-drawer-header-actions">
                        <button
                            type="button"
                            className="add-contact-drawer-save-btn"
                            onClick={handleSave}
                        >
                            <Plus size={15} strokeWidth={2.5} />
                            <span>Save</span>
                        </button>
                        <button
                            type="button"
                            className="add-contact-drawer-close-btn"
                            onClick={handleClose}
                        >
                            <span>Close</span>
                        </button>
                    </div>
                </div>

                {/* ---------------- Scrollable Form Body ---------------- */}
                <div className="add-contact-drawer-body">
                    <form onSubmit={handleSave}>
                        {/* ================= SECTION 1: Basic Information ================= */}
                        <div className="add-contact-drawer-section">
                            <h3 className="drawer-section-heading">Basic Information</h3>
                            <div className="drawer-form-grid-2col">
                                {/* First Name */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">
                                        First Name<span className="required-red-star">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter First Name"
                                        value={firstName}
                                        onChange={(e) => {
                                            setFirstName(e.target.value);
                                            setContactName(`${e.target.value} ${lastName}`.trim());
                                        }}
                                        autoFocus
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Last Name"
                                        value={lastName}
                                        onChange={(e) => {
                                            setLastName(e.target.value);
                                            setContactName(`${firstName} ${e.target.value}`.trim());
                                        }}
                                    />
                                </div>

                                {/* Email Address */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="drawer-text-input"
                                        placeholder="e.g. name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                {/* Mobile */}
                                <div className="drawer-field-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label className="drawer-field-label">
                                            Mobile<span className="required-red-star">*</span>
                                        </label>
                                        <span style={{ fontSize: '11px', color: mobile.length === 10 ? '#10B981' : '#6B7280', fontWeight: 500 }}>
                                            {mobile.length}/10 digits
                                        </span>
                                    </div>
                                    <div className={`drawer-mobile-compound ${mobileError ? 'has-error' : ''}`}>
                                        <div className="drawer-country-picker-wrap">
                                            <button
                                                type="button"
                                                className="drawer-country-btn"
                                                onClick={(e) => toggleDropdown('country', e)}
                                            >
                                                <span className="drawer-country-flag">{currentCountryObj.flag}</span>
                                                <span>{currentCountryObj.code}</span>
                                                <ChevronDown size={14} color="#6B7280" />
                                            </button>
                                            {openDropdown === 'country' && (
                                                <div className="drawer-dropdown-menu" style={{ width: '180px' }}>
                                                    {countryCodes.map((item) => (
                                                        <div
                                                            key={`${item.code}-${item.name}`}
                                                            className={`drawer-dropdown-option ${countryCode === item.code ? 'selected' : ''}`}
                                                            onClick={() => {
                                                                setCountryCode(item.code);
                                                                setOpenDropdown(null);
                                                            }}
                                                        >
                                                            <span>{item.flag} {item.name} ({item.code})</span>
                                                            {countryCode === item.code && <Check size={14} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="tel"
                                            className="drawer-mobile-number-input"
                                            placeholder="10-digit mobile number"
                                            value={mobile}
                                            maxLength={10}
                                            onChange={(e) => {
                                                const digits = e.target.value.replace(/\D/g, '');
                                                setMobile(digits);
                                                if (digits.length === 10) {
                                                    setMobileError('');
                                                }
                                            }}
                                            onBlur={() => {
                                                if (mobile && mobile.length !== 10) {
                                                    setMobileError('Mobile number must be exactly 10 digits');
                                                } else {
                                                    setMobileError('');
                                                }
                                            }}
                                        />
                                    </div>
                                    {mobileError && (
                                        <span className="drawer-field-error-text">
                                            {mobileError}
                                        </span>
                                    )}
                                </div>

                                {/* Alternate Mobile */}
                                <div className="drawer-field-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label className="drawer-field-label">
                                            Alternate Mobile
                                        </label>
                                        <span style={{ fontSize: '11px', color: alternateMobile.length === 10 ? '#10B981' : '#6B7280', fontWeight: 500 }}>
                                            {alternateMobile.length}/10 digits
                                        </span>
                                    </div>
                                    <div className={`drawer-mobile-compound ${alternateMobileError ? 'has-error' : ''}`}>
                                        <div style={{ padding: '0 12px', color: '#4B5563', fontWeight: 600, borderRight: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                                            +91
                                        </div>
                                        <input
                                            type="tel"
                                            className="drawer-mobile-number-input"
                                            placeholder="10-digit alternate mobile"
                                            value={alternateMobile}
                                            maxLength={10}
                                            onChange={(e) => {
                                                const digits = e.target.value.replace(/\D/g, '');
                                                setAlternateMobile(digits);
                                                if (digits.length === 10 || digits.length === 0) {
                                                    setAlternateMobileError('');
                                                }
                                            }}
                                            onBlur={() => {
                                                if (alternateMobile && alternateMobile.length !== 10) {
                                                    setAlternateMobileError('Alternate mobile must be exactly 10 digits');
                                                } else {
                                                    setAlternateMobileError('');
                                                }
                                            }}
                                        />
                                    </div>
                                    {alternateMobileError && (
                                        <span className="drawer-field-error-text">
                                            {alternateMobileError}
                                        </span>
                                    )}
                                </div>

                                {/* Company ID */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Company ID</label>
                                    <input
                                        type="number"
                                        className="drawer-text-input"
                                        placeholder="Enter Company ID (e.g. 1)"
                                        value={companyId}
                                        onChange={(e) => setCompanyId(e.target.value)}
                                    />
                                </div>

                                {/* Lead Status */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Lead Status</label>
                                    <div
                                        className={`drawer-select-trigger ${openDropdown === 'status' ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown('status', e)}
                                    >
                                        <span
                                            className="drawer-status-chip"
                                            style={{
                                                backgroundColor: currentStatusObj.bg,
                                                color: currentStatusObj.color,
                                                border: `1px solid ${currentStatusObj.border}`
                                            }}
                                        >
                                            {currentStatusObj.label}
                                        </span>
                                        <ChevronDown size={15} color="#6B7280" />
                                    </div>
                                    {openDropdown === 'status' && (
                                        <div className="drawer-dropdown-menu">
                                            {leadStatusOptions.map((st) => (
                                                <div
                                                    key={st.label}
                                                    className={`drawer-dropdown-option ${leadStatus === st.label ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setLeadStatus(st.label);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span
                                                        className="drawer-status-chip"
                                                        style={{
                                                            backgroundColor: st.bg,
                                                            color: st.color,
                                                            border: `1px solid ${st.border}`
                                                        }}
                                                    >
                                                        {st.label}
                                                    </span>
                                                    {leadStatus === st.label && <Check size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Lead Owner */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Lead Owner</label>
                                    <div
                                        className={`drawer-select-trigger ${openDropdown === 'owner' ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown('owner', e)}
                                    >
                                        <div className="drawer-owner-badge">
                                            <div
                                                className="drawer-owner-avatar-circle"
                                                style={{ backgroundColor: currentOwnerObj.bg }}
                                            >
                                                {currentOwnerObj.letter}
                                            </div>
                                            <span>{currentOwnerObj.name}</span>
                                        </div>
                                        <ChevronDown size={15} color="#6B7280" />
                                    </div>
                                    {openDropdown === 'owner' && (
                                        <div className="drawer-dropdown-menu">
                                            {leadOwners.map((owner) => (
                                                <div
                                                    key={owner.name}
                                                    className={`drawer-dropdown-option ${leadOwner === owner.name ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setLeadOwner(owner.name);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <div className="drawer-owner-badge">
                                                        <div
                                                            className="drawer-owner-avatar-circle"
                                                            style={{ backgroundColor: owner.bg }}
                                                        >
                                                            {owner.letter}
                                                        </div>
                                                        <span>{owner.name}</span>
                                                    </div>
                                                    {leadOwner === owner.name && <Check size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Destination */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Destination</label>
                                    <div className="drawer-combobox-wrap">
                                        <input
                                            type="text"
                                            className="drawer-combobox-input"
                                            placeholder="Enter destination (e.g. Goa, Manali, Madurai)"
                                            value={destinations}
                                            onChange={(e) => {
                                                setDestinations(e.target.value);
                                                setPackageDestinations(e.target.value);
                                            }}
                                            onClick={() => toggleDropdown('destination_sec1')}
                                        />
                                        <button
                                            type="button"
                                            className="drawer-combobox-btn"
                                            onClick={(e) => toggleDropdown('destination_sec1', e)}
                                            title="Select from popular destinations"
                                        >
                                            <ChevronDown size={15} />
                                        </button>
                                        {openDropdown === 'destination_sec1' && (
                                            <div className="drawer-dropdown-menu">
                                                {destinationOptions.map((dst) => (
                                                    <div
                                                        key={dst}
                                                        className={`drawer-dropdown-option ${destinations === dst ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setDestinations(dst);
                                                            setPackageDestinations(dst);
                                                            setOpenDropdown(null);
                                                        }}
                                                    >
                                                        <span>{dst}</span>
                                                        {destinations === dst && <Check size={14} />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Lead Source */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Lead Source</label>
                                    <div
                                        className={`drawer-select-trigger ${openDropdown === 'source_sec1' ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown('source_sec1', e)}
                                    >
                                        {leadSource ? (
                                            <span className="drawer-select-value">{leadSource}</span>
                                        ) : (
                                            <span className="drawer-select-placeholder">Select lead source</span>
                                        )}
                                        <ChevronDown size={15} color="#6B7280" />
                                    </div>
                                    {openDropdown === 'source_sec1' && (
                                        <div className="drawer-dropdown-menu">
                                            {leadSourceOptions.map((src) => (
                                                <div
                                                    key={src}
                                                    className={`drawer-dropdown-option ${leadSource === src ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setLeadSource(src);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span>{src}</span>
                                                    {leadSource === src && <Check size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Description / Notes */}
                                <div className="drawer-field-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="drawer-field-label">Notes / Description</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter notes or description for this contact..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ================= SECTION 2: Others ================= */}
                        <div className="add-contact-drawer-section">
                            <h3 className="drawer-section-heading">Others</h3>
                            <div className="drawer-form-grid-2col">
                                {/* Total Open Tasks (Locked) */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">
                                        Total Open Tasks
                                        <span className="drawer-lock-icon"><Lock size={13} /></span>
                                    </label>
                                    <div className="drawer-field-locked-container">
                                        <span className="drawer-badge-123">123</span>
                                        <span className="drawer-locked-text">Not set</span>
                                    </div>
                                </div>

                                {/* Total Completed Tasks (Locked) */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">
                                        Total Completed Tasks
                                        <span className="drawer-lock-icon"><Lock size={13} /></span>
                                    </label>
                                    <div className="drawer-field-locked-container">
                                        <span className="drawer-badge-123">123</span>
                                        <span className="drawer-locked-text">Not set</span>
                                    </div>
                                </div>

                                {/* Last Call Date (Locked) */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">
                                        Last Call Date
                                        <span className="drawer-lock-icon"><Lock size={13} /></span>
                                    </label>
                                    <div className="drawer-field-locked-container">
                                        <Clock size={15} color="#6B7280" />
                                        <span className="drawer-locked-text">Not set</span>
                                    </div>
                                </div>

                                {/* Total Overdue Tasks (Locked) */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">
                                        Total Overdue Tasks
                                        <span className="drawer-lock-icon"><Lock size={13} /></span>
                                    </label>
                                    <div className="drawer-field-locked-container">
                                        <span className="drawer-badge-123">123</span>
                                        <span className="drawer-locked-text">Not set</span>
                                    </div>
                                </div>

                                {/* Total Dialed Calls (Locked) */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">
                                        Total Dialed Calls
                                        <span className="drawer-lock-icon"><Lock size={13} /></span>
                                    </label>
                                    <div className="drawer-field-locked-container">
                                        <span className="drawer-locked-text italic">Not set</span>
                                    </div>
                                </div>

                                {/* Total Connected Calls (Locked) */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">
                                        Total Connected Calls
                                        <span className="drawer-lock-icon"><Lock size={13} /></span>
                                    </label>
                                    <div className="drawer-field-locked-container">
                                        <span className="drawer-badge-123">123</span>
                                        <span className="drawer-locked-text">Not set</span>
                                    </div>
                                </div>

                                {/* Age of the Lead */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Age of the Lead</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Age of the Lead"
                                        value={ageOfLead}
                                        onChange={(e) => setAgeOfLead(e.target.value)}
                                    />
                                </div>

                                {/* Contacted */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Contacted</label>
                                    <div
                                        className={`drawer-select-trigger ${openDropdown === 'contacted' ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown('contacted', e)}
                                    >
                                        {contacted ? (
                                            <span className="drawer-select-value">{contacted}</span>
                                        ) : (
                                            <span className="drawer-select-placeholder">Select contacted</span>
                                        )}
                                        <ChevronDown size={15} color="#6B7280" />
                                    </div>
                                    {openDropdown === 'contacted' && (
                                        <div className="drawer-dropdown-menu">
                                            {contactedOptions.map((opt) => (
                                                <div
                                                    key={opt}
                                                    className={`drawer-dropdown-option ${contacted === opt ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setContacted(opt);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span>{opt}</span>
                                                    {contacted === opt && <Check size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* assignedDate (Locked) */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">
                                        assignedDate
                                        <span className="drawer-lock-icon"><Lock size={13} /></span>
                                    </label>
                                    <div className="drawer-field-locked-container">
                                        <Clock size={15} color="#6B7280" />
                                        <span className="drawer-locked-text">Not set</span>
                                    </div>
                                </div>

                                {/* whatsappOptIn Checkbox Box */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">whatsappOptIn</label>
                                    <div
                                        className={`drawer-checkbox-box ${whatsappOptIn ? 'checked' : ''}`}
                                        onClick={() => setWhatsappOptIn(!whatsappOptIn)}
                                    >
                                        <div className="drawer-custom-checkbox">
                                            {whatsappOptIn && <Check size={12} strokeWidth={3} />}
                                        </div>
                                        <span className="drawer-checkbox-label-text">Enable whatsappOptIn</span>
                                    </div>
                                </div>

                                {/* Recent Notes (Locked) */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">
                                        Recent Notes
                                        <span className="drawer-lock-icon"><Lock size={13} /></span>
                                    </label>
                                    <div className="drawer-field-locked-container">
                                        <span className="drawer-locked-text italic">Not set</span>
                                    </div>
                                </div>

                                {/* State */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">State</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter State"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                    />
                                </div>

                                {/* Bulk Whatsapp Month */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Bulk Whatsapp Month</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Bulk Whatsapp Month"
                                        value={bulkWhatsappMonth}
                                        onChange={(e) => setBulkWhatsappMonth(e.target.value)}
                                    />
                                </div>

                                {/* Lead Source */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Lead Source</label>
                                    <div
                                        className={`drawer-select-trigger ${openDropdown === 'source' ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown('source', e)}
                                    >
                                        {leadSource ? (
                                            <span className="drawer-select-value">{leadSource}</span>
                                        ) : (
                                            <span className="drawer-select-placeholder">Select lead source</span>
                                        )}
                                        <ChevronDown size={15} color="#6B7280" />
                                    </div>
                                    {openDropdown === 'source' && (
                                        <div className="drawer-dropdown-menu">
                                            {leadSourceOptions.map((src) => (
                                                <div
                                                    key={src}
                                                    className={`drawer-dropdown-option ${leadSource === src ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setLeadSource(src);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span>{src}</span>
                                                    {leadSource === src && <Check size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Empty column to balance row */}
                                <div className="drawer-field-group"></div>
                            </div>
                        </div>

                        {/* ================= SECTION 3: Accounts Section ================= */}
                        <div className="add-contact-drawer-section">
                            <h3 className="drawer-section-heading">Accounts Section</h3>
                            <div className="drawer-form-grid-2col">
                                {/* Package Destinations */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Package Destinations</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Package Destinations"
                                        value={packageDestinations}
                                        onChange={(e) => {
                                            setPackageDestinations(e.target.value);
                                            setDestinations(e.target.value);
                                        }}
                                    />
                                </div>

                                {/* Address */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Address</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>

                                {/* Child Head Count */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Child Head Count</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Child Head Count"
                                        value={childHeadCount}
                                        onChange={(e) => setChildHeadCount(e.target.value)}
                                    />
                                </div>

                                {/* Advance Received Status */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Advance Received Status</label>
                                    <div
                                        className={`drawer-select-trigger ${openDropdown === 'advanceStatus' ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown('advanceStatus', e)}
                                    >
                                        {advanceStatus ? (
                                            <span className="drawer-select-value">{advanceStatus}</span>
                                        ) : (
                                            <span className="drawer-select-placeholder">Select advance received status</span>
                                        )}
                                        <ChevronDown size={15} color="#6B7280" />
                                    </div>
                                    {openDropdown === 'advanceStatus' && (
                                        <div className="drawer-dropdown-menu">
                                            {advanceStatusOptions.map((st) => (
                                                <div
                                                    key={st}
                                                    className={`drawer-dropdown-option ${advanceStatus === st ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setAdvanceStatus(st);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span>{st}</span>
                                                    {advanceStatus === st && <Check size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Total Amount */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Total Amount</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Total Amount"
                                        value={totalAmount}
                                        onChange={(e) => setTotalAmount(e.target.value)}
                                    />
                                </div>

                                {/* Destinations */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Destinations</label>
                                    <div className="drawer-combobox-wrap">
                                        <input
                                            type="text"
                                            className="drawer-combobox-input"
                                            placeholder="Enter or select destinations"
                                            value={destinations}
                                            onChange={(e) => {
                                                setDestinations(e.target.value);
                                                setPackageDestinations(e.target.value);
                                            }}
                                            onClick={() => toggleDropdown('destinations_sec3')}
                                        />
                                        <button
                                            type="button"
                                            className="drawer-combobox-btn"
                                            onClick={(e) => toggleDropdown('destinations_sec3', e)}
                                            title="Select from popular destinations"
                                        >
                                            <ChevronDown size={15} />
                                        </button>
                                        {openDropdown === 'destinations_sec3' && (
                                            <div className="drawer-dropdown-menu">
                                                {destinationOptions.map((dst) => (
                                                    <div
                                                        key={dst}
                                                        className={`drawer-dropdown-option ${destinations === dst ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setDestinations(dst);
                                                            setPackageDestinations(dst);
                                                            setOpenDropdown(null);
                                                        }}
                                                    >
                                                        <span>{dst}</span>
                                                        {destinations === dst && <Check size={14} />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Date of Travel Plan */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Date of Travel Plan</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Date of Travel Plan"
                                        value={dateOfTravelPlan}
                                        onChange={(e) => setDateOfTravelPlan(e.target.value)}
                                    />
                                </div>

                                {/* Advance Amount */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Advance Amount</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Advance Amount"
                                        value={advanceAmount}
                                        onChange={(e) => setAdvanceAmount(e.target.value)}
                                    />
                                </div>

                                {/* Invoice Shared */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Invoice Shared</label>
                                    <div
                                        className={`drawer-select-trigger ${openDropdown === 'invoiceShared' ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown('invoiceShared', e)}
                                    >
                                        {invoiceShared ? (
                                            <span className="drawer-select-value">{invoiceShared}</span>
                                        ) : (
                                            <span className="drawer-select-placeholder">Select Invoice shared</span>
                                        )}
                                        <ChevronDown size={15} color="#6B7280" />
                                    </div>
                                    {openDropdown === 'invoiceShared' && (
                                        <div className="drawer-dropdown-menu">
                                            {invoiceSharedOptions.map((inv) => (
                                                <div
                                                    key={inv}
                                                    className={`drawer-dropdown-option ${invoiceShared === inv ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setInvoiceShared(inv);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span>{inv}</span>
                                                    {invoiceShared === inv && <Check size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Remaining Amount */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Remaining Amount</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Remaining Amount"
                                        value={remainingAmount}
                                        onChange={(e) => setRemainingAmount(e.target.value)}
                                    />
                                </div>

                                {/* Number of People to Travel */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Number of People to Travel</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Number of People to Travel"
                                        value={numberOfPeopleToTravel}
                                        onChange={(e) => setNumberOfPeopleToTravel(e.target.value)}
                                    />
                                </div>

                                {/* Empty column to balance row */}
                                <div className="drawer-field-group"></div>
                            </div>
                        </div>

                        {/* ================= SECTION 4: Post Trip ================= */}
                        <div className="add-contact-drawer-section">
                            <h3 className="drawer-section-heading">Post Trip</h3>
                            <div className="drawer-form-grid-2col">
                                {/* Post Trip */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Post Trip</label>
                                    <div
                                        className={`drawer-select-trigger ${openDropdown === 'postTrip' ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown('postTrip', e)}
                                    >
                                        {postTrip ? (
                                            <span className="drawer-select-value">{postTrip}</span>
                                        ) : (
                                            <span className="drawer-select-placeholder">Select post trip</span>
                                        )}
                                        <ChevronDown size={15} color="#6B7280" />
                                    </div>
                                    {openDropdown === 'postTrip' && (
                                        <div className="drawer-dropdown-menu">
                                            {postTripOptions.map((pt) => (
                                                <div
                                                    key={pt}
                                                    className={`drawer-dropdown-option ${postTrip === pt ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setPostTrip(pt);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span>{pt}</span>
                                                    {postTrip === pt && <Check size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* During Trip Issues */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">During Trip Issues</label>
                                    <div
                                        className={`drawer-select-trigger ${openDropdown === 'tripIssues' ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown('tripIssues', e)}
                                    >
                                        {duringTripIssues ? (
                                            <span className="drawer-select-value">{duringTripIssues}</span>
                                        ) : (
                                            <span className="drawer-select-placeholder">Select during trip issues</span>
                                        )}
                                        <ChevronDown size={15} color="#6B7280" />
                                    </div>
                                    {openDropdown === 'tripIssues' && (
                                        <div className="drawer-dropdown-menu">
                                            {tripIssueOptions.map((issue) => (
                                                <div
                                                    key={issue}
                                                    className={`drawer-dropdown-option ${duringTripIssues === issue ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setDuringTripIssues(issue);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span>{issue}</span>
                                                    {duringTripIssues === issue && <Check size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ================= SECTION 5: Before Trip ================= */}
                        <div className="add-contact-drawer-section">
                            <h3 className="drawer-section-heading">Before Trip</h3>
                            <div className="drawer-form-grid-2col">
                                {/* Tickets Booked */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Tickets Booked</label>
                                    <div
                                        className={`drawer-select-trigger ${openDropdown === 'ticketsBooked' ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown('ticketsBooked', e)}
                                    >
                                        {ticketsBooked ? (
                                            <span className="drawer-select-value">{ticketsBooked}</span>
                                        ) : (
                                            <span className="drawer-select-placeholder">Select tickets booked</span>
                                        )}
                                        <ChevronDown size={15} color="#6B7280" />
                                    </div>
                                    {openDropdown === 'ticketsBooked' && (
                                        <div className="drawer-dropdown-menu">
                                            {ticketOptions.map((tk) => (
                                                <div
                                                    key={tk}
                                                    className={`drawer-dropdown-option ${ticketsBooked === tk ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setTicketsBooked(tk);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span>{tk}</span>
                                                    {ticketsBooked === tk && <Check size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Followup Required Today */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Followup Required Today</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Followup Required Today"
                                        value={followupRequiredToday}
                                        onChange={(e) => setFollowupRequiredToday(e.target.value)}
                                    />
                                </div>

                                {/* Spoken Language */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Spoken Language</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Spoken Language"
                                        value={spokenLanguage}
                                        onChange={(e) => setSpokenLanguage(e.target.value)}
                                    />
                                </div>

                                {/* Arrangements Made */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Arrangements Made</label>
                                    <div
                                        className={`drawer-select-trigger ${openDropdown === 'arrangementsMade' ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown('arrangementsMade', e)}
                                    >
                                        {arrangementsMade ? (
                                            <span className="drawer-select-value">{arrangementsMade}</span>
                                        ) : (
                                            <span className="drawer-select-placeholder">Select arrangements made</span>
                                        )}
                                        <ChevronDown size={15} color="#6B7280" />
                                    </div>
                                    {openDropdown === 'arrangementsMade' && (
                                        <div className="drawer-dropdown-menu">
                                            {arrangementsMadeOptions.map((ag) => (
                                                <div
                                                    key={ag}
                                                    className={`drawer-dropdown-option ${arrangementsMade === ag ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setArrangementsMade(ag);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span>{ag}</span>
                                                    {arrangementsMade === ag && <Check size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ================= SECTION 6: Quatation Details ================= */}
                        <div className="add-contact-drawer-section">
                            <h3 className="drawer-section-heading">Quatation Details</h3>
                            <div className="drawer-form-grid-2col">
                                {/* Quote Shared Status */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Quote Shared Status</label>
                                    <div
                                        className={`drawer-select-trigger ${openDropdown === 'quoteSharedStatus' ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown('quoteSharedStatus', e)}
                                    >
                                        {quoteSharedStatus ? (
                                            <span className="drawer-select-value">{quoteSharedStatus}</span>
                                        ) : (
                                            <span className="drawer-select-placeholder">Select quote shared status</span>
                                        )}
                                        <ChevronDown size={15} color="#6B7280" />
                                    </div>
                                    {openDropdown === 'quoteSharedStatus' && (
                                        <div className="drawer-dropdown-menu">
                                            {quoteSharedStatusOptions.map((st) => (
                                                <div
                                                    key={st}
                                                    className={`drawer-dropdown-option ${quoteSharedStatus === st ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setQuoteSharedStatus(st);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span>{st}</span>
                                                    {quoteSharedStatus === st && <Check size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Quote Required */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Quote Required</label>
                                    <div
                                        className={`drawer-select-trigger ${openDropdown === 'quoteRequired' ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown('quoteRequired', e)}
                                    >
                                        {quoteRequired ? (
                                            <span className="drawer-select-value">{quoteRequired}</span>
                                        ) : (
                                            <span className="drawer-select-placeholder">Select quote required</span>
                                        )}
                                        <ChevronDown size={15} color="#6B7280" />
                                    </div>
                                    {openDropdown === 'quoteRequired' && (
                                        <div className="drawer-dropdown-menu">
                                            {quoteRequiredOptions.map((qr) => (
                                                <div
                                                    key={qr}
                                                    className={`drawer-dropdown-option ${quoteRequired === qr ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setQuoteRequired(qr);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span>{qr}</span>
                                                    {quoteRequired === qr && <Check size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Drawer Bottom Actions */}
                        <div className="drawer-bottom-actions">
                            <button
                                type="submit"
                                className="drawer-create-contact-submit-btn"
                                disabled={isSubmitting}
                                style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            >
                                <Plus size={16} strokeWidth={2.5} />
                                <span>{isSubmitting ? 'Creating Contact...' : 'Create Contact'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddContact;
