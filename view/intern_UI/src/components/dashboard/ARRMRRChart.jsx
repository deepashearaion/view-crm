import React from 'react';
import ChartWidget from './ChartWidget';
import { Calendar, ChevronDown, BarChart2 } from 'lucide-react';
import OwnerFilter from './OwnerFilter';

const ARRMRRChart = () => {
    const headerFilters = (
        <div className="dashboard-filters" style={{ display: 'flex', gap: '8px', paddingBottom: '16px', position: 'relative' }}>
            <div className="filter-dropdown date-filter" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', borderRadius: '6px', padding: '8px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Calendar size={14} className="filter-icon-left" />
                    <span style={{ fontSize: '0.8rem' }}>This Month</span>
                </div>
                <ChevronDown size={14} className="filter-icon-right" />
            </div>
            <OwnerFilter defaultLabel="All Lead Owners" />
        </div>
    );

    return (
        <ChartWidget title="ARR & MRR Analysis" headerRight={null}>
            {headerFilters}
            <div className="empty-chart-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                <BarChart2 size={48} strokeWidth={1} style={{ marginBottom: '16px' }} />
                <p style={{ fontWeight: 500, color: '#6B7280', marginBottom: '8px' }}>No revenue data available</p>
                <p style={{ fontSize: '0.85rem' }}>Try adjusting your filters or check back later</p>
            </div>
        </ChartWidget>
    );
};

export default ARRMRRChart;
