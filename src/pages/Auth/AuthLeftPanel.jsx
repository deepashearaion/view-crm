import React from 'react';
import './Auth.css';
import { CheckCircle2 } from 'lucide-react';

const AuthLeftPanel = () => {
    return (
        <div className="auth-left">
            <div className="auth-logo">
                <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M70 30C58.9543 30 50 38.9543 50 50C50 61.0457 58.9543 70 70 70C81.0457 70 90 61.0457 90 50C90 38.9543 81.0457 30 70 30Z" stroke="#1E29FF" strokeWidth="12" />
                    <path d="M30 30C18.9543 30 10 38.9543 10 50C10 61.0457 18.9543 70 30 70C36.9189 70 42.997 66.4952 46.464 61" stroke="#1E29FF" strokeWidth="12" strokeLinecap="round" />
                </svg>
                <span>DealConverter</span>
            </div>

            <div className="auth-hero-text">
                <h1>The real definition<br />for <span className="highlight">powerful CRM</span></h1>
            </div>

            <div className="auth-hero-sub">
                AI + CRM + WAPI +<br />Insta Automation
            </div>

            <div className="auth-hero-desc">
                One platform to manage leads, automate conversations, and grow your business.
            </div>

            <div className="auth-features">
                <div className="feature-box">
                    <div style={{ color: '#1E29FF', marginBottom: '8px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </div>
                    <h4>AI-Powered</h4>
                    <p>Smarter Insights</p>
                </div>
                <div className="feature-box">
                    <div style={{ color: '#10B981', marginBottom: '8px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <h4>CRM</h4>
                    <p>Organize Leads</p>
                </div>
                <div className="feature-box">
                    <div style={{ color: '#22c55e', marginBottom: '8px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                    </div>
                    <h4>WhatsApp API</h4>
                    <p>Real-time Chats</p>
                </div>
                <div className="feature-box">
                    <div style={{ color: '#db2777', marginBottom: '8px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                    </div>
                    <h4>Insta Automation</h4>
                    <p>Auto DM</p>
                </div>
            </div>

            <div className="auth-footer-stats">
                <div className="check"><CheckCircle2 size={14} /></div>
                Trusted by <strong>2500+</strong> Businesses
            </div>

            <div className="footer-links">
                <p>© 2025 Rytzu SaaS Technologies Private Limited. All Rights Reserved.</p>
                <div style={{ marginTop: '0.5rem' }}>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                </div>
            </div>
        </div>
    );
};

export default AuthLeftPanel;
