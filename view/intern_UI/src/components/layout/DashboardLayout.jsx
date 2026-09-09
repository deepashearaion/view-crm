import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children, currentPage, setCurrentPage }) => {
    // Lift state up to allow main-content clicks to collapse sidebar
    const [isCollapsed, setIsCollapsed] = useState(true);

    const getHeaderTitle = (page) => {
        if (page === 'Deals') return 'Deals or Pipelines';
        if (page === 'Call Logs') return 'Call logs';
        if (page === 'Companies') return 'Companies';
        if (page === 'Contacts') return 'Contacts';
        if (page === 'Activities') return 'Activities';
        if (page === 'Quotation') return 'Quotation';
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
            <div
                className="main-content"
                onClick={() => {
                    if (!isCollapsed) setIsCollapsed(true);
                }}
            >
                <Header title={getHeaderTitle(currentPage)} />
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
