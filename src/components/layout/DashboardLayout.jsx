import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children, currentPage, setCurrentPage }) => {
    // Open for 2 seconds then auto-collapses
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Auto-open sidebar for 2 seconds on page change or initial load, then collapses
    useEffect(() => {
        setIsCollapsed(false);
    }, [currentPage]);

    const getHeaderTitle = (page) => {
        if (page === 'Deals') return 'Deals or Pipelines';
        if (page === 'Call Logs' || page === 'Call Recordings') return 'Call Recordings';
        if (page === 'Companies' || page === 'Add Company') return 'Companies';
        if (page === 'Bulk Import') return 'Bulk Import';
        if (page === 'Contacts') return 'Contacts';
        if (page === 'Activities') return 'Activities';
        if (page === 'Attendance') return 'Remote Attendance';
        if (page === 'Reports') return 'Reports';
        if (page === 'File Cabinet') return 'File Cabinet';
        if (page === 'Quotation') return 'Quotation';
        if (page === 'Invoice') return 'Invoice';
        if (page === 'Products & Services') return 'Products & Services';
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
