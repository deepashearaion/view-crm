import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children, currentPage, setCurrentPage }) => {
    // Default to true (collapsed) matching the user's reference screenshot
    const [isCollapsed, setIsCollapsed] = useState(true);

    const getHeaderTitle = (page) => {
        if (page === 'Deals') return 'Deals or Pipelines';
        if (page === 'Call Logs') return 'Call logs';
        if (page === 'Companies' || page === 'Add Company') return 'Companies';
        if (page === 'Bulk Import') return 'Bulk Import';
        if (page === 'Contacts') return 'Contacts';
        if (page === 'Activities') return 'Activities';
        if (page === 'Attendance') return 'Remote Attendance';
        if (page === 'Reports') return 'Reports';
        if (page === 'File Cabinet') return 'File Cabinet';
        if (page === 'Quotation') return 'Quotation';
        if (page === 'Invoice') return 'Invoice';
        if (page === 'Home') return 'Home';
        return page;
    };

    return (
        <div className="app-container">
            <Sidebar
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            <div className="main-content">
                <Header title={getHeaderTitle(currentPage)} />
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
