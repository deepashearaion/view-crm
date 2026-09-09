import React, { useState } from 'react';
import './Home.css';
import { LayoutGrid, RefreshCw, Calendar, ChevronDown, SlidersHorizontal } from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import { kpiData } from '../mockData/dashboardData';

import ContactLeadChart from '../components/dashboard/ContactLeadChart';
import ARRMRRChart from '../components/dashboard/ARRMRRChart';
import CallAnalytics from '../components/dashboard/CallAnalytics';
import TaskAnalytics from '../components/dashboard/TaskAnalytics';
import EmailStats from '../components/dashboard/EmailStats';
import MeetingDashboard from '../components/dashboard/MeetingDashboard';
import TBasedCallAnalytics from '../components/dashboard/TBasedCallAnalytics';
import OwnerFilter from '../components/dashboard/OwnerFilter';

const Home = ({ setCurrentPage }) => {
    const [refresh, setRefresh] = useState(false);
    return (
        <div className="home-container">
            {/* Dashboard Headline & Filters */}
            <div className="dashboard-header-row">
                <div className="dashboard-title-group">
                    <div className="dashboard-icon-bg">
                        <LayoutGrid size={24} className="dashboard-icon" />
                    </div>
                    <h2 className="dashboard-main-title">Dashboard</h2>
                </div>

                <div className="dashboard-filters">
                    <button className="icon-btn outline" style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#F8FAFC', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setRefresh(!refresh)}>
                        <RefreshCw size={14} color="#6B7280" />
                    </button>

                    <div className="filter-dropdown date-filter">
                        <Calendar size={14} className="filter-icon-left" />
                        <span style={{ fontSize: '0.85rem' }}>Today ☆</span>
                        <ChevronDown size={14} className="filter-icon-right" />
                    </div>

                    <div style={{ minWidth: '150px' }}>
                        <OwnerFilter defaultLabel="All Lead Owners" />
                    </div>

                    <button className="icon-btn outline" style={{ backgroundColor: '#F8FAFC', padding: 6 }}>
                        <SlidersHorizontal size={14} color="#6B7280" style={{ transform: 'rotate(90deg)' }} />
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="kpi-grid">
                {kpiData.map((kpi, idx) => (
                    <KPICard key={idx} {...kpi} />
                ))}
            </div>

            {/* Content Grids */}
            <div className="charts-grid-row">
                <ContactLeadChart />
                <ARRMRRChart />
            </div>

            <div className="charts-grid-row">
                <CallAnalytics setCurrentPage={setCurrentPage} />
                <TaskAnalytics />
            </div>

            <div className="charts-grid-row">
                <EmailStats />
                <MeetingDashboard />
            </div>

            <div className="charts-grid-row">
                <TBasedCallAnalytics />
                <div style={{ flex: 1 }}></div> {/* Empty column filler */}
            </div>
        </div>
    );
};

export default Home;
