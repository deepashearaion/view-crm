import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, EyeOff, Eye, ArrowRight } from 'lucide-react';
import AuthLeftPanel from './AuthLeftPanel';
import './Auth.css';

const SignIn = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setError('Email and password are required.');
            return;
        }

        // Simulate Login (in real app, use auth API)
        localStorage.setItem('currentUser', JSON.stringify({ email: formData.email, name: 'Arun' }));
        navigate('/dashboard');
    };

    return (
        <div className="auth-page">
            <AuthLeftPanel />

            <div className="auth-right">
                <div className="auth-card">
                    <div className="auth-card-banner">
                        {/* Banner Placeholder */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ background: '#fff', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E29FF" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            </div>
                            <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M70 30C58.9543 30 50 38.9543 50 50C50 61.0457 58.9543 70 70 70C81.0457 70 90 61.0457 90 50C90 38.9543 81.0457 30 70 30Z" stroke="#1E29FF" strokeWidth="12" />
                                    <path d="M30 30C18.9543 30 10 38.9543 10 50C10 61.0457 18.9543 70 30 70C36.9189 70 42.997 66.4952 46.464 61" stroke="#1E29FF" strokeWidth="12" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div style={{ background: '#fff', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                        </div>
                    </div>

                    <h2>Welcome Back</h2>
                    <p>Sign in to continue to DealConverter CRM</p>

                    {error && <div className="error-text">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    className="auth-input"
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="auth-input"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                            <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
                        </div>

                        <button type="submit" className="btn-primary">
                            Sign In <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className="auth-divider">or</div>

                    <div className="signup-link">
                        Don't have an account? <Link to="/signup">Sign up</Link>
                    </div>

                    <div className="meta-partner">
                        <svg viewBox="0 0 36 36" width="36" height="36" fill="#1E29FF">
                            <path d="M18 0C8.06 0 0 8.06 0 18s8.06 18 18 18 18-8.06 18-18S27.94 0 18 0zm7.1 23h-2.2c-.8 0-1.4-.6-1.4-1.4v-4.2c0-.5-.4-.9-.9-.9s-.9.4-.9.9v4.2c0 .8-.6 1.4-1.4 1.4h-2.2c-.8 0-1.4-.6-1.4-1.4v-6.5c0-.8.6-1.4 1.4-1.4h2.2c.8 0 1.4.6 1.4 1.4v.8c.6-1 1.7-1.6 3-1.6 2.3 0 4.1 1.9 4.1 4.2v4.7c0 .8-.6 1.4-1.4 1.4z" />
                        </svg>
                        Meta Business Partner
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#6b7280', marginTop: '1rem' }}>
                        By signing in, you agree to our <a href="#" style={{ color: '#1E29FF' }}>Terms of Service</a> and <a href="#" style={{ color: '#1E29FF' }}>Privacy Policy</a>.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
