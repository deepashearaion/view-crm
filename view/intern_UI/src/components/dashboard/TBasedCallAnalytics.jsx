import React from 'react';
import ChartWidget from './ChartWidget';
import { Calendar, ChevronDown, RefreshCw, BarChart2 } from 'lucide-react';
import OwnerFilter from './OwnerFilter';

const TBasedCallAnalytics = () => {
    const headerRight = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: 600 }}>0% connect rate</span>
            <button className="icon-btn outline" style={{ borderRadius: '50%', width: 28, height: 28, padding: 0, border: 'none' }}>
                <RefreshCw size={14} color="#1E29FF" />
            </button>
        </div>
    );

    const headerFilters = (
        <div className="dashboard-filters" style={{ display: 'flex', gap: '8px', paddingBottom: '16px', position: 'relative' }}>
            <div className="filter-dropdown date-filter" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Calendar size={14} className="filter-icon-left" />
                    <span style={{ fontSize: '0.8rem' }}>Today</span>
                </div>
                <ChevronDown size={14} className="filter-icon-right" />
            </div>
            <OwnerFilter defaultLabel="All" />
        </div>
    );

    return (
        <ChartWidget title="T-Based Call Analytics" headerRight={headerRight} footer={null}>
            {headerFilters}
            <div className="empty-chart-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', height: '180px' }}>
                <BarChart2 size={40} color="#D1D5DB" strokeWidth={2} style={{ marginBottom: '12px' }} />
                <p style={{ fontWeight: 500, color: '#6B7280', fontSize: '0.9rem', marginBottom: '8px' }}>No calls found</p>
                <p style={{ fontSize: '0.8rem' }}>Try adjusting your filters</p>
            </div>
        </ChartWidget>
    );
};

export default TBasedCallAnalytics;
