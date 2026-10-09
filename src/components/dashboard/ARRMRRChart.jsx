import React from 'react';
import ChartWidget from './ChartWidget';
import { BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import DateFilter from './DateFilter';
import OwnerFilter from './OwnerFilter';

const ARRMRRChart = ({ totalARR = 0, totalMRR = 0 }) => {
    const hasRevenue = Number(totalARR) > 0 || Number(totalMRR) > 0;

    const revenueData = [
        { name: 'MRR (Monthly)', amount: Number(totalMRR) || 0, fill: '#6366F1' },
        { name: 'ARR (Annual)', amount: Number(totalARR) || 0, fill: '#3B82F6' }
    ];

    return (
        <ChartWidget title="ARR & MRR Analysis">
            <div className="card-filter-row">
                <DateFilter defaultValue="This Month" />
                <div style={{ minWidth: '150px' }}>
                    <OwnerFilter defaultLabel="All Lead Owners" />
                </div>
            </div>

            {!hasRevenue ? (
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
            ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '240px' }}>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                        <div style={{
                            flex: 1,
                            backgroundColor: '#F8FAFC',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0'
                        }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Monthly Recurring (MRR)</span>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginTop: '2px' }}>
                                ₹{Number(totalMRR).toFixed(2)}
                            </div>
                        </div>

                        <div style={{
                            flex: 1,
                            backgroundColor: '#F8FAFC',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0'
                        }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Annual Recurring (ARR)</span>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginTop: '2px' }}>
                                ₹{Number(totalARR).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div style={{ height: '170px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={{ stroke: '#E5E7EB' }}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#64748B' }}
                                />
                                <YAxis
                                    axisLine={{ stroke: '#E5E7EB' }}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                />
                                <Tooltip
                                    formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']}
                                    contentStyle={{ borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                                />
                                <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </ChartWidget>
    );
};

export default ARRMRRChart;
