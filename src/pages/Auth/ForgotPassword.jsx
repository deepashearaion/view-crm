import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import './Auth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle password reset request logic here
        // The user hasn't specified complex logic, just that return to login should go to login page
        // But for completeness, maybe simulate a success state or just redirect. We will keep it simple.
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            alignItems: 'center',
            fontFamily: "'Inter', sans-serif",
            backgroundColor: '#fff',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background representation for the wavy pattern seen in screenshots */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                zIndex: 0
            }}>
                <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.8 }}>
                    <path fill="#fdf0f7" d="M0,0 C300,50 400,200 0,600 Z" />
                    <path fill="#f3ebfc" d="M1000,1000 C600,900 700,500 1000,300 Z" />
                    <circle cx="950" cy="750" r="100" fill="none" stroke="#e5e7eb" strokeWidth="20" strokeLinecap="round" strokeDasharray="10 20" />
                </svg>
            </div>

            {/* Logo area */}
            <div style={{ marginTop: '2.5rem', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M70 30C58.9543 30 50 38.9543 50 50C50 61.0457 58.9543 70 70 70C81.0457 70 90 61.0457 90 50C90 38.9543 81.0457 30 70 30Z" stroke="#1E29FF" strokeWidth="12" />
                        <path d="M30 30C18.9543 30 10 38.9543 10 50C10 61.0457 18.9543 70 30 70C36.9189 70 42.997 66.4952 46.464 61" stroke="#1E29FF" strokeWidth="12" strokeLinecap="round" />
                    </svg>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>DealConverter</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>CRM</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right', width: '100%', marginTop: '4px', paddingRight: '2px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>Revenue Booster</span>
                </div>
            </div>

            <div className="auth-right" style={{ zIndex: 1, padding: 0, marginTop: '2.5rem' }}>
                <div className="auth-card" style={{ padding: '3rem', width: '450px', boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6' }}>
                    {/* Dots indicator */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '2rem' }}>
                        <div style={{ width: '20px', height: '6px', borderRadius: '4px', backgroundColor: '#1E29FF' }}></div>
                        <div style={{ width: '6px', height: '6px', borderRadius: '4px', backgroundColor: '#e5e7eb' }}></div>
                        <div style={{ width: '6px', height: '6px', borderRadius: '4px', backgroundColor: '#e5e7eb' }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Lock size={32} color="#1E29FF" strokeWidth={2} />
                    </div>

                    <h2 style={{ fontSize: '1.4rem', color: '#111827', textAlign: 'center', marginBottom: '1rem', fontWeight: 600 }}>Forgot Password?</h2>
                    <p style={{ color: '#6b7280', fontSize: '0.95rem', textAlign: 'center', marginBottom: '2rem', lineHeight: '1.5' }}>
                        Enter your email and we'll send you a code to reset your password.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                Email Address
                            </label>
                            <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Mail className="input-icon" size={18} style={{ position: 'absolute', left: '1rem', color: '#9ca3af' }} />
                                <input
                                    type="email"
                                    name="email"
                                    className="auth-input"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.8rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        backgroundColor: '#fafafa'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: '#1E29FF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: 500,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                marginTop: '1rem'
                            }}
                        >
                            Send Code <ArrowRight size={18} />
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Link
                            to="/signin"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: '#6b7280',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}
                        >
                            <ArrowLeft size={16} /> Return to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
