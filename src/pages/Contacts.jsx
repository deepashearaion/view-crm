import React from 'react';
import { Search, ChevronDown, RefreshCw, FileSpreadsheet, Plus, Filter, User, Calendar, Columns, ChevronLeft, ChevronRight } from 'lucide-react';

const mockContacts = [
    { created: 'Jul 16, 2026 12:15:30 AM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+918838687357', name: 'Hariharan', status: 'Cold Leads', dest: 'Manali', initial: 'H', color: '#8B5CF6' },
    { created: 'Jul 15, 2026 07:51:05 PM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+918903856486', name: 'A M I', status: 'Cold Leads', dest: '', initial: 'A', color: '#A3E635' },
    { created: 'Jul 15, 2026 02:58:54 PM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+919600670965', name: '+9196006...', status: 'Cold Leads', dest: 'Manali', initial: 'M', color: '#F43F5E' },
    { created: 'Jul 15, 2026 02:43:22 PM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+917558838323', name: '+917558...', status: 'Cold Leads', dest: '', initial: 'J', color: '#8B5CF6' },
    { created: 'Jul 15, 2026 08:45:25 AM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+918825887305', name: 'Jenifer', status: 'Cold Leads', dest: 'Goa', initial: 'J', color: '#10B981' },
    { created: 'Jul 13, 2026 04:42:52 PM', modified: 'Aug 21, 2026 11:37:07 AM', mobile: '+919840330098', name: 'rajasekar', status: 'Cold Leads', dest: 'Manali', initial: 'R', color: '#8B5CF6' },
];

const Contacts = () => {
    return (
        <div style={{ backgroundColor: '#FFFFFF', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Actions Bar 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', gap: '8px', cursor: 'pointer', minWidth: '150px' }}>
                    <User size={16} color="#3B82F6" />
                    <span style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 500, flex: 1 }}>All Contacts</span>
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
                    <User size={14} color="#4B5563" /> Workable Leads
                </button>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                    <button style={{ padding: '8px 16px', backgroundColor: '#E5E7EB', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4B5563', fontWeight: 500, cursor: 'pointer' }}>
                        <Columns size={16} fill="#9CA3AF" /> Column Settings
                    </button>
                    <button style={{ padding: '8px 16px', backgroundColor: '#1D4ED8', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
                        Add New Contacts
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

                <button style={{ padding: '6px 12px', border: '1px solid #FEF08A', borderRadius: '4px', backgroundColor: '#FEF9C3', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#854D0E', cursor: 'pointer' }}>
                    😍 0-30 days
                </button>
                <button style={{ padding: '6px 12px', border: '1px solid #FEF08A', borderRadius: '4px', backgroundColor: '#FEF9C3', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#854D0E', cursor: 'pointer' }}>
                    😐 30-60 days
                </button>
                <button style={{ padding: '6px 12px', border: '1px solid #FEF08A', borderRadius: '4px', backgroundColor: '#FEF9C3', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#854D0E', cursor: 'pointer' }}>
                    😔 60-90 days
                </button>

                <button style={{ padding: '8px 16px', backgroundColor: '#BBF7D0', border: '1px solid #86EFAC', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#166534', fontWeight: 500, cursor: 'pointer' }}>
                    <FileSpreadsheet size={16} /> Export
                </button>
                <button style={{ padding: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                    <RefreshCw size={16} color="#4B5563" />
                </button>
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>
                            <th style={{ padding: '12px 24px', width: '40px' }}><input type="checkbox" style={{ transform: 'scale(1.2)' }} /></th>
                            <th style={{ padding: '12px 16px', fontWeight: 500 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Created Date <span style={{ fontSize: '10px' }}>⇅</span></div>
                            </th>
                            <th style={{ padding: '12px 16px', fontWeight: 500 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><RefreshCw size={14} /> Modified Date <span style={{ fontSize: '10px' }}>⇅</span></div>
                            </th>
                            <th style={{ padding: '12px 16px', fontWeight: 500 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Mobile <span style={{ fontSize: '10px' }}>⇅</span></div>
                            </th>
                            <th style={{ padding: '12px 16px', fontWeight: 500 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Contact Name <span style={{ fontSize: '10px' }}>⇅</span></div>
                            </th>
                            <th style={{ padding: '12px 16px', fontWeight: 500 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Lead Status <span style={{ fontSize: '10px' }}>⇅</span></div>
                            </th>
                            <th style={{ padding: '12px 16px', fontWeight: 500 }}>Destinations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockContacts.map((contact, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <td style={{ padding: '12px 24px' }}><input type="checkbox" style={{ transform: 'scale(1.2)' }} /></td>
                                <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 500 }}>{contact.created}</td>
                                <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 500 }}>{contact.modified}</td>
                                <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 500 }}>{contact.mobile}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: contact.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 500 }}>
                                            {contact.initial}
                                        </div>
                                        <span style={{ color: '#2563EB', fontWeight: 600 }}>{contact.name}</span>
                                        <div style={{ color: '#9CA3AF', cursor: 'pointer' }}>👁</div>
                                    </div>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                    <span style={{ padding: '4px 8px', borderRadius: '12px', backgroundColor: '#F3F4F6', color: '#4B5563', fontSize: '0.75rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6B7280' }}></div>
                                        {contact.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                    {contact.dest && (
                                        <span style={{ padding: '2px 8px', backgroundColor: contact.dest === 'Goa' ? '#FEE2E2' : '#D1FAE5', color: contact.dest === 'Goa' ? '#EF4444' : '#10B981', borderRadius: '4px', fontSize: '0.75rem' }}>
                                            {contact.dest}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Pagination */}
            <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #E5E7EB' }}>
                <div style={{ padding: '4px 12px', backgroundColor: '#EFF6FF', color: '#3B82F6', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500, border: '1px solid #BFDBFE' }}>
                    Total Leads: <span style={{ color: '#2563EB' }}>10 / 6039</span>
                </div>
                <div style={{ padding: '4px 12px', backgroundColor: '#FEE2E2', color: '#EF4444', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500, border: '1px solid #FECACA' }}>
                    Untouched Leads: <span style={{ color: '#DC2626' }}>0 / 6039</span>
                </div>
                <div style={{ padding: '4px 12px', backgroundColor: '#EFF6FF', color: '#111827', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid #BFDBFE' }}>
                    Page: 1 / 604
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', backgroundColor: '#E5E7EB', borderRadius: '4px', border: '1px solid #D1D5DB' }}>
                    <span style={{ fontSize: '0.8rem', color: '#4B5563' }}>Rows per page: 10 ☆</span>
                    <ChevronDown size={14} color="#6B7280" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
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

export default Contacts;
