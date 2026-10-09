import React from 'react';
import './KPICard.css';
import { ArrowUp, ArrowDown } from 'lucide-react';

const KPICard = ({ title, value, percentage, addon, trend = 'up' }) => {
    return (
        <div className="kpi-card">
            <h3 className="kpi-title">{title}</h3>
            <div className="kpi-value">{value}</div>
            <div className="kpi-footer">
                <div className={`kpi-badge ${trend === 'up' ? 'positive' : 'negative'}`}>
                    {trend === 'up' ? (
                        <ArrowUp size={12} strokeWidth={2.5} />
                    ) : (
                        <ArrowDown size={12} strokeWidth={2.5} />
                    )}
                    <span>{percentage}</span>
                </div>
                <span className="kpi-addon">{addon}</span>
            </div>
        </div>
    );
};

export default KPICard;
