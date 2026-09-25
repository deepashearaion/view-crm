import React, { useState, useRef } from 'react';
import { ArrowLeft, Check, Download, AlertCircle, FileSpreadsheet } from 'lucide-react';
import './BulkImport.css';

// Exact Cloud Upload SVG Icon from Screenshot 2
const CloudUploadIcon = () => (
    <svg width="68" height="68" viewBox="0 0 24 24" fill="none">
        <path
            d="M4.5 16.5C3.12 16.5 2 15.38 2 14C2 12.72 2.97 11.66 4.22 11.53C4.08 11.05 4 10.53 4 10C4 6.69 6.69 4 10 4C12.71 4 15.01 5.8 15.74 8.28C16.32 8.1 16.94 8 17.5 8C20 8 22 10 22 12.5C22 14.86 20.18 16.79 17.85 16.98"
            stroke="#2563EB"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M12 12V21"
            stroke="#2563EB"
            strokeWidth="2.2"
            strokeLinecap="round"
        />
        <path
            d="M8.5 15.5L12 12L15.5 15.5"
            stroke="#2563EB"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const BulkImport = ({ setCurrentPage, onImportSuccess }) => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [toastMessage, setToastMessage] = useState(null);

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

    // Download Sample Template CSV
    const handleDownloadTemplate = () => {
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
    };

    // Complete the upload and add records to companies
    const handleStartImport = () => {
        if (!selectedFile) {
            showToast('Please select a file first');
            return;
        }

        // Generate imported companies
        const baseName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9 ]/g, ' ');
        const importedItems = [
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

        // Save to localStorage
        const saved = localStorage.getItem('dealconverter_companies_data');
        const currentList = saved ? JSON.parse(saved) : [];
        const updatedList = [...importedItems, ...currentList];
        localStorage.setItem('dealconverter_companies_data', JSON.stringify(updatedList));

        if (onImportSuccess) {
            onImportSuccess(importedItems);
        }

        showToast(`Successfully imported companies from ${selectedFile.name}!`);

        // Return to Companies page after a brief moment
        setTimeout(() => {
            if (setCurrentPage) {
                setCurrentPage('Companies');
            }
        }, 1000);
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
                    onClick={() => setCurrentPage && setCurrentPage('Companies')}
                    title="Back to Companies"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Companies</span>
                </button>
            </div>

            <h1 className="bulk-import-main-title">Bulk Import Companies</h1>

            {/* 4-Step Progress Indicator (Screenshot 2) */}
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

            {/* Template Notification Card (Screenshot 2) */}
            <div className="bulk-template-card">
                <div className="template-card-header">
                    <div className="template-info-icon-box">
                        <AlertCircle size={20} color="#2563EB" />
                    </div>
                    <span className="template-card-title">Need a Template?</span>
                </div>
                <p className="template-card-subtext">
                    Download our sample Excel template with pre-defined company headers.
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

            {/* Upload Area with Cloud Icon & Choose File Button (Screenshot 2) */}
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
