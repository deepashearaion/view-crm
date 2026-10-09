export const kpiData = [
    {
        title: 'Total Open Deals',
        value: '₹418638.00',
        percentage: '+0%',
        addon: '+ 0.00',
        trend: 'up'
    },
    {
        title: 'Total Won',
        value: '₹0.00',
        percentage: '+0%',
        addon: '+ 0.00',
        trend: 'up'
    },
    {
        title: 'Total Loss',
        value: '₹0.00',
        percentage: '+0%',
        addon: '+ 0.00',
        trend: 'up'
    },
    {
        title: 'Total New Customers',
        value: '0',
        percentage: '+0%',
        addon: '+ 0.00',
        trend: 'up'
    }
];

export const taskAnalytics = [
    { id: 'total', title: 'Total Tasks', value: 0, color: '#f59e0b', icon: 'clipboard' },
    { id: 'overdue', title: 'Overdue Tasks', value: 0, color: '#3b82f6', icon: 'alert' },
    { id: 'completed', title: 'Completed Tasks', value: 0, color: '#ec4899', icon: 'check' },
    { id: 'upcoming', title: 'Upcoming Tasks', value: 0, color: '#10b981', icon: 'clock' } // The green one is partially hidden, inferring 0
];

export const callAnalyticsStats = {
    averageDuration: '0s',
    totalTalkTime: '0s',
    totalCalls: 0,
    connectedCalls: 0,
    outboundCalls: 0,
    outboundConnected: 0,
    inboundCalls: 0
};
