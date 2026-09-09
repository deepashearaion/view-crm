import React, { useState, useRef, useEffect } from 'react';
import './Deals.css';
import { RefreshCw, Plus, Calendar, ChevronDown, List, MoreVertical, Check, Phone, Mail, ArrowUpDown, GripVertical, Pointer } from 'lucide-react';
import OwnerFilter from '../components/dashboard/OwnerFilter';

const mockDeals = [
    { id: 1, title: 'Manali group tour', owner: 'Sahil', value: '126600.00', date: '03/04/2026', initial: 'A', status: 'Closed Won' },
    { id: 2, title: 'manali grp trip', owner: 'mahesh', value: '15000.00', date: '06/04/2026', status: 'Closed Won' }
];

const Deals = () => {
    const [refresh, setRefresh] = useState(false);
    const [priorityOpen, setPriorityOpen] = useState(false);
    const [timeOpen, setTimeOpen] = useState(false);
    const pRef = useRef(null);
    const tRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (pRef.current && !pRef.current.contains(e.target)) {
                setPriorityOpen(false);
            }
            if (tRef.current && !tRef.current.contains(e.target)) {
                setTimeOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRefresh = () => {
        setRefresh(!refresh);
    };

    return (
        <div className="deals-page">

            <div className="deals-toolbar">
                <div className="toolbar-left">
                    <div className="pipeline-selector">
                        <div className="pipeline-icon">S</div>
                        <span>Sales Pipeline</span>
                        <span className="star-icon">⭐</span>
                        <ChevronDown size={14} />
                    </div>
                </div>

                <div className="toolbar-center">
                    <div className="scroll-tip">
                        <List size={12} /> Scroll via
                        <span className="key-hint"><ArrowUpDown size={12} className="hint-icon" /> Shift+Scroll</span>
                        <span className="key-hint"><GripVertical size={12} className="hint-icon" /> Drag bar</span>
                        <span className="key-hint"><Pointer size={12} className="hint-icon" /> 2-finger</span>
                    </div>
                </div>

                <div className="toolbar-right">
                    <div className="owner-filter-wrapper">
                        <OwnerFilter defaultLabel="All Lead Owners" />
                    </div>

                    <button className="icon-action-btn" onClick={handleRefresh}>
                        <RefreshCw size={16} />
                    </button>

                    <button className="add-stage-btn">
                        <Plus size={16} /> Add Stage
                    </button>

                    <button className="reorder-btn">
                        <List size={16} /> Reorder Stages
                    </button>
                </div>
            </div>

            <div className="deals-sub-toolbar">
                <div className="filters-left">
                    <div ref={pRef} className="filter-dropdown-btn" onClick={() => setPriorityOpen(!priorityOpen)}>
                        <span>All Priorities</span>
                        <ChevronDown size={14} />
                        {priorityOpen && (
                            <div className="priority-menu dropdown-menu">
                                <div className="menu-item"><span className="flag low">⚑</span> Low</div>
                                <div className="menu-item"><span className="flag med">⚑</span> Medium</div>
                                <div className="menu-item"><span className="flag high">⚑</span> High</div>
                            </div>
                        )}
                    </div>

                    <div ref={tRef} className="filter-dropdown-btn multi" onClick={() => setTimeOpen(!timeOpen)}>
                        <span className="icon-text"><Calendar size={14} /> All Time</span>
                        <ChevronDown size={14} />
                        {timeOpen && (
                            <div className="time-menu dropdown-menu">
                                <div className="menu-item"><Calendar size={14} /> All Time</div>
                                <div className="menu-item"><Calendar size={14} /> Today</div>
                                <div className="menu-item"><Calendar size={14} /> Yesterday</div>
                                <div className="menu-item"><Calendar size={14} /> This Week</div>
                                <div className="menu-item"><Calendar size={14} /> Last Week</div>
                                <div className="menu-item"><Calendar size={14} /> This Month</div>
                                <div className="menu-item"><Calendar size={14} /> Last Month</div>
                                <div className="menu-item"><Calendar size={14} /> This Year</div>
                                <div className="menu-item"><Calendar size={14} /> Last Year</div>
                                <div className="menu-item"><Calendar size={14} /> Custom</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="metrics-right">
                    <div className="deals-count">10 Deals</div>
                    <div className="deals-value">₹ 560238.00</div>
                </div>
            </div>

            <div className="pipeline-board">
                {/* Column 1 */}
                <div className="pipeline-column">
                    <div className="column-header qual">
                        <div className="col-top">
                            <h3>Qualification</h3>
                            <span className="col-count">0</span>
                        </div>
                        <div className="col-stats">
                            <span className="amount">₹0.00</span>
                            <span className="deals">0 deals</span>
                        </div>
                    </div>
                    <div className="column-body">
                        <div className="empty-state">
                            <div className="ring qual-ring">16%</div>
                            <div className="empty-text">
                                <strong>In Pipeline</strong>
                                <span>Total activity: 0 items</span>
                            </div>
                        </div>
                    </div>
                    <div className="column-footer">
                        <Plus size={14} /> Add Deal
                    </div>
                </div>

                {/* Column 2 */}
                <div className="pipeline-column">
                    <div className="column-header needs">
                        <div className="col-top">
                            <h3>Needs Analysis</h3>
                            <span className="col-count">0</span>
                        </div>
                        <div className="col-stats">
                            <span className="amount">₹0.00</span>
                            <span className="deals">0 deals</span>
                        </div>
                    </div>
                    <div className="column-body">
                        <div className="empty-state">
                            <div className="ring needs-ring">33%</div>
                            <div className="empty-text">
                                <strong>In Pipeline</strong>
                                <span>Total activity: 0 items</span>
                            </div>
                        </div>
                    </div>
                    <div className="column-footer">
                        <Plus size={14} /> Add Deal
                    </div>
                </div>

                {/* Column 3 */}
                <div className="pipeline-column">
                    <div className="column-header prop">
                        <div className="col-top">
                            <h3>Proposal</h3>
                            <span className="col-count">0</span>
                        </div>
                        <div className="col-stats">
                            <span className="amount">₹0.00</span>
                            <span className="deals">0 deals</span>
                        </div>
                    </div>
                    <div className="column-body">
                        <div className="empty-state">
                            <div className="ring prop-ring">50%</div>
                            <div className="empty-text">
                                <strong>In Pipeline</strong>
                                <span>Total activity: 0 items</span>
                            </div>
                        </div>
                    </div>
                    <div className="column-footer">
                        <Plus size={14} /> Add Deal
                    </div>
                </div>

                {/* Column 4 */}
                <div className="pipeline-column">
                    <div className="column-header neg">
                        <div className="col-top">
                            <h3>Negotiation</h3>
                            <span className="col-count">0</span>
                        </div>
                        <div className="col-stats">
                            <span className="amount">₹0.00</span>
                            <span className="deals">0 deals</span>
                        </div>
                    </div>
                    <div className="column-body">
                        <div className="empty-state">
                            <div className="ring neg-ring">66%</div>
                            <div className="empty-text">
                                <strong>In Pipeline</strong>
                                <span>Total activity: 0 items</span>
                            </div>
                        </div>
                    </div>
                    <div className="column-footer">
                        <Plus size={14} /> Add Deal
                    </div>
                </div>

                {/* Column 5: Closed Won */}
                <div className="pipeline-column won">
                    <div className="column-header won">
                        <div className="col-top">
                            <h3>Closed Won</h3>
                            <span className="col-count">2</span>
                        </div>
                        <div className="col-stats">
                            <span className="amount">₹141600.00</span>
                            <span className="deals">2 deals</span>
                        </div>
                    </div>
                    <div className="column-body">
                        <div className="empty-state small-state">
                            <div className="ring won-ring">100%</div>
                            <div className="empty-text">
                                <strong>Closed Won</strong>
                                <span>Total activity: 2 items</span>
                            </div>
                        </div>

                        {mockDeals.map(deal => (
                            <div key={deal.id} className="deal-card">
                                <div className="deal-title-row">
                                    <span className="deal-title">{deal.title}</span>
                                    <span className="flag low">⚑</span>
                                </div>
                                <div className="deal-owner">{deal.owner} •</div>
                                <div className="deal-meta">
                                    <span className="deal-val">₹{deal.value}</span>
                                    <span className="dot">•</span>
                                    <span className="deal-date">{deal.date}</span>
                                </div>
                                <div className="deal-divider"></div>
                                <div className="deal-actions">
                                    <div className="action-icons">
                                        <div className="avatar-circle">A</div>
                                        <div className="icon-circle check"><Check size={10} color="#fff" /></div>
                                        <div className="icon-circle phone"><Phone size={10} color="#10B981" /></div>
                                        <div className="icon-circle mail"><Mail size={10} color="#F59E0B" /></div>
                                    </div>
                                    <MoreVertical size={16} color="#9CA3AF" className="more-action" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="column-footer">
                        <Plus size={14} /> Add Deal
                    </div>
                </div>

                {/* Column 6: Closed Lost */}
                <div className="pipeline-column lost">
                    <div className="column-header lost">
                        <div className="col-top">
                            <h3>Closed Lost</h3>
                            <span className="col-count">0</span>
                        </div>
                        <div className="col-stats">
                            <span className="amount">₹0.00</span>
                            <span className="deals">0 deals</span>
                        </div>
                    </div>
                    <div className="column-body">
                        <div className="empty-state">
                            <div className="ring lost-ring">100%</div>
                            <div className="empty-text">
                                <strong>Closed Lost</strong>
                                <span>Total activity: 0 items</span>
                            </div>
                        </div>
                    </div>
                    <div className="column-footer">
                        <Plus size={14} /> Add Deal
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Deals;
