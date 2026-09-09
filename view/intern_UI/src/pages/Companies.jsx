import React from 'react';
import { Search, ChevronDown, RefreshCw, FileSpreadsheet, Filter, Building2, User, Columns, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const Companies = () => {
    return (
        <div style={{ backgroundColor: '#FFFFFF', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Actions Bar 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', gap: '8px', cursor: 'pointer', minWidth: '150px' }}>
                    <Building2 size={16} color="#3B82F6" />
                    <span style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 500, flex: 1 }}>All Companies</span>
                    <ChevronDown size={16} color="#6B7280" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', gap: '8px', cursor: 'pointer' }}>
                    <span style={{ fontSize: '14px', color: '#3B82F6' }}>∞</span>
                    <span style={{ fontSize: '0.85rem', color: '#4B5563' }}>All time</span>
                    <span style={{ color: '#F59E0B' }}>★</span>
                    <ChevronDown size={14} color="#6B7280" />
                </div>
                <button style={{ padding: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                    <Filter size={18} color="#3B82F6" />
                </button>
                <button style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#111827', fontWeight: 500 }}>
                    <User size={14} color="#F43F5E" /> My Assigned Leads
                </button>
                <button style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#111827', fontWeight: 500 }}>
                    <span style={{ color: '#10B981' }}>🌱</span> New Leads Today
                </button>
                <button style={{ padding: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                    <RefreshCw size={16} color="#4B5563" />
                </button>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                    <button style={{ padding: '8px 16px', backgroundColor: '#1D4ED8', color: '#FFFFFF', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
                        <Columns size={16} /> Column Settings
                    </button>
                    <button style={{ padding: '8px 16px', backgroundColor: '#1D4ED8', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
                        Add New Companies
                    </button>
                </div>
            </div>

            {/* Actions Bar 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: '#FFFFFF', gap: '8px', width: '250px' }}>
                    <Search size={16} color="#9CA3AF" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        style={{ border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%' }}
                    />
                </div>

                <button style={{ padding: '8px 16px', backgroundColor: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#166534', fontWeight: 500, cursor: 'pointer' }}>
                    <FileSpreadsheet size={16} /> Export to Excel
                </button>
            </div>

            {/* Empty State */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <FolderOpen size={48} color="#D1D5DB" strokeWidth={1} style={{ marginBottom: '16px' }} />
                <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>No data available</p>
            </div>

            {/* Footer Pagination */}
            <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #E5E7EB' }}>
                <div style={{ padding: '4px 12px', backgroundColor: '#EFF6FF', color: '#3B82F6', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500, border: '1px solid #BFDBFE' }}>
                    Total Leads: <span style={{ color: '#3B82F6' }}>0 / 0</span>
                </div>
                <div style={{ padding: '4px 12px', backgroundColor: '#FEE2E2', color: '#EF4444', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500, border: '1px solid #FECACA' }}>
                    Untouched Leads: <span style={{ color: '#EF4444' }}>0 / 0</span>
                </div>
                <div style={{ padding: '4px 12px', backgroundColor: '#EFF6FF', color: '#111827', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid #BFDBFE' }}>
                    Page: 1 / 1
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', backgroundColor: '#E5E7EB', borderRadius: '4px', border: '1px solid #D1D5DB' }}>
                    <span style={{ fontSize: '0.8rem', color: '#4B5563' }}>Rows per page: 10 ☆</span>
                    <ChevronDown size={14} color="#6B7280" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button style={{ padding: '4px 8px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px', color: '#D1D5DB', cursor: 'not-allowed' }}>
                        <span style={{ fontSize: '10px' }}>&lt;</span>
                    </button>
                    <button style={{ padding: '4px 12px', backgroundColor: '#3B82F6', border: 'none', borderRadius: '4px', color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 500 }}>
                        1
                    </button>
                    <button style={{ padding: '4px 8px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px', color: '#D1D5DB', cursor: 'not-allowed' }}>
                        <span style={{ fontSize: '10px' }}>&gt;</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Companies;
