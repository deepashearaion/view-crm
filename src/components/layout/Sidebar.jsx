import React, { useState } from 'react';
import './Sidebar.css';
import {
    Home,
    DollarSign,
    Users,
    Building2,
    CheckCircle2,
    FileText,
    MessagesSquare,
    MessageCircle,
    Megaphone,
    TrendingUp,
    Bot,
    Calendar,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: DollarSign, label: 'Deals' },
    { icon: Users, label: 'Contacts' },
    { icon: Building2, label: 'Companies' },
    { icon: CheckCircle2, label: 'Activities' },
    { icon: FileText, label: 'Quotation' },
    { icon: MessagesSquare, label: 'Team Inbox' },
    { icon: MessageCircle, label: 'Whatsapp AutoResponder' },
    { icon: Megaphone, label: 'Whatsapp Campaign' },
    { icon: TrendingUp, label: 'Lead Nurturing' },
    { icon: Bot, label: 'Chatbot' },
    { icon: Calendar, label: 'Attendance' },
];

const Sidebar = ({ currentPage, setCurrentPage, isCollapsed, setIsCollapsed }) => {
    const timeoutRef = React.useRef(null);

    const handleItemClick = (label) => {
        if (setCurrentPage) {
            setCurrentPage(label);
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Always expand to show the text first when an item is clicked
        setIsCollapsed(false);

        // If it's not Home, collapse it back after 2 seconds
        if (label !== 'Home') {
            timeoutRef.current = setTimeout(() => {
                setIsCollapsed(true);
            }, 2000);
        }
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-logo">
                <div className="logo-icon">♾️</div>
                {!isCollapsed && <span className="logo-text">DealConverter</span>}
            </div>

            <nav className="sidebar-nav">
                <ul>
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = currentPage ? currentPage === item.label : item.active;
                        return (
                            <li
                                key={index}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => handleItemClick(item.label)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="nav-item-content">
                                    <Icon size={20} className="nav-icon" />
                                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
