import React, { useState, useRef } from 'react';
import { ArrowLeft, Check, Download, Info, FileSpreadsheet } from 'lucide-react';
import './BulkImport.css';

// Exact Cloud Upload SVG Icon from Screenshot
const CloudUploadIcon = () => (
    <svg width="68" height="68" viewBox="0 0 24 24" fill="none">
        <path
            d="M6.5 19H18C20.21 19 22 17.21 22 15C22 12.98 20.5 11.31 18.53 11.04C18.06 7.64 15.14 5 11.5 5C8.38 5 5.75 6.94 4.78 9.72C2.65 10.23 1 12.18 1 14.5C1 16.99 3.01 19 5.5 19H6.5Z"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M12 11V16"
            stroke="#2563EB"
            strokeWidth="2.2"
            strokeLinecap="round"
        />
        <path
            d="M9 13.5L12 10.5L15 13.5"
            stroke="#2563EB"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const BulkImport = ({ setCurrentPage, onImportSuccess, defaultTarget }) => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [toastMessage, setToastMessage] = useState(null);

    // Detect target: Contacts or Companies (defaults to Contacts matching user's request)
    const importTarget = defaultTarget || localStorage.getItem('dealconverter_import_target') || 'Contacts';
    const isContacts = importTarget === 'Contacts';

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Trigger native File Explorer dialog
    const handleChooseFileClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // When file is chosen in File Explorer
    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setSelectedFile(file);
            showToast(`Selected file: ${file.name}`);
        }
    };

    // Download Sample Template CSV (Contacts or Companies)
    const handleDownloadTemplate = () => {
        if (isContacts) {
            const headers = 'Contact Name,Mobile,Lead Status,Destinations,Email,Lead Owner\n';
            const sampleRow1 = '"Arun Kumar","+91 98401 23456","Hot Leads","Manali","arun@example.com","Self"\n';
            const sampleRow2 = '"Pooja Hegde","+91 98840 65432","Follow Up Leads","Goa","pooja@example.com","Self"\n';
            const sampleRow3 = '"Suresh Raina","+91 94441 12345","Open Deal","Kashmir","suresh@example.com","Self"\n';
            const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + sampleRow1 + sampleRow2 + sampleRow3);
            const link = document.createElement('a');
            link.setAttribute('href', csvContent);
            link.setAttribute('download', 'dealconverter_contacts_template.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Sample template downloaded (dealconverter_contacts_template.csv)');
        } else {
            const headers = 'Company Name,Mobile,Lead Status,Noofemployee,Annual Revenue,Mailing City,Email,Lead Owner\n';
            const sampleRow1 = '"Acme Global Corp","+91 98111 22233","Hot Leads","50-200","$500k - $1M","Mumbai","contact@acmeglobal.com","Self"\n';
            const sampleRow2 = '"Zenith Software","+91 98444 55566","Cold Leads","200+","$1M+","Bangalore","info@zenithsoft.com","Self"\n';
            const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + sampleRow1 + sampleRow2);
            const link = document.createElement('a');
            link.setAttribute('href', csvContent);
            link.setAttribute('download', 'dealconverter_companies_template.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Sample template downloaded (dealconverter_companies_template.csv)');
        }
    };

    // Complete the upload and add records
    const handleStartImport = () => {
        if (!selectedFile) {
            showToast('Please select a file first');
            return;
        }

        const baseName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9 ]/g, ' ');

        if (isContacts) {
            // Generate imported contacts
            const importedContacts = [
                {
                    id: Date.now() + 1,
                    name: `${baseName} Lead 1`,
                    mobile: '+91 9840' + Math.floor(100000 + Math.random() * 900000),
                    email: `lead1.${baseName.toLowerCase().replace(/\s+/g, '')}@example.com`,
                    status: 'Hot Leads',
                    dest: 'Manali',
                    owner: 'Self',
                    created: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    modified: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    initial: baseName.charAt(0).toUpperCase() || 'L',
                    color: '#3B82F6',
                    daysOld: 0
                },
                {
                    id: Date.now() + 2,
                    name: `${baseName} Lead 2`,
                    mobile: '+91 9841' + Math.floor(100000 + Math.random() * 900000),
                    email: `lead2.${baseName.toLowerCase().replace(/\s+/g, '')}@example.com`,
                    status: 'Cold Leads',
                    dest: 'Goa',
                    owner: 'Self',
                    created: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    modified: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    initial: baseName.charAt(0).toUpperCase() || 'L',
                    color: '#10B981',
                    daysOld: 0
                }
            ];

            const saved = localStorage.getItem('dealconverter_contacts_data');
            const currentList = saved ? JSON.parse(saved) : [];
            const updatedList = [...importedContacts, ...currentList];
            localStorage.setItem('dealconverter_contacts_data', JSON.stringify(updatedList));

            if (onImportSuccess) {
                onImportSuccess(importedContacts);
            }

            showToast(`Successfully imported contacts from ${selectedFile.name}!`);

            setTimeout(() => {
                if (setCurrentPage) {
                    setCurrentPage('Contacts');
                }
            }, 1000);
        } else {
            // Generate imported companies
            const importedCompanies = [
                {
                    id: Date.now() + 1,
                    name: `${baseName} Corp`,
                    mobile: '+91 98200 88991',
                    email: `sales@${baseName.toLowerCase().replace(/\s+/g, '')}.com`,
                    status: 'Hot Leads',
                    employees: '50-200',
                    revenue: '$500k - $1M',
                    city: 'Mumbai',
                    created: new Date().toLocaleString(),
                    modified: new Date().toLocaleString(),
                    owner: 'Self',
                    description: 'Bulk imported account',
                    country: 'India',
                    lead_source: 'Bulk Import',
                    instagram: `@${baseName.toLowerCase().replace(/\s+/g, '')}`,
                    sms_opt_out: 'No',
                    twitter: '',
                    linkedin: '',
                    email_opt_out: 'No',
                    zipcode: '400001',
                    address_1: 'Nariman Point',
                    facebook: '',
                    state: 'Maharashtra',
                    isNewToday: true
                },
                {
                    id: Date.now() + 2,
                    name: `${baseName} Solutions Ltd`,
                    mobile: '+91 98450 11223',
                    email: `info@${baseName.toLowerCase().replace(/\s+/g, '')}sol.com`,
                    status: 'Warm Leads',
                    employees: '10-50',
                    revenue: '$100k - $500k',
                    city: 'Bangalore',
                    created: new Date().toLocaleString(),
                    modified: new Date().toLocaleString(),
                    owner: 'Self',
                    description: 'Bulk imported client',
                    country: 'India',
                    lead_source: 'Bulk Import',
                    instagram: `@${baseName.toLowerCase().replace(/\s+/g, '')}sol`,
                    sms_opt_out: 'No',
                    twitter: '',
                    linkedin: '',
                    email_opt_out: 'No',
                    zipcode: '560001',
                    address_1: 'MG Road',
                    facebook: '',
                    state: 'Karnataka',
                    isNewToday: true
                }
            ];

            const saved = localStorage.getItem('dealconverter_companies_data');
            const currentList = saved ? JSON.parse(saved) : [];
            const updatedList = [...importedCompanies, ...currentList];
            localStorage.setItem('dealconverter_companies_data', JSON.stringify(updatedList));

            if (onImportSuccess) {
                onImportSuccess(importedCompanies);
            }

            showToast(`Successfully imported companies from ${selectedFile.name}!`);

            setTimeout(() => {
                if (setCurrentPage) {
                    setCurrentPage('Companies');
                }
            }, 1000);
        }
    };

    return (
        <div className="bulk-import-page">
            {/* Toast notification */}
            {toastMessage && (
                <div className="contacts-toast">
                    <Check size={16} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Hidden native File Picker */}
            <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {/* Back button & Page Title */}
            <div className="bulk-import-header-row">
                <button
                    className="bulk-import-back-btn"
                    onClick={() => setCurrentPage && setCurrentPage(isContacts ? 'Contacts' : 'Companies')}
                    title={isContacts ? "Back to Contacts" : "Back to Companies"}
                >
                    <ArrowLeft size={18} />
                    <span>{isContacts ? "Back to Contacts" : "Back to Companies"}</span>
                </button>
            </div>

            {/* Main Title matching Screenshot: "Bulk Import For Contacts" */}
            <h1 className="bulk-import-main-title">
                {isContacts ? 'Bulk Import For Contacts' : 'Bulk Import Companies'}
            </h1>

            {/* 4-Step Progress Indicator (Screenshot) */}
            <div className="bulk-stepper-container">
                {/* Step 1 */}
                <div className="bulk-step-item active">
                    <div className="step-circle active">1</div>
                    <span className="step-label active">Upload File</span>
                </div>

                <div className={`step-connector ${currentStep >= 2 ? 'active' : 'blue-active'}`} />

                {/* Step 2 */}
                <div className={`bulk-step-item ${currentStep >= 2 ? 'active' : ''}`}>
                    <div className="step-circle">2</div>
                    <span className="step-label">Select Lead Owner</span>
                </div>

                <div className="step-connector" />

                {/* Step 3 */}
                <div className={`bulk-step-item ${currentStep >= 3 ? 'active' : ''}`}>
                    <div className="step-circle">3</div>
                    <span className="step-label">Map Fields</span>
                </div>

                <div className="step-connector" />

                {/* Step 4 */}
                <div className={`bulk-step-item ${currentStep >= 4 ? 'active' : ''}`}>
                    <div className="step-circle">4</div>
                    <span className="step-label">Upload Data</span>
                </div>
            </div>

            <div className="bulk-import-divider" />

            {/* Template Notification Card (Screenshot) */}
            <div className="bulk-template-card">
                <div className="template-card-header">
                    <div className="template-info-icon-box">
                        <Info size={20} color="#2563EB" />
                    </div>
                    <span className="template-card-title">Need a Template?</span>
                </div>
                <p className="template-card-subtext">
                    {isContacts
                        ? 'Download our sample Excel template with pre-defined headers to ensure your data is formatted correctly for import.'
                        : 'Download our sample Excel template with pre-defined company headers.'}
                </p>
                <div className="template-btn-row">
                    <button
                        type="button"
                        className="download-template-blue-btn"
                        onClick={handleDownloadTemplate}
                    >
                        <Download size={16} />
                        <span>Download Sample Template</span>
                    </button>
                </div>
            </div>

            {/* Upload Area with Cloud Icon & Choose File Button (Screenshot) */}
            <div className="bulk-upload-section">
                <div className="bulk-cloud-icon-slot">
                    <CloudUploadIcon />
                </div>

                {selectedFile ? (
                    <div className="selected-file-badge">
                        <FileSpreadsheet size={18} color="#15803D" />
                        <span className="file-name-text">{selectedFile.name}</span>
                        <span className="file-size-text">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                ) : (
                    <p className="no-file-text">No file selected.</p>
                )}

                <div className="upload-actions-row">
                    <button
                        type="button"
                        className="choose-file-blue-btn"
                        onClick={handleChooseFileClick}
                    >
                        {selectedFile ? 'Change File' : 'Choose File'}
                    </button>

                    {selectedFile && (
                        <button
                            type="button"
                            className="start-import-btn"
                            onClick={handleStartImport}
                        >
                            <Check size={16} />
                            <span>Start Import</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkImport;
