import React, { useState } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, Gem, Settings, Plus, BarChart2, Sparkles, Search, Bell, User, Handshake, Globe, Banknote, Bookmark, Activity, CreditCard } from 'lucide-react';
import './TopNavbar.scss';

export default function TopNavbar({ onAdd, onOpenAiModal, onToggleAnalytics, showAnalytics }) {
    const location = useLocation();
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <nav className="top-navbar-root">
            {/* LOGO & BRAND */}
            <div className="nav-brand-wrap">
                <div onClick={() => window.location.href = '/'} className="nav-logo-brand">
                    <div className="logo-square-icon">
                        <div className="logo-inner-rect"></div>
                    </div>
                    FRIDAY
                </div>

                {/* NAV LINKS - RESPONSIVE SCROLLABLE ON MOBILE */}
                <div className="nav-links-scrollable">
                    <ClassicNavLink to="/" label="DASHBOARD" icon={<LayoutDashboard size={16} />} />
                    <ClassicNavLink to="/spending" label="AUDIT" icon={<Wallet size={16} />} />
                    <ClassicNavLink to="/reserves" label="CASH" icon={<Banknote size={16} />} />
                    <ClassicNavLink to="/investments" label="ASSETS" icon={<Gem size={16} />} />
                    <ClassicNavLink to="/fixed-expenses" label="FIXED" icon={<Bookmark size={16} />} />
                    <ClassicNavLink to="/categories" label="CONFIG" icon={<Settings size={16} />} />
                </div>
            </div>

            {/* ACTION SECTION */}
            <div className="action-cluster-nav">


                <div className="nav-action-group">
                    <button
                        onClick={onOpenAiModal}
                        className="btn-ai-analyst"
                    >
                        <Sparkles size={16} color="#fb923c" /> AI ANALYST
                    </button>

                    {(location.pathname === '/spending' || location.pathname === '/investments' || location.pathname === '/fixed-expenses') && (
                        <>
                            {(location.pathname !== '/fixed-expenses') && (
                                <button
                                    onClick={onToggleAnalytics}
                                    className={`btn-toggle-analytics ${showAnalytics ? 'active' : 'inactive'}`}
                                >
                                    <BarChart2 size={18} />
                                </button>
                            )}
                            <button
                                onClick={onAdd}
                                className="btn-sync-global"
                            >
                                <Plus size={16} /> SYNC {location.pathname === '/investments' ? 'ASSET' : (location.pathname === '/fixed-expenses' ? 'EXPENSE' : (location.pathname === '/reserves' ? 'ACCOUNT' : 'LOG'))}
                            </button>
                        </>
                    )}
                </div>

                <div className="nav-profile-group">
                    <div className="nav-icon-badge"><Bell size={20} /></div>
                    <div className="pos-rel">
                        <div
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="profile-trigger-avatar"
                        >
                            S
                        </div>

                        {profileOpen && (
                            <div className="dropdown-menu-glass">
                                <MenuOption icon={<User size={16} />} label="Profile" onClick={() => { setProfileOpen(false); navigate('/profile'); }} />
                                <MenuOption icon={<Settings size={16} />} label="Settings" onClick={() => { setProfileOpen(false); navigate('/settings'); }} />
                                <MenuOption icon={<Settings size={16} />} label="Config" onClick={() => { setProfileOpen(false); navigate('/categories'); }} />
                                <MenuOption icon={<Globe size={16} />} label="Site Settings" onClick={() => { setProfileOpen(false); navigate('/site-settings'); }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

const ClassicNavLink = ({ to, label, icon }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `classic-nav-link ${isActive ? 'active' : 'inactive'}`}
    >
        <span className="nav-link-icon-wrap">{icon}</span>
        {label}
    </NavLink>
);

const MenuOption = ({ icon, label, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="menu-option-item"
        >
            <span className="menu-item-icon-wrap">{icon}</span>
            {label}
        </div>
    );
};
