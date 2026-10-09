import React, { useState } from 'react';
import ChartWidget from './ChartWidget';
import './CallAnalytics.css';
import { Calendar, ChevronDown, LayoutGrid, List, PhoneCall, PhoneForwarded, PhoneMissed, Phone, ArrowUpRight, ArrowDownLeft, BarChart2 } from 'lucide-react';
import OwnerFilter from './OwnerFilter';

const CallAnalytics = ({ setCurrentPage }) => {
    const [selectedOwner, setSelectedOwner] = useState('All');
    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

    const mockDataAll = {
        avgDur: '0s', talkTime: '0s', calls: 0, connected: 0, out: 0, outConn: 0, inb: 0, inbConn: 0
    };
    const mockDataArun = {
        avgDur: '4m 12s', talkTime: '2h 15m', calls: 45, connected: 32, out: 30, outConn: 20, inb: 15, inbConn: 12
    };

    const data = selectedOwner === 'All' ? mockDataAll : mockDataArun;

    const headerRight = (
        <div className="analytics-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
                onClick={() => setCurrentPage && setCurrentPage('Call Logs')}
                title="View detailed call logs"
                style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                <BarChart2 size={16} color="#4F46E5" />
            </button>
            <div className="view-toggle">
                <button className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => setViewMode('cards')}>
                    <LayoutGrid size={14} /> Cards
                </button>
                <button className={`view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
                    <List size={14} /> Table
                </button>
            </div>
        </div>
    );

    return (
        <ChartWidget title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Call Analytics <span style={{ color: '#1E29FF' }}><LayoutGrid size={18} /></span></div>} headerRight={headerRight}>

            <div className="call-filters" style={{ display: 'flex', gap: '8px', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
                <div className="filter-dropdown date-filter" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', borderRadius: '6px', padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Calendar size={14} className="filter-icon-left" />
                        <span style={{ fontSize: '0.8rem' }}>Today ☆</span>
                    </div>
                    <ChevronDown size={14} className="filter-icon-right" />
                </div>
                <OwnerFilter defaultLabel="All" onSelect={(val) => setSelectedOwner(val)} />
            </div>

            {viewMode === 'cards' ? (
                <>
                    <div className="call-stats-grid">
                        <div className="call-stat-box">
                            <div className="call-stat-label">Average Duration</div>
                            <div className="call-stat-value">{data.avgDur}</div>
                        </div>
                        <div className="call-stat-box">
                            <div className="call-stat-label">Total Talk Time</div>
                            <div className="call-stat-value">{data.talkTime}</div>
                        </div>
                    </div>

                    <ul className="call-metrics-list">
                        <li>
                            <div className="metric-left">
                                <div className="metric-icon-wrap" style={{ backgroundColor: '#22C55E' }}><PhoneCall size={16} color="white" /></div>
                                <span className="metric-name">Total Calls</span>
                            </div>
                            <span className="metric-val">{data.calls}</span>
                        </li>
                        <li>
                            <div className="metric-left">
                                <div className="metric-icon-wrap" style={{ backgroundColor: '#3B82F6' }}><Phone size={16} color="white" /></div>
                                <span className="metric-name">Total Connected Calls</span>
                            </div>
                            <span className="metric-val">{data.connected}</span>
                        </li>
                        <li>
                            <div className="metric-left">
                                <div className="metric-icon-wrap" style={{ backgroundColor: '#EF4444' }}><ArrowUpRight size={16} color="white" /></div>
                                <span className="metric-name">Total Outbound Calls</span>
                            </div>
                            <span className="metric-val">{data.out}</span>
                        </li>
                        <li>
                            <div className="metric-left">
                                <div className="metric-icon-wrap" style={{ backgroundColor: '#22C55E' }}><ArrowUpRight size={16} color="white" /></div>
                                <span className="metric-name">Outbound Connected Calls</span>
                            </div>
                            <span className="metric-val">{data.outConn}</span>
                        </li>
                        <li>
                            <div className="metric-left">
                                <div className="metric-icon-wrap" style={{ backgroundColor: '#F59E0B' }}><ArrowDownLeft size={16} color="white" /></div>
                                <span className="metric-name">Total Inbound Calls</span>
                            </div>
                            <span className="metric-val">{data.inb}</span>
                        </li>
                        <li>
                            <div className="metric-left">
                                <div className="metric-icon-wrap" style={{ backgroundColor: '#8B5CF6' }}><ArrowDownLeft size={16} color="white" /></div>
                                <span className="metric-name">Inbound Connected Calls</span>
                            </div>
                            <span className="metric-val">{data.inbConn}</span>
                        </li>
                    </ul>
                </>
            ) : (
                <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
                                <th style={{ padding: '12px 16px', color: '#6B7280', fontWeight: 500 }}>#</th>
                                <th style={{ padding: '12px 16px', color: '#6B7280', fontWeight: 500 }}>Agent</th>
                                <th style={{ padding: '12px 16px', color: '#6B7280', fontWeight: 500 }}>Total</th>
                                <th style={{ padding: '12px 16px', color: '#6B7280', fontWeight: 500 }}>Connected</th>
                                <th style={{ padding: '12px 16px', color: '#6B7280', fontWeight: 500 }}>Outbound</th>
                                <th style={{ padding: '12px 16px', color: '#6B7280', fontWeight: 500 }}>OB Conn.</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '12px 16px', color: '#9CA3AF' }}>1</td>
                                <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#5D667B', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>A</div>
                                    <span style={{ color: '#111827', fontWeight: 500 }}>Arun</span>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                    <span style={{ backgroundColor: '#EFF6FF', color: '#3B82F6', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500 }}>
                                        {data.calls}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                    <span style={{ backgroundColor: '#ECFDF5', color: '#10B981', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500 }}>
                                        {data.connected}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 16px', color: '#4B5563' }}>{data.out}</td>
                                <td style={{ padding: '12px 16px', color: '#4B5563' }}>{data.outConn}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

        </ChartWidget>
    );
};

export default CallAnalytics;
