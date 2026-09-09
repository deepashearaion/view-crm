import React from 'react';
import { Calendar, ChevronDown, RefreshCw, Plus, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const Activities = () => {
    return (
        <div style={{ padding: '24px', backgroundColor: '#FFFFFF', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Actions Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>

                <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: '#FFFFFF', gap: '8px', cursor: 'pointer' }}>
                    <Calendar size={14} color="#6B7280" />
                    <span style={{ fontSize: '0.85rem', color: '#111827' }}>Today</span>
                    <ChevronDown size={14} color="#6B7280" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: '#FFFFFF', gap: '8px', minWidth: '150px', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Lead Owner</span>
                    <ChevronDown size={14} color="#6B7280" />
                </div>

                <button style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <RefreshCw size={14} color="#3B82F6" />
                </button>

                <button style={{ padding: '6px 16px', backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
                    <Plus size={16} /> New
                </button>

                <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: '6px', overflow: 'hidden' }}>
                    <button style={{ padding: '6px 12px', backgroundColor: '#FFFFFF', border: 'none', borderRight: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#9CA3AF', cursor: 'pointer' }}>
                        <span style={{ fontSize: '14px' }}>⚠</span> Overdue (0)
                    </button>
                    <button style={{ padding: '6px 12px', backgroundColor: '#DCFCE7', border: 'none', borderRight: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#16A34A', fontWeight: 500, cursor: 'pointer' }}>
                        <Calendar size={14} /> Upcoming (0) <span style={{ fontSize: '10px' }}>↑</span>
                    </button>
                    <button style={{ padding: '6px 12px', backgroundColor: '#FFFFFF', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#9CA3AF', cursor: 'pointer' }}>
                        <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#9CA3AF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✓</span> Completed (0)
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '24px', width: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: '#FFFFFF', gap: '8px' }}>
                    <Search size={16} color="#9CA3AF" />
                    <input
                        type="text"
                        placeholder="Search activities..."
                        style={{ border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%', color: '#111827' }}
                    />
                </div>
            </div>

            {/* Main Content (Empty State) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={48} color="#D1D5DB" strokeWidth={1} style={{ marginBottom: '16px' }} />
                <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>No tasks available</p>
            </div>

            {/* Footer Pagination */}
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                <div style={{ padding: '4px 12px', backgroundColor: '#EFF6FF', color: '#3B82F6', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500, border: '1px solid #BFDBFE' }}>
                    Total Tasks: 0
                </div>
                <div style={{ padding: '4px 12px', backgroundColor: '#EFF6FF', color: '#3B82F6', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500, border: '1px solid #BFDBFE' }}>
                    Total Upcoming: <span style={{ color: '#2563EB' }}>0 / 0</span>
                </div>
                <div style={{ padding: '4px 12px', backgroundColor: '#F3F4F6', color: '#4B5563', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid #E5E7EB' }}>
                    Page: 1 / 1
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', backgroundColor: '#E5E7EB', borderRadius: '4px', border: '1px solid #D1D5DB', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '0.8rem', color: '#4B5563' }}>Rows per page: 10 ☆</span>
                    <ChevronDown size={14} color="#6B7280" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button style={{ padding: '4px 8px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px', color: '#D1D5DB', cursor: 'not-allowed' }}>
                        <ChevronLeft size={16} />
                    </button>
                    <button style={{ padding: '4px 12px', backgroundColor: '#3B82F6', border: 'none', borderRadius: '4px', color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 500 }}>
                        1
                    </button>
                    <button style={{ padding: '4px 8px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px', color: '#3B82F6', cursor: 'pointer' }}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Activities;
