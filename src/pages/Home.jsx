import React, { useState, useEffect } from 'react';
import './Home.css';
import { TrendingUp, RefreshCw, ChevronDown, SlidersHorizontal } from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import DateFilter from '../components/dashboard/DateFilter';
import OwnerFilter from '../components/dashboard/OwnerFilter';
import ContactLeadChart from '../components/dashboard/ContactLeadChart';
import ARRMRRChart from '../components/dashboard/ARRMRRChart';
import CallAnalytics from '../components/dashboard/CallAnalytics';
import TaskAnalytics from '../components/dashboard/TaskAnalytics';
import EmailStats from '../components/dashboard/EmailStats';
import MeetingDashboard from '../components/dashboard/MeetingDashboard';
import TBasedCallAnalytics from '../components/dashboard/TBasedCallAnalytics';
import { getValidToken, DEFAULT_DEV_TOKEN } from '../utils/auth';

const Home = ({ setCurrentPage }) => {
    const [salesData, setSalesData] = useState({
        total_open_deals: 0,
        total_open_deal_value: 0,
        total_won: 0,
        total_loss: 0,
        total_new_customers: 0,
        total_arr: 0,
        total_mrr: 0
    });
    const [contacts, setContacts] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState('Today');
    const [selectedOwner, setSelectedOwner] = useState('All Lead Owners');

    const fetchDashboardData = async (isManual = false) => {
        if (isManual) setIsRefreshing(true);
        const token = getValidToken();

        try {
            // 1. Fetch Sales Dashboard metrics (deals, won, loss, arr, mrr)
            let salesRes = await fetch('/api/dashboard/sales', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (salesRes.status === 401) {
                localStorage.setItem('token', DEFAULT_DEV_TOKEN);
                salesRes = await fetch('/api/dashboard/sales', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${DEFAULT_DEV_TOKEN}`
                    }
                });
            }

            if (salesRes.ok) {
                const data = await salesRes.json();
                setSalesData(data);
            }

            // 2. Fetch Contacts for Contact Lead Status Chart
            let contactsRes = await fetch('/api/contacts', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (contactsRes.status === 401) {
                contactsRes = await fetch('/api/contacts', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${DEFAULT_DEV_TOKEN}`
                    }
                });
            }

            if (contactsRes.ok) {
                const cData = await contactsRes.json();
                if (cData?.contacts && Array.isArray(cData.contacts)) {
                    setContacts(cData.contacts);
                }
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            if (isManual) setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData(false);
    }, []);

    // Format currency to match design (e.g. ₹418638.00)
    const formatCurrency = (val) => {
        const num = Number(val) || 0;
        return `₹${num.toFixed(2)}`;
    };

    const kpiItems = [
        {
            title: 'Total Open Deals',
            value: formatCurrency(salesData.total_open_deal_value),
            percentage: '+0%',
            addon: '+ 0.00',
            trend: 'up'
        },
        {
            title: 'Total Won',
            value: formatCurrency(salesData.total_won),
            percentage: '+0%',
            addon: '+ 0.00',
            trend: 'up'
        },
        {
            title: 'Total Loss',
            value: formatCurrency(salesData.total_loss),
            percentage: '+0%',
            addon: '+ 0.00',
            trend: 'up'
        },
        {
            title: 'Total New Customers',
            value: String(salesData.total_new_customers ?? 0),
            percentage: '+0%',
            addon: '+ 0.00',
            trend: 'up'
        }
    ];

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
                        onClick={() => fetchDashboardData(true)}
                        title="Refresh Data"
                    >
                        <RefreshCw size={15} color="#4B5563" className={isRefreshing ? 'spin' : ''} />
                    </button>

                    <DateFilter defaultValue={selectedDate} onChange={setSelectedDate} />

                    <div style={{ minWidth: '150px' }}>
                        <OwnerFilter defaultLabel={selectedOwner} onSelect={setSelectedOwner} />
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
                {kpiItems.map((kpi, idx) => (
                    <KPICard key={idx} {...kpi} />
                ))}
            </div>

            {/* Top Charts Grid */}
            <div className="charts-grid-row">
                <ContactLeadChart contacts={contacts} />
                <ARRMRRChart totalARR={salesData.total_arr} totalMRR={salesData.total_mrr} />
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
