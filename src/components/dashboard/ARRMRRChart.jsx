import React from 'react';
import ChartWidget from './ChartWidget';
import { BarChart2 } from 'lucide-react';
import DateFilter from './DateFilter';
import OwnerFilter from './OwnerFilter';

const ARRMRRChart = () => {
    return (
        <ChartWidget title="ARR & MRR Analysis">
            <div className="card-filter-row">
                <DateFilter defaultValue="This Month" />
                <div style={{ minWidth: '150px' }}>
                    <OwnerFilter defaultLabel="All Lead Owners" />
                </div>
            </div>

            <div
                className="empty-chart-state"
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9CA3AF',
                    minHeight: '240px'
                }}
            >
                <BarChart2 size={44} strokeWidth={1.5} style={{ marginBottom: '16px', color: '#9CA3AF' }} />
                <p style={{ fontWeight: 500, color: '#4B5563', marginBottom: '6px', fontSize: '0.95rem' }}>
                    No revenue data available
                </p>
                <p style={{ fontSize: '0.85rem', color: '#9CA3AF', margin: 0 }}>
                    Try adjusting your filters or check back later
                </p>
            </div>
        </ChartWidget>
    );
};

export default ARRMRRChart;
