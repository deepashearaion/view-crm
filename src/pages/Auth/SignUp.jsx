import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import AuthLeftPanel from './AuthLeftPanel';
import './Auth.css';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ phone: '', agree: false });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.phone) {
            setError('Phone number is required.');
            return;
        }
        if (!formData.agree) {
            setError('You must agree to the Terms of Service.');
            return;
        }

        // Simulate Signup (in real app, use auth API)
        localStorage.setItem('currentUser', JSON.stringify({ phone: formData.phone, name: 'New User' }));
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

                    <h2>Create Account</h2>
                    <p>Verify your phone number via WhatsApp</p>

                    {error && <div className="error-text">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <div className="phone-input">
                                <div className="phone-code">
                                    <img src="https://flagcdn.com/w20/in.png" alt="India" width="20" />
                                    +91 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                                <div className="input-wrapper" style={{ flex: 1 }}>
                                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                                    <input
                                        type="text"
                                        name="phone"
                                        className="auth-input"
                                        placeholder="123 456 7890"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                name="agree"
                                id="agree"
                                checked={formData.agree}
                                onChange={handleChange}
                            />
                            <label htmlFor="agree">
                                <p>By continuing, I acknowledge that I have read and agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>
                            </label>
                        </div>

                        <button type="submit" className="btn-primary">
                            <MessageSquare size={18} /> Send Verification Code
                        </button>
                    </form>

                    <div className="auth-divider">or</div>

                    <div className="signup-link">
                        Already have an account? <Link to="/signin">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
