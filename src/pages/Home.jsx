import React, { useState } from 'react';
import './Home.css';
import { TrendingUp, RefreshCw, ChevronDown, SlidersHorizontal } from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import { kpiData } from '../mockData/dashboardData';

import DateFilter from '../components/dashboard/DateFilter';
import OwnerFilter from '../components/dashboard/OwnerFilter';
import ContactLeadChart from '../components/dashboard/ContactLeadChart';
import ARRMRRChart from '../components/dashboard/ARRMRRChart';
import CallAnalytics from '../components/dashboard/CallAnalytics';
import TaskAnalytics from '../components/dashboard/TaskAnalytics';
import EmailStats from '../components/dashboard/EmailStats';
import MeetingDashboard from '../components/dashboard/MeetingDashboard';
import TBasedCallAnalytics from '../components/dashboard/TBasedCallAnalytics';

const Home = ({ setCurrentPage }) => {
    const [refresh, setRefresh] = useState(false);

    return (
        <div className="home-container">
            {/* Sales Dashboard Sub-Header & Controls */}
            <div className="dashboard-subnav-row">
                <div className="dashboard-tab-active">
                    <TrendingUp size={19} className="dashboard-tab-icon" />
                    <span className="dashboard-tab-title">Sales Dashboard</span>
                    <ChevronDown size={16} className="dashboard-tab-chevron" />
                    <div className="dashboard-tab-indicator" />
                </div>

                <div className="dashboard-subnav-actions">
                    <button
                        type="button"
                        className="subnav-btn refresh-circle-btn"
                        onClick={() => setRefresh(!refresh)}
                        title="Refresh Data"
                    >
                        <RefreshCw size={15} color="#4B5563" className={refresh ? 'spin' : ''} />
                    </button>

                    <DateFilter defaultValue="Today" />

                    <div style={{ minWidth: '150px' }}>
                        <OwnerFilter defaultLabel="All Lead Owners" />
                    </div>

                    <button
                        type="button"
                        className="subnav-btn sliders-square-btn"
                        title="Filter Options"
                    >
                        <SlidersHorizontal size={15} color="#4B5563" style={{ transform: 'rotate(90deg)' }} />
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="kpi-grid">
                {kpiData.map((kpi, idx) => (
                    <KPICard key={idx} {...kpi} />
                ))}
            </div>

            {/* Top Charts Grid */}
            <div className="charts-grid-row">
                <ContactLeadChart />
                <ARRMRRChart />
            </div>

            {/* Secondary Analytics */}
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
                <div style={{ flex: 1 }}></div>
            </div>
        </div>
    );
};

export default Home;
