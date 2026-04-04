import React from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Gem, Settings, Plus, BarChart2 } from 'lucide-react';
import SidebarLink from './SidebarLink';

export default function TopNavbar({ onAdd, showAnalytics, onToggleAnalytics }) {
    const location = useLocation();
    
    return (
        <nav className="top-navbar">
            <div className="nav-container">
                <div className="logo cursor-pointer" onClick={() => window.location.href = '/'}>FRIDAY</div>

                <div className="nav-links-horizontal">
                    <SidebarLink to="/" icon={<LayoutDashboard size={18} />} label="Live Feed" />
                    <SidebarLink to="/spending" icon={<Wallet size={18} />} label="Audit" />
                    <SidebarLink to="/investments" icon={<Gem size={18} />} label="Portfolios" />
                    <SidebarLink to="/categories" icon={<Settings size={18} />} label="Config" />
                </div>

                <div className="nav-actions">
                    {location.pathname === '/spending' && (
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <button 
                                className={`btn-secondary-mini ${showAnalytics ? 'active' : ''}`} 
                                onClick={onToggleAnalytics}
                                style={{ 
                                    background: showAnalytics ? 'rgba(0,113,227,0.1)' : 'rgba(0,0,0,0.04)',
                                    color: showAnalytics ? '#0071e3' : 'var(--text-dim)',
                                    border: 'none',
                                    padding: '0.55rem 1rem',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                            >
                                <BarChart2 size={16} fill={showAnalytics ? "currentColor" : "none"} style={{ opacity: 0.8 }} />
                                <span>Visualisation</span>
                            </button>

                            <button className="btn-primary-mini" onClick={onAdd}>
                                <Plus size={16} /> <span style={{ marginLeft: '0.4rem' }}>Sync Record</span>
                            </button>
                        </div>
                    )}
                    <div className="user-profile-mini">SV</div>
                </div>
            </div>
        </nav>
    );
}
