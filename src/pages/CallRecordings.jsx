import React, { useState } from 'react';
import './CallRecordings.css';
import {
    ArrowLeft,
    RotateCw,
    Search,
    Calendar,
    Star,
    ChevronDown,
    Music,
    Eye,
    MicOff
} from 'lucide-react';

const CallRecordings = ({ setCurrentPage }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 600);
    };

    return (
        <div className="call-rec-wrapper">
            {/* Top Sub-Bar with Back arrow and Title */}
            <div className="call-rec-action-bar">
                <div className="call-rec-title-group">
                    <button
                        type="button"
                        className="call-rec-back-btn"
                        onClick={() => setCurrentPage && setCurrentPage('File Cabinet')}
                        title="Back"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <h3 className="call-rec-page-title">Call Recordings</h3>
                </div>

                <button
                    type="button"
                    className={`call-rec-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
                    onClick={handleRefresh}
                    title="Refresh"
                >
                    <RotateCw size={15} />
                </button>
            </div>

            {/* Search Input Box */}
            <div className="call-rec-search-box">
                <Search size={18} color="#9CA3AF" />
                <input
                    type="text"
                    placeholder="Search by contact, phone or performer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Filter Pills */}
            <div className="call-rec-filters-row">
                <div className="call-rec-pill">
                    <Calendar size={15} color="#2563EB" />
                    <span>This Month</span>
                    <Star size={13} color="#9CA3AF" />
                    <ChevronDown size={14} color="#6B7280" />
                </div>

                <div className="call-rec-pill">
                    <div className="call-rec-avatar-pill">A</div>
                    <span>Arun</span>
                    <ChevronDown size={14} color="#6B7280" />
                </div>
            </div>

            {/* KPI Summary Row */}
            <div className="call-rec-kpi-container">
                <div className="call-rec-kpi-card">
                    <div className="call-rec-icon-badge call-rec-icon-blue">
                        <Music size={18} />
                    </div>
                    <div className="call-rec-kpi-value">50</div>
                    <div className="call-rec-kpi-label">Total Recordings</div>
                </div>

                <div className="call-rec-kpi-divider" />

                <div className="call-rec-kpi-card">
                    <div className="call-rec-icon-badge call-rec-icon-green">
                        <Eye size={18} />
                    </div>
                    <div className="call-rec-kpi-value">0</div>
                    <div className="call-rec-kpi-label">Currently Showing</div>
                </div>
            </div>

            {/* Empty State */}
            <div className="call-rec-empty-state">
                <div className="call-rec-empty-icon-circle">
                    <MicOff size={28} />
                </div>
                <h4 className="call-rec-empty-title">No recordings available</h4>
                <p className="call-rec-empty-desc">Recordings will appear here once uploaded</p>
            </div>
        </div>
    );
};

export default CallRecordings;
