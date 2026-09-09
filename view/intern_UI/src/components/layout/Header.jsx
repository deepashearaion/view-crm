import React from 'react';
import './Header.css';
import { Bell } from 'lucide-react';

const Header = ({ title = 'Home' }) => {
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

                <div className="notifications">
                    <Bell size={20} className="bell-icon" />
                </div>

                <div className="user-profile">
                    <div className="avatar">
                        {/* Using a placeholder for avatar */}
                        <img src="https://ui-avatars.com/api/?name=Arun&background=1E29FF&color=fff" alt="User" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
