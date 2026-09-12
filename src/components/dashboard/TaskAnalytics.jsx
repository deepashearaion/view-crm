import React from 'react';
import ChartWidget from './ChartWidget';
import './TaskAnalytics.css';
import { Calendar, ChevronDown, LayoutGrid, List, ClipboardList, AlertTriangle, CheckCircle2, CalendarDays } from 'lucide-react';
import OwnerFilter from './OwnerFilter';

const TaskAnalytics = () => {

    const headerRight = (
        <div className="analytics-actions">
            <div className="view-toggle">
                <button className="view-btn active"><LayoutGrid size={14} /> Cards</button>
                <button className="view-btn"><List size={14} /> Table</button>
            </div>
        </div>
    );

    return (
        <ChartWidget title="Task Analytics" headerRight={headerRight}>

            <div className="task-filters">
                <div className="filter-dropdown date-filter" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', borderRadius: '6px', padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Calendar size={14} className="filter-icon-left" />
                        <span style={{ fontSize: '0.8rem' }}>Today ☆</span>
                    </div>
                    <ChevronDown size={14} className="filter-icon-right" />
                </div>
                <OwnerFilter defaultLabel="All Lead Owners" />
            </div>

            <div className="tasks-grid">
                <div className="task-card" style={{ backgroundColor: '#F59E0B' }}>
                    <div className="task-card-header">
                        <span className="task-card-title">Total Tasks</span>
                        <ClipboardList size={20} color="rgba(255,255,255,0.7)" />
                    </div>
                    <div className="task-card-value">0</div>
                </div>

                <div className="task-card" style={{ backgroundColor: '#3B82F6' }}>
                    <div className="task-card-header">
                        <span className="task-card-title">Overdue Tasks</span>
                        <AlertTriangle size={20} color="rgba(255,255,255,0.7)" />
                    </div>
                    <div className="task-card-value">0</div>
                </div>

                <div className="task-card" style={{ backgroundColor: '#EC4899' }}>
                    <div className="task-card-header">
                        <span className="task-card-title">Completed<br />Tasks</span>
                        <CheckCircle2 size={20} color="rgba(255,255,255,0.7)" />
                    </div>
                    <div className="task-card-value">0</div>
                </div>

                <div className="task-card" style={{ backgroundColor: '#10B981' }}>
                    <div className="task-card-header">
                        <span className="task-card-title">Upcoming<br />Tasks</span>
                        <CalendarDays size={20} color="rgba(255,255,255,0.7)" />
                    </div>
                    <div className="task-card-value" style={{ opacity: 0, height: '36px' }}>0</div> {/* Placeholder for cropped bottom */}
                </div>
            </div>

        </ChartWidget>
    );
};

export default TaskAnalytics;
