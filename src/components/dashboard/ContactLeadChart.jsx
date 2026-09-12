import React, { useState } from 'react';
import ChartWidget from './ChartWidget';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Area } from 'recharts';
import { Calendar, ChevronDown } from 'lucide-react';
import OwnerFilter from './OwnerFilter';
import './ContactLeadChart.css';

const emptyData = Array(14).fill(0).map((_, i) => ({ name: '0', uv: 0 }));

const legendItems = [
    { label: 'Total Contacts (0)', color: '#F43F5E' },
    { label: 'Unassigned Lead Owner (0)', color: '#14B8A6' },
    { label: 'Attempted to contact (0)', color: '#0EA5E9' },
    { label: 'Bad timing (0)', color: '#22C55E' },
    { label: 'Closed Won (0)', color: '#10B981' },
];

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

const ContactLeadChart = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const headerFilters = (
        <div className="dashboard-filters" style={{ display: 'flex', gap: '12px', position: 'relative' }}>
            <div className="filter-dropdown date-filter" style={{ display: 'flex', justifyContent: 'space-between', borderRadius: '6px', padding: '8px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Calendar size={14} className="filter-icon-left" />
                    <span style={{ fontSize: '0.8rem' }}>Today ☆</span>
                </div>
                <ChevronDown size={14} className="filter-icon-right" />
            </div>
            <OwnerFilter defaultLabel="All Lead Owners" />
        </div>
    );

    return (
        <>
            <ChartWidget title="Contact Lead Status" headerRight={headerFilters}>
                <div className="contact-chart-container">
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={emptyData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={true} tickLine={false} tick={{ fontSize: 10 }} tickMargin={10} minTickGap={5} />
                            <YAxis
                                axisLine={true}
                                tickLine={false}
                                ticks={[0, 2, 4, 6, 8, 10]}
                                tick={{ fontSize: 10 }}
                                tickMargin={10}
                                label={{ value: 'Count', angle: -90, position: 'insideLeft', offset: -15, style: { textAnchor: 'middle', fontSize: 11, fill: '#6B7280' } }}
                            />
                            <Area type="monotone" dataKey="uv" stroke="transparent" fill="transparent" />
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
                                    <span className="status-count">0</span>
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
