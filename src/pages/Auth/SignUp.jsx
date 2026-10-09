import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthLeftPanel from './AuthLeftPanel';
import './Auth.css';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.name.trim()) {
            setError('Full name is required.');
            return;
        }

        if (!formData.email.trim()) {
            setError('Email address is required.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!formData.password) {
            setError('Password is required.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (!formData.confirmPassword) {
            setError('Please confirm your password.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                }),
            });

            const contentType = response.headers.get('content-type');
            const data = contentType?.includes('application/json')
                ? await response.json()
                : { message: await response.text() };

            console.log('Signup response:', data);

            if (!response.ok) {
                setError(data.message || 'Registration failed.');
                return;
            }

            setSuccess('Account created successfully! Redirecting to sign in...');

            setTimeout(() => {
                navigate('/signin');
            }, 1200);

        } catch (error) {
            console.error('Signup error:', error);
            setError('Unable to connect to the server. Please ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <AuthLeftPanel />

            <div className="auth-right">
                <div className="auth-card" style={{ maxWidth: '480px' }}>
                    <div className="auth-card-banner" style={{ height: '80px', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ background: '#fff', padding: '8px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E29FF" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            </div>
                            <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M70 30C58.9543 30 50 38.9543 50 50C50 61.0457 58.9543 70 70 70C81.0457 70 90 61.0457 90 50C90 38.9543 81.0457 30 70 30Z" stroke="#1E29FF" strokeWidth="12" />
                                    <path d="M30 30C18.9543 30 10 38.9543 10 50C10 61.0457 18.9543 70 30 70C36.9189 70 42.997 66.4952 46.464 61" stroke="#1E29FF" strokeWidth="12" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div style={{ background: '#fff', padding: '8px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                        </div>
                    </div>

                    <h2>Create Account</h2>
                    <p style={{ marginBottom: '1.25rem' }}>Sign up to get started with DealConverter CRM</p>

                    {error && <div className="error-text">{error}</div>}
                    {success && <div className="success-text">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                            <label>Full Name</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    className="auth-input"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '0.9rem' }}>
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

                        <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="auth-input"
                                    placeholder="Create password (min. 6 characters)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    style={{ paddingRight: '2.75rem' }}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                            <label>Confirm Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    className="auth-input"
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    style={{ paddingRight: '2.75rem' }}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                >
                                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1.25rem', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
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
