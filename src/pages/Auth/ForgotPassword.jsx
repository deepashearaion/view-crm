import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, KeyRound, CheckCircle2, ShieldCheck } from 'lucide-react';
import './Auth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Steps: 'email' -> 'option' -> 'reset' -> 'success'
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // If reset token is in URL (e.g. /reset-password?token=xxx), jump to reset step directly
    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setResetToken(urlToken);
            setStep('reset');
        }
    }, [searchParams]);

    // Handle Email submission (Step 1)
    // const handleEmailSubmit = (e) => {
    //     e.preventDefault();
    //     setError('');

    //     if (!email.trim()) {
    //         setError('Please enter your email address.');
    //         return;
    //     }

    //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //     if (!emailRegex.test(email.trim())) {
    //         setError('Please enter a valid email address.');
    //         return;
    //     }

    //     // Navigate to Reset Password option step
    //     setStep('option');
    // };
    const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
        setError('Email is required.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address.');
        return;
    }

    setLoading(true);

    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email.trim(),
            }),
        });

        const contentType = response.headers.get('content-type');

        const data = contentType?.includes('application/json')
            ? await response.json()
            : { message: await response.text() };

        if (!response.ok) {
            setError(data.message || 'Password reset failed.');
            return;
        }

        // console.log('Reset token:', data.reset_token);

        if (data.reset_token) {
            setResetToken(data.reset_token);
        }
        setStep('option');
    } catch (error) {
        console.error('Forgot password error:', error);
        setError('Unable to connect to the server. Please ensure backend is running.');
    } finally {
        setLoading(false);
    }
};

   
const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetToken) {
        setError('Reset token is missing or expired. Please start over from step 1.');
        return;
    }

    if (!newPassword) {
        setError('New password is required.');
        return;
    }

    if (newPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
    }

    if (!confirmPassword) {
        setError('Please confirm your password.');
        return;
    }

    if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
    }

    setLoading(true);
    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: resetToken,
                new_password: newPassword,
            }),
        });

        const contentType = response.headers.get('content-type');

        const data = contentType?.includes('application/json')
            ? await response.json()
            : { message: await response.text() };

        if (!response.ok) {
            setError(data.message || 'Password reset failed.');
            return;
        }

        setSuccess('Password reset successfully.');

        setStep('success');

        setTimeout(() => {
            navigate('/signin');
        }, 2000);
    } catch (error) {
        console.error('Reset password error:', error);
        setError('Unable to connect to the server. Please ensure backend is running.');
    } finally {
        setLoading(false);
    }
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
            {/* Background decorative SVG */}
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

            <div className="auth-right" style={{ zIndex: 1, padding: '1rem', marginTop: '1.5rem', width: 'auto' }}>
                <div className="auth-card" style={{ padding: '2.5rem', width: '450px', maxWidth: '92vw', boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6' }}>
                    
                    {/* 3-Step Dots indicator */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '1.75rem', alignItems: 'center' }}>
                        <div style={{
                            width: step === 'email' ? '22px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            backgroundColor: step === 'email' ? '#1E29FF' : '#10B981',
                            transition: 'all 0.3s'
                        }} title="Step 1: Email"></div>
                        <div style={{
                            width: step === 'option' ? '22px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            backgroundColor: step === 'option' ? '#1E29FF' : (step === 'reset' || step === 'success' ? '#10B981' : '#e5e7eb'),
                            transition: 'all 0.3s'
                        }} title="Step 2: Reset Option"></div>
                        <div style={{
                            width: (step === 'reset' || step === 'success') ? '22px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            backgroundColor: (step === 'reset' || step === 'success') ? '#1E29FF' : '#e5e7eb',
                            transition: 'all 0.3s'
                        }} title="Step 3: New Password"></div>
                    </div>

                    {error && <div className="error-text">{error}</div>}
                    {success && <div className="success-text">{success}</div>}

                    {/* STEP 1: Email ID Mattum (Only Email) */}
                    {step === 'email' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                <div style={{ background: '#EEF2FF', padding: '14px', borderRadius: '50%' }}>
                                    <Lock size={32} color="#1E29FF" strokeWidth={2} />
                                </div>
                            </div>

                            <h2 style={{ fontSize: '1.4rem', color: '#111827', textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600 }}>Forgot Password?</h2>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.75rem', lineHeight: '1.5' }}>
                                Enter your email address to continue to the password reset option.
                            </p>

                            <form onSubmit={handleEmailSubmit}>
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                        Email Address
                                    </label>
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            className="auth-input"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (error) setError('');
                                            }}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
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
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Continue'} <ArrowRight size={18} />
                                </button>
                            </form>
                        </>
                    )}

                    {/* STEP 2: Email kudutha apro Reset Password option poganum */}
                    {step === 'option' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                <div style={{ background: '#ECFDF5', padding: '14px', borderRadius: '50%' }}>
                                    <ShieldCheck size={32} color="#10B981" strokeWidth={2} />
                                </div>
                            </div>

                            <h2 style={{ fontSize: '1.4rem', color: '#111827', textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600 }}>Email Verified</h2>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                Click the Reset Password option below to set your new password.
                            </p>

                            <div style={{
                                background: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                padding: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</div>
                                        <div style={{ fontSize: '0.95rem', color: '#0F172A', fontWeight: 600, wordBreak: 'break-all' }}>{email}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setError('');
                                            setStep('email');
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#1E29FF',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            padding: 0
                                        }}
                                    >
                                        Change
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => {
                                    setError('');
                                    setStep('reset');
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
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
                                    cursor: 'pointer'
                                }}
                            >
                                <KeyRound size={18} /> Reset Password
                            </button>
                        </>
                    )}

                    {/* STEP 3: Atha click panna New Password and Confirm Password vaikanum */}
                    {step === 'reset' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                <div style={{ background: '#EEF2FF', padding: '14px', borderRadius: '50%' }}>
                                    <KeyRound size={32} color="#1E29FF" strokeWidth={2} />
                                </div>
                            </div>

                            <h2 style={{ fontSize: '1.4rem', color: '#111827', textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600 }}>Reset Password</h2>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                Enter your new password and confirm it for <strong style={{ color: '#111827' }}>{email}</strong>
                            </p>

                            <form onSubmit={handlePasswordResetSubmit}>
                                <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                        New Password
                                    </label>
                                    <div className="input-wrapper">
                                        <Lock className="input-icon" size={18} />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            className="auth-input"
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                if (error) setError('');
                                            }}
                                            style={{ paddingRight: '2.75rem' }}
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                                        >
                                            {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                        Confirm Password
                                    </label>
                                    <div className="input-wrapper">
                                        <Lock className="input-icon" size={18} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            className="auth-input"
                                            placeholder="Confirm your new password"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (error) setError('');
                                            }}
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

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
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
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                    disabled={loading}
                                >
                                    <CheckCircle2 size={18} /> {loading ? 'Saving New Password...' : 'Save New Password'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* STEP 4: Success confirmation */}
                    {step === 'success' && (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                                <div style={{ background: '#ECFDF5', padding: '16px', borderRadius: '50%' }}>
                                    <CheckCircle2 size={42} color="#10B981" strokeWidth={2.5} />
                                </div>
                            </div>
                            <h2 style={{ fontSize: '1.4rem', color: '#111827', marginBottom: '0.5rem', fontWeight: 600 }}>Password Reset Complete</h2>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
                                Your password has been successfully updated. You will be redirected to the sign-in page in a moment.
                            </p>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => navigate('/signin')}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    background: '#1E29FF',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                Sign In Now
                            </button>
                        </div>
                    )}

                    {/* Return to Login link */}
                    <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
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
