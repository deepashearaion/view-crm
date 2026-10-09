import React, { useState } from 'react';
import ChartWidget from './ChartWidget';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Calendar, ChevronDown, RefreshCw } from 'lucide-react';
import OwnerFilter from './OwnerFilter';

const emptyData = [
    { name: 'Total', value: 0 },
    { name: 'Completed', value: 0 },
    { name: 'Upcoming', value: 0 },
    { name: 'Overdue', value: 0 },
    { name: 'Canceled', value: 0 },
];

const MeetingDashboard = () => {
    const headerRight = (
        <button className="icon-btn" style={{ backgroundColor: '#F3F4F6', borderRadius: '50%', padding: '6px', color: '#6B7280' }}>
            <RefreshCw size={16} />
        </button>
    );

    return (
        <ChartWidget title="Meeting Dashboard" headerRight={headerRight}>
            <div className="dashboard-filters" style={{ display: 'flex', gap: '12px', paddingBottom: '16px', position: 'relative', zIndex: 10 }}>
                <div className="filter-dropdown date-filter" style={{ flex: 1, justifyContent: 'space-between', borderRadius: '6px', padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Calendar size={14} className="filter-icon-left" />
                        <span style={{ fontSize: '0.85rem' }}>Today</span>
                    </div>
                    <ChevronDown size={14} className="filter-icon-right" />
                </div>
                <OwnerFilter defaultLabel="All Owners" />
            </div>

            <div style={{ height: '220px', width: '100%', position: 'relative', zIndex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={emptyData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} domain={[0, 1.2]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1, 1.2]} dx={-10} />
                        <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={0} dot={false} activeDot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </ChartWidget>
    );
};

export default MeetingDashboard;
