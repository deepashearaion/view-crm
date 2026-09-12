import React from 'react';
import './ChartWidget.css';

const ChartWidget = ({ title, headerRight, children, footer }) => {
    return (
        <div className="chart-widget">
            <div className="chart-widget-header">
                <h3 className="chart-widget-title">{title}</h3>
                {headerRight && <div className="chart-widget-actions">{headerRight}</div>}
            </div>
            <div className="chart-widget-content">
                {children}
            </div>
            {footer && <div className="chart-widget-footer">{footer}</div>}
        </div>
    );
};

export default ChartWidget;
