import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import { Bell, Settings, LogIn, Coffee, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ title = 'Home' }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/signin');
    };

    return (
        <header className="header">
            <div className="header-left">
                <h1 className="header-title">{title}</h1>
            </div>

            <div className="header-right">
                <div className="helpdesk-info">
                    <div className="helpdesk-text">DealConverter Helpline: support@dealconverter.com!</div>
                    <div className="helpdesk-subtext">Mon - Fri • 9:00 AM - 7:00 PM</div>
                </div>

                <div className="welcome-msg">
                    👋 Welcome , Arun!
                </div>

                <div className="notifications" style={{ position: 'relative' }}>
                    <Bell size={20} className="bell-icon" />
                    <span className="notif-badge">31</span>
                </div>

                <div
                    className="user-profile"
                    ref={dropdownRef}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                    title="Account options"
                >
                    <div className="avatar">
                        <div className="header-avatar-circle">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 2L4 6v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V6l-8-4z"
                                    fill="#1D4ED8"
                                    stroke="#60A5FA"
                                    strokeWidth="1.2"
                                />
                                <path
                                    d="M9 12l2 2 4-4"
                                    stroke="#FFFFFF"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>

                    {dropdownOpen && (
                        <div className="profile-menu">
                            <div className="profile-menu-header">
                                <div className="header-avatar-circle" style={{ width: 36, height: 36 }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2L4 6v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V6l-8-4z" fill="#1D4ED8" />
                                        <path d="M9 12l2 2 4-4" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="company-name">Ivory Holidays</div>
                                    <div className="view-account">Go to my account</div>
                                </div>
                            </div>
                            <div className="menu-itemList">
                                <div className="menu-item">
                                    <Settings size={16} /> <span>Settings</span>
                                </div>
                                <div className="menu-item check-in-btn">
                                    <LogIn size={16} /> <span>Check In</span>
                                </div>
                                <div className="menu-item breaks-dropdown">
                                    <div className="breaks-flex">
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <Coffee size={16} /> <span>Breaks</span>
                                        </div>
                                        <ChevronDown size={14} />
                                    </div>
                                </div>
                                <div className="menu-divider"></div>
                                <div className="menu-item logout-btn" onClick={handleLogout}>
                                    <LogOut size={16} /> <span>Logout</span>
                                </div>
                            </div>
                            <div className="menu-footer">
                                <span>Privacy Policy</span>
                                <span>•</span>
                                <span>Terms of Service</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
