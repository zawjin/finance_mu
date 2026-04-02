import React from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Gem, Settings, Plus } from 'lucide-react';
import SidebarLink from './SidebarLink';

export default function TopNavbar({ onAdd }) {
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
                        <button className="btn-primary-mini" onClick={onAdd}>
                            <Plus size={16} /> <span style={{ marginLeft: '0.4rem' }}>Sync Record</span>
                        </button>
                    )}
                    <div className="user-profile-mini">SV</div>
                </div>
            </div>
        </nav>
    );
}
