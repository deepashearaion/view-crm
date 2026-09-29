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
const quoteRequiredOptions = ['Yes', 'No', 'Immediate', 'Later', 'Not Required'];

const AddContact = ({ isOpen = false, onClose, onContactAdded, onBulkImport }) => {
    // Section 1: Basic Information
    const [contactName, setContactName] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [mobile, setMobile] = useState('');
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

    // Dropdown open states
    const [openDropdown, setOpenDropdown] = useState(null);
    const containerRef = useRef(null);

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
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openDropdown, isOpen, onClose]);

    if (!isOpen) return null;

    const toggleDropdown = (id, e) => {
        if (e) e.stopPropagation();
        setOpenDropdown(prev => (prev === id ? null : id));
    };

    const handleSave = (e) => {
        if (e) e.preventDefault();

        if (!contactName.trim()) {
            alert('Please enter Contact Name');
            return;
        }

        if (!mobile.trim()) {
            alert('Please enter Mobile Number');
            return;
        }

        const newContactRecord = {
            id: Date.now(),
            name: contactName.trim(),
            mobile: `${countryCode} ${mobile.trim()}`,
            status: leadStatus || 'New',
            dest: destinations || packageDestinations || 'Manali',
            owner: leadOwner || 'Arun',
            type: 'Lead',
            description: description.trim(),
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
            destinations: destinations,
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
            created: new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            modified: new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            initial: contactName.trim().charAt(0).toUpperCase(),
            color: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'][Math.floor(Math.random() * 5)],
            email: `${contactName.trim().toLowerCase().replace(/\s+/g, '')}@example.com`,
            daysOld: 0
        };

        if (onContactAdded) {
            onContactAdded(newContactRecord);
        }
    };

    const currentCountryObj = countryCodes.find(c => c.code === countryCode) || countryCodes[0];
    const currentStatusObj = leadStatusOptions.find(s => s.label === leadStatus) || leadStatusOptions[0];
    const currentOwnerObj = leadOwners.find(o => o.name === leadOwner) || leadOwners[0];

    return (
        <div className="add-contact-drawer-overlay" onClick={onClose}>
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
                            onClick={onClose}
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
                                {/* Contact Name */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">
                                        Contact Name<span className="required-red-star">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Contact Name"
                                        value={contactName}
                                        onChange={(e) => setContactName(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                {/* Mobile */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">
                                        Mobile<span className="required-red-star">*</span>
                                    </label>
                                    <div className="drawer-mobile-compound">
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
                                            placeholder="123 456 7890"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                        />
                                    </div>
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

                                {/* Description */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Description</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                {/* Empty column to preserve 2-col balance */}
                                <div className="drawer-field-group"></div>
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
                                        onChange={(e) => setPackageDestinations(e.target.value)}
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
                                    <div
                                        className={`drawer-select-trigger ${openDropdown === 'destinations' ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown('destinations', e)}
                                    >
                                        {destinations ? (
                                            <span className="drawer-select-value">{destinations}</span>
                                        ) : (
                                            <span className="drawer-select-placeholder">Select destinations</span>
                                        )}
                                        <ChevronDown size={15} color="#6B7280" />
                                    </div>
                                    {openDropdown === 'destinations' && (
                                        <div className="drawer-dropdown-menu">
                                            {destinationOptions.map((dst) => (
                                                <div
                                                    key={dst}
                                                    className={`drawer-dropdown-option ${destinations === dst ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setDestinations(dst);
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
                            >
                                <Plus size={16} strokeWidth={2.5} />
                                <span>Create Contact</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddContact;
