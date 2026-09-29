import React from 'react';
import { PlusCircle, CheckCircle2, Receipt } from 'lucide-react';

const Invoice = () => {
    return (
        <div style={{ padding: '40px', backgroundColor: '#FFFFFF', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '60px', maxWidth: '900px', width: '100%' }}>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '300px', height: '250px', backgroundColor: '#FAFAFA', borderRadius: '12px', position: 'relative', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
                            <span style={{ fontSize: '48px', display: 'block', marginBottom: '8px' }}>🧾</span>
                            <span>Invoice Management</span>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                        Streamline invoicing and get paid faster.
                    </h1>
                    <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '32px' }}>
                        Create GST compliant invoices, track payments, and send automatic payment reminders.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CheckCircle2 size={20} color="#3B82F6" className="shrink-0" />
                            <span style={{ fontSize: '0.9rem', color: '#4B5563' }}>Generate GST compliant invoices in one click</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CheckCircle2 size={20} color="#3B82F6" className="shrink-0" />
                            <span style={{ fontSize: '0.9rem', color: '#4B5563' }}>Track paid, pending, and overdue invoices</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CheckCircle2 size={20} color="#3B82F6" className="shrink-0" />
                            <span style={{ fontSize: '0.9rem', color: '#4B5563' }}>Send PDF invoices directly via WhatsApp or email</span>
                        </div>
                    </div>

                    <button style={{ padding: '10px 24px', backgroundColor: '#1D4ED8', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: 'rgba(37, 99, 235, 0.2) 0px 4px 12px' }}>
                        <PlusCircle size={18} /> Create Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
