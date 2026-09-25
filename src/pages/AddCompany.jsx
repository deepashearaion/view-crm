import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, Check } from 'lucide-react';
import './AddCompany.css';

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

const leadOwners = [
    { name: 'Arun', letter: 'A', bg: '#059669' },
    { name: 'Priya Sharma', letter: 'P', bg: '#2563EB' },
    { name: 'Rajesh Kumar', letter: 'R', bg: '#7C3AED' },
    { name: 'Self', letter: 'S', bg: '#4B5563' },
];

const leadSourceOptions = [
    'Website',
    'LinkedIn',
    'Cold Call',
    'Referral',
    'Advertisement',
    'Partner',
    'Trade Show',
    'Others'
];

const AddCompany = ({ isOpen = true, onClose, onCompanyAdded, setCurrentPage }) => {
    // Form fields
    const [companyName, setCompanyName] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [mobile, setMobile] = useState('');
    const [leadStatus, setLeadStatus] = useState('New');
    const [mailingCity, setMailingCity] = useState('');
    const [noOfEmployee, setNoOfEmployee] = useState('');
    const [email, setEmail] = useState('');
    const [leadOwner, setLeadOwner] = useState('Arun');
    const [description, setDescription] = useState('');

    const [state, setState] = useState('');
    const [facebook, setFacebook] = useState('');
    const [address1, setAddress1] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [emailOptOut, setEmailOptOut] = useState(false);
    const [linkedin, setLinkedin] = useState('');
    const [twitter, setTwitter] = useState('');
    const [smsOptOut, setSmsOptOut] = useState(false);
    const [instagram, setInstagram] = useState('');
    const [leadSource, setLeadSource] = useState('');

    // Dropdown toggles
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false);
    const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);

    // Toast
    const [toastMessage, setToastMessage] = useState(null);

    const countryRef = useRef(null);
    const statusRef = useRef(null);
    const ownerRef = useRef(null);
    const sourceRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (countryRef.current && !countryRef.current.contains(e.target)) {
                setIsCountryDropdownOpen(false);
            }
            if (statusRef.current && !statusRef.current.contains(e.target)) {
                setIsStatusDropdownOpen(false);
            }
            if (ownerRef.current && !ownerRef.current.contains(e.target)) {
                setIsOwnerDropdownOpen(false);
            }
            if (sourceRef.current && !sourceRef.current.contains(e.target)) {
                setIsSourceDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Escape key closes drawer
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else if (setCurrentPage) {
            setCurrentPage('Companies');
        }
    };

    const handleSave = (e) => {
        if (e) e.preventDefault();

        if (!companyName.trim()) {
            alert('Please enter Company Name');
            return;
        }

        if (!mobile.trim()) {
            alert('Please enter Mobile Number');
            return;
        }

        const newCompanyRecord = {
            id: Date.now(),
            name: companyName.trim(),
            mobile: `${countryCode} ${mobile.trim()}`,
            status: leadStatus || 'New',
            employees: noOfEmployee.trim() || '10-50',
            revenue: '$100k - $500k',
            city: mailingCity.trim() || 'Mumbai',
            email: email.trim() || `${companyName.toLowerCase().replace(/\s+/g, '')}@company.com`,
            created: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            modified: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            owner: leadOwner || 'Arun',
            description: description.trim() || 'Active client account',
            country: 'India',
            state: state.trim() || '',
            facebook: facebook.trim() || '',
            address_1: address1.trim() || '',
            zipcode: zipcode.trim() || '',
            email_opt_out: emailOptOut ? 'Yes' : 'No',
            linkedin: linkedin.trim() || '',
            twitter: twitter.trim() || '',
            sms_opt_out: smsOptOut ? 'Yes' : 'No',
            instagram: instagram.trim() || '',
            lead_source: leadSource || 'Website',
            isNewToday: true
        };

        // Persist to localStorage
        try {
            const saved = localStorage.getItem('dealconverter_companies_data');
            const currentList = saved ? JSON.parse(saved) : [];
            const updated = [newCompanyRecord, ...currentList];
            localStorage.setItem('dealconverter_companies_data', JSON.stringify(updated));
        } catch (err) {
            console.error('Error saving company:', err);
        }

        if (onCompanyAdded) {
            onCompanyAdded(newCompanyRecord);
        }

        showToast(`Company "${newCompanyRecord.name}" added successfully!`);

        setTimeout(() => {
            handleClose();
        }, 500);
    };

    const currentOwner = leadOwners.find(o => o.name === leadOwner) || leadOwners[0];
    const currentStatusObj = leadStatusOptions.find(s => s.label === leadStatus) || leadStatusOptions[0];
    const currentCountryObj = countryCodes.find(c => c.code === countryCode) || countryCodes[0];

    if (!isOpen) return null;

    return (
        <div className="add-company-drawer-overlay" onClick={handleClose}>
            {toastMessage && (
                <div className="contacts-toast" style={{ zIndex: 1100 }}>
                    <Check size={16} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Right Slide-Over Panel matching Screenshots 1, 2, 3 */}
            <div className="add-company-drawer-panel" onClick={(e) => e.stopPropagation()}>
                {/* Fixed Drawer Header matching Screenshot 1 */}
                <div className="add-company-drawer-header">
                    <div className="add-company-drawer-header-left">
                        <h2 className="add-company-drawer-title">Add New Company</h2>
                        <p className="add-company-drawer-subtitle">Fill in the details below</p>
                    </div>
                    <div className="add-company-drawer-header-actions">
                        <button type="button" className="add-company-drawer-save-btn" onClick={handleSave}>
                            <Plus size={15} strokeWidth={2.5} />
                            <span>Save</span>
                        </button>
                        <button type="button" className="add-company-drawer-close-btn" onClick={handleClose}>
                            <span>Close</span>
                        </button>
                    </div>
                </div>

                {/* Scrollable Form Body */}
                <div className="add-company-drawer-body">
                    <form onSubmit={handleSave} className="add-company-drawer-form">
                        {/* Section 1: Basic Information */}
                        <div className="add-company-drawer-section">
                            <h3 className="drawer-section-heading">Basic Information</h3>

                            <div className="drawer-form-grid-2col">
                                {/* Company Name */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">
                                        Company Name<span className="required-red-star">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="drawer-text-input"
                                        placeholder="Enter Company Name"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                {/* Mobile with Indian flag country code */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">
                                        Mobile<span className="required-red-star">*</span>
                                    </label>
                                    <div className="drawer-mobile-compound">
                                        <div className="drawer-country-picker-wrap" ref={countryRef}>
                                            <button
                                                type="button"
                                                className="drawer-country-picker-btn"
                                                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                            >
                                                <span className="drawer-flag-icon">{currentCountryObj.flag}</span>
                                                <span className="drawer-code-text">{currentCountryObj.code}</span>
                                                <ChevronDown size={14} color="#6B7280" />
                                            </button>
                                            {isCountryDropdownOpen && (
                                                <div className="drawer-country-dropdown-menu">
                                                    {countryCodes.map((c) => (
                                                        <div
                                                            key={c.code + c.name}
                                                            className={`drawer-country-option ${countryCode === c.code ? 'selected' : ''}`}
                                                            onClick={() => {
                                                                setCountryCode(c.code);
                                                                setIsCountryDropdownOpen(false);
                                                            }}
                                                        >
                                                            <span className="drawer-flag-icon">{c.flag}</span>
                                                            <span className="drawer-country-name">{c.name}</span>
                                                            <span className="drawer-country-code-pill">{c.code}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="tel"
                                            required
                                            className="drawer-mobile-input"
                                            placeholder="123 456 7890"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Lead Status */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Lead Status</label>
                                    <div className="drawer-custom-dropdown" ref={statusRef}>
                                        <button
                                            type="button"
                                            className="drawer-dropdown-trigger"
                                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                        >
                                            <span
                                                className="drawer-status-chip"
                                                style={{
                                                    color: currentStatusObj.color,
                                                    backgroundColor: currentStatusObj.bg,
                                                    borderColor: currentStatusObj.border,
                                                }}
                                            >
                                                {currentStatusObj.label}
                                            </span>
                                            <ChevronDown size={16} color="#6B7280" />
                                        </button>
                                        {isStatusDropdownOpen && (
                                            <div className="drawer-dropdown-popover">
                                                {leadStatusOptions.map((st) => (
                                                    <div
                                                        key={st.label}
                                                        className={`drawer-dropdown-option ${leadStatus === st.label ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setLeadStatus(st.label);
                                                            setIsStatusDropdownOpen(false);
                                                        }}
                                                    >
                                                        <span
                                                            className="drawer-status-chip"
                                                            style={{
                                                                color: st.color,
                                                                backgroundColor: st.bg,
                                                                borderColor: st.border,
                                                            }}
                                                        >
                                                            {st.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Mailing City */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Mailing City</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Mailing City"
                                        value={mailingCity}
                                        onChange={(e) => setMailingCity(e.target.value)}
                                    />
                                </div>

                                {/* No Of Employee */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">No Of Employee</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter No Of Employee"
                                        value={noOfEmployee}
                                        onChange={(e) => setNoOfEmployee(e.target.value)}
                                    />
                                </div>

                                {/* Email */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Email</label>
                                    <input
                                        type="email"
                                        className="drawer-text-input"
                                        placeholder="Enter Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                {/* Lead Owner */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Lead Owner</label>
                                    <div className="drawer-custom-dropdown" ref={ownerRef}>
                                        <button
                                            type="button"
                                            className="drawer-dropdown-trigger"
                                            onClick={() => setIsOwnerDropdownOpen(!isOwnerDropdownOpen)}
                                        >
                                            <div className="drawer-owner-chip">
                                                <div
                                                    className="drawer-owner-avatar"
                                                    style={{ backgroundColor: currentOwner.bg }}
                                                >
                                                    {currentOwner.letter}
                                                </div>
                                                <span className="drawer-owner-name">{currentOwner.name}</span>
                                            </div>
                                            <ChevronDown size={16} color="#6B7280" />
                                        </button>
                                        {isOwnerDropdownOpen && (
                                            <div className="drawer-dropdown-popover">
                                                {leadOwners.map((own) => (
                                                    <div
                                                        key={own.name}
                                                        className={`drawer-dropdown-option ${leadOwner === own.name ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setLeadOwner(own.name);
                                                            setIsOwnerDropdownOpen(false);
                                                        }}
                                                    >
                                                        <div className="drawer-owner-chip">
                                                            <div
                                                                className="drawer-owner-avatar"
                                                                style={{ backgroundColor: own.bg }}
                                                            >
                                                                {own.letter}
                                                            </div>
                                                            <span className="drawer-owner-name">{own.name}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
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
                            </div>
                        </div>

                        {/* Section 2: Others */}
                        <div className="add-company-drawer-section">
                            <h3 className="drawer-section-heading">Others</h3>

                            <div className="drawer-form-grid-2col">
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

                                {/* Facebook */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Facebook</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Facebook"
                                        value={facebook}
                                        onChange={(e) => setFacebook(e.target.value)}
                                    />
                                </div>

                                {/* Address 1 */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Address 1</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Address 1"
                                        value={address1}
                                        onChange={(e) => setAddress1(e.target.value)}
                                    />
                                </div>

                                {/* ZipCode */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">ZipCode</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter ZipCode"
                                        value={zipcode}
                                        onChange={(e) => setZipcode(e.target.value)}
                                    />
                                </div>

                                {/* Email Opt Out Checkbox Box */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Email Opt Out</label>
                                    <div
                                        className={`drawer-checkbox-box ${emailOptOut ? 'active' : ''}`}
                                        onClick={() => setEmailOptOut(!emailOptOut)}
                                    >
                                        <div className={`drawer-square-check ${emailOptOut ? 'checked' : ''}`}>
                                            {emailOptOut && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                                        </div>
                                        <span className="drawer-checkbox-label">Enable Email Opt Out</span>
                                    </div>
                                </div>

                                {/* LinkedIn */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">LinkedIn</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter LinkedIn"
                                        value={linkedin}
                                        onChange={(e) => setLinkedin(e.target.value)}
                                    />
                                </div>

                                {/* Twitter */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Twitter</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Twitter"
                                        value={twitter}
                                        onChange={(e) => setTwitter(e.target.value)}
                                    />
                                </div>

                                {/* SMS Opt Out Checkbox Box */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">SMS Opt Out</label>
                                    <div
                                        className={`drawer-checkbox-box ${smsOptOut ? 'active' : ''}`}
                                        onClick={() => setSmsOptOut(!smsOptOut)}
                                    >
                                        <div className={`drawer-square-check ${smsOptOut ? 'checked' : ''}`}>
                                            {smsOptOut && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                                        </div>
                                        <span className="drawer-checkbox-label">Enable SMS Opt Out</span>
                                    </div>
                                </div>

                                {/* Instagram */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Instagram</label>
                                    <input
                                        type="text"
                                        className="drawer-text-input"
                                        placeholder="Enter Instagram"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                    />
                                </div>

                                {/* Lead Source */}
                                <div className="drawer-field-group">
                                    <label className="drawer-field-label">Lead Source</label>
                                    <div className="drawer-custom-dropdown" ref={sourceRef}>
                                        <button
                                            type="button"
                                            className="drawer-dropdown-trigger"
                                            onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}
                                        >
                                            <span className={leadSource ? 'drawer-selected-text' : 'drawer-placeholder-text'}>
                                                {leadSource || 'Select lead source'}
                                            </span>
                                            <ChevronDown size={16} color="#6B7280" />
                                        </button>
                                        {isSourceDropdownOpen && (
                                            <div className="drawer-dropdown-popover">
                                                {leadSourceOptions.map((src) => (
                                                    <div
                                                        key={src}
                                                        className={`drawer-dropdown-option ${leadSource === src ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setLeadSource(src);
                                                            setIsSourceDropdownOpen(false);
                                                        }}
                                                    >
                                                        <span>{src}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Centered "+ Create Company" Button matching Screenshot 3 */}
                        <div className="drawer-bottom-action-row">
                            <button type="submit" className="drawer-create-company-btn">
                                <Plus size={17} strokeWidth={2.5} />
                                <span>Create Company</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCompany;
