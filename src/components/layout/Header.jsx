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
                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#EF4444', color: 'white', borderRadius: '50%', fontSize: '10px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>31</span>
                </div>

                <div className="user-profile" ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: 'pointer', position: 'relative' }}>
                    <div className="avatar" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <img src="https://ui-avatars.com/api/?name=Arun&background=1E29FF&color=fff" alt="User" />
                        <ChevronDown size={14} color="#6B7280" />
                    </div>

                    {dropdownOpen && (
                        <div className="profile-menu">
                            <div className="profile-menu-header">
                                <img src="https://ui-avatars.com/api/?name=Ivory&background=1E29FF&color=fff" alt="Ivory" />
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
