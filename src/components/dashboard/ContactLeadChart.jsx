import React, { useState, useMemo } from 'react';
import ChartWidget from './ChartWidget';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Area } from 'recharts';
import DateFilter from './DateFilter';
import OwnerFilter from './OwnerFilter';
import './ContactLeadChart.css';

const fullStatuses = [
    { label: 'Total Contacts', color: '#F43F5E' },
    { label: 'Unassigned Lead Owner', color: '#14B8A6' },
    { label: 'Attempted to contact', color: '#0EA5E9' },
    { label: 'Bad timing', color: '#22C55E' },
    { label: 'Closed Won', color: '#10B981' },
    { label: 'Connected', color: '#8B5CF6' },
    { label: 'Follow Up Leads', color: '#06B6D4' },
    { label: 'Hot Leads', color: '#F43F5E' },
    { label: 'In Progress', color: '#8B5CF6' },
    { label: 'New', color: '#6366F1' },
    { label: 'Open', color: '#10B981' },
    { label: 'Open deal', color: '#10B981' },
    { label: 'Unassigned', color: '#F97316' },
];

const ContactLeadChart = ({ contacts = [] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Compute status counts from fetched contacts
    const statusCounts = useMemo(() => {
        const counts = {
            'Total Contacts': contacts.length,
            'Unassigned Lead Owner': 0,
            'Attempted to contact': 0,
            'Bad timing': 0,
            'Closed Won': 0,
            'Connected': 0,
            'Follow Up Leads': 0,
            'Hot Leads': 0,
            'In Progress': 0,
            'New': 0,
            'Open': 0,
            'Open deal': 0,
            'Unassigned': 0,
        };

        const statusIdMap = {
            1: 'Hot Leads',
            2: 'Warm Leads',
            3: 'Cold Leads',
            4: 'Open deal',
            5: 'Follow Up Leads',
            6: 'Closed Won'
        };

        contacts.forEach(c => {
            // Unassigned owner check
            if (!c.lead_owner_id && !c.owner) {
                counts['Unassigned Lead Owner']++;
            }

            const rawStatus = (c.status || statusIdMap[c.lead_status_id] || '').trim();
            const matchedKey = Object.keys(counts).find(
                k => k.toLowerCase() === rawStatus.toLowerCase()
            );

            if (matchedKey) {
                counts[matchedKey]++;
            } else if (c.lead_status_id === 1) {
                counts['Hot Leads']++;
            } else if (c.lead_status_id === 4) {
                counts['Open deal']++;
            } else if (c.lead_status_id === 5) {
                counts['Follow Up Leads']++;
            } else if (c.lead_status_id === 6) {
                counts['Closed Won']++;
            }
        });

        return counts;
    }, [contacts]);

    const legendItems = [
        { label: `Total Contacts (${statusCounts['Total Contacts'] || 0})`, color: '#F43F5E' },
        { label: `Unassigned Lead Owner (${statusCounts['Unassigned Lead Owner'] || 0})`, color: '#14B8A6' },
        { label: `Attempted to contact (${statusCounts['Attempted to contact'] || 0})`, color: '#0EA5E9' },
        { label: `Bad timing (${statusCounts['Bad timing'] || 0})`, color: '#22C55E' },
        { label: `Closed Won (${statusCounts['Closed Won'] || 0})`, color: '#10B981' },
    ];

    const chartData = useMemo(() => {
        if (!contacts || contacts.length === 0) {
            return Array(14).fill(0).map(() => ({ name: '0', uv: 0 }));
        }

        return [
            { name: '0', uv: statusCounts['Total Contacts'] || 0 },
            { name: '0', uv: statusCounts['Unassigned Lead Owner'] || 0 },
            { name: '0', uv: statusCounts['Hot Leads'] || 0 },
            { name: '0', uv: statusCounts['Open deal'] || 0 },
            { name: '0', uv: statusCounts['Follow Up Leads'] || 0 },
            { name: '0', uv: statusCounts['Closed Won'] || 0 },
            { name: '0', uv: 0 },
            { name: '0', uv: 0 },
            { name: '0', uv: 0 },
            { name: '0', uv: 0 },
            { name: '0', uv: 0 },
            { name: '0', uv: 0 },
            { name: '0', uv: 0 },
            { name: '0', uv: 0 }
        ];
    }, [contacts, statusCounts]);

    return (
        <>
            <ChartWidget title="Contact Lead Status">
                <div className="card-filter-row">
                    <DateFilter defaultValue="Today" />
                    <div style={{ minWidth: '150px' }}>
                        <OwnerFilter defaultLabel="All Lead Owners" />
                    </div>
                </div>

                <div className="contact-chart-container">
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis
                                dataKey="name"
                                axisLine={{ stroke: '#E5E7EB' }}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                tickMargin={8}
                            />
                            <YAxis
                                axisLine={{ stroke: '#E5E7EB' }}
                                tickLine={false}
                                ticks={[0, 2, 4, 6, 8, 10]}
                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                tickMargin={8}
                            />
                            <Area
                                type="monotone"
                                dataKey="uv"
                                stroke={contacts.length > 0 ? '#3B82F6' : 'transparent'}
                                fill={contacts.length > 0 ? '#DBEAFE' : 'transparent'}
                                fillOpacity={0.4}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-legend-box" style={{ marginTop: 'auto' }}>
                    <div className="legend-header">
                        <span className="legend-title">Status Colors:</span>
                        <span className="view-all" onClick={() => setIsModalOpen(true)}>View All</span>
                    </div>
                    <div className="legend-grid">
                        {legendItems.map((item, i) => (
                            <div key={i} className="legend-item">
                                <div className="legend-dot" style={{ backgroundColor: item.color }}></div>
                                <span className="legend-text">{item.label}</span>
                            </div>
                        ))}
                        <div className="legend-more" onClick={() => setIsModalOpen(true)}>+8 more</div>
                    </div>
                </div>
            </ChartWidget>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">All Lead Statuses</h2>

                        <div className="status-list">
                            {fullStatuses.map((status, idx) => (
                                <div key={idx} className="status-list-item">
                                    <div className="status-info">
                                        <div className="status-color-square" style={{ backgroundColor: status.color }}></div>
                                        <span className="status-label">{status.label}</span>
                                    </div>
                                    <span className="status-count">{statusCounts[status.label] || 0}</span>
                                </div>
                            ))}
                        </div>

                        <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ContactLeadChart;
