import React from 'react';
import ChartWidget from './ChartWidget';
import OwnerFilter from './OwnerFilter';
import { Calendar, ChevronDown, Mail } from 'lucide-react';

const EmailStats = () => {
    const headerFilters = (
        <div className="dashboard-filters" style={{ display: 'flex', gap: '12px', paddingBottom: '16px', position: 'relative' }}>
            <div className="filter-dropdown date-filter" style={{ flex: 1, justifyContent: 'space-between', borderRadius: '6px', padding: '8px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Calendar size={14} className="filter-icon-left" />
                    <span style={{ fontSize: '0.85rem' }}>Today</span>
                </div>
                <ChevronDown size={14} className="filter-icon-right" />
            </div>
            <OwnerFilter defaultLabel="All Lead Owners" />
        </div>
    );

    return (
        <ChartWidget title="Email Statistics" headerRight={null}>
            {headerFilters}
            <div className="empty-chart-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                <div style={{
                    backgroundColor: '#F3F4F6',
                    padding: '24px',
                    borderRadius: '16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Mail size={48} color="#D1D5DB" strokeWidth={1.5} />
                </div>
                <p style={{ fontWeight: 600, color: '#4B5563', marginBottom: '8px', fontSize: '1.05rem' }}>No email data available</p>
                <p style={{ fontSize: '0.85rem' }}>Try adjusting your filters</p>
            </div>
        </ChartWidget>
    );
};

export default EmailStats;
