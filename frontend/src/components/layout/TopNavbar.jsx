import React, { useState } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Wallet, Gem, Settings, Plus, BarChart2, Sparkles, Search, Bell,
    User, Handshake, Globe, Banknote, Bookmark, Activity, CreditCard,
    Home, FileText, BookOpen, Menu, X, ChevronLeft
} from 'lucide-react';
import './TopNavbar.scss';

export default function TopNavbar({ onAdd, onOpenAiModal, onToggleAnalytics, showAnalytics }) {
    const location = useLocation();
    const [profileOpen, setProfileOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    const isMobile = () => window.innerWidth <= 768; // Simple check for conditional rendering if needed, but CSS is better

    return (
        <>
            {/* DESKTOP NAVBAR (Untouched as requested) */}
            <nav className="top-navbar-root desktop-nav-only">
                <div className="nav-brand-wrap">
                    <div onClick={() => window.location.href = '/'} className="nav-logo-brand">
                        <div className="logo-square-icon"><div className="logo-inner-rect"></div></div>
                        FRIDAY
                    </div>
                    <div className="nav-links-scrollable">
                        <ClassicNavLink to="/" label="DASHBOARD" icon={<LayoutDashboard size={16} />} />
                        <ClassicNavLink to="/spending" label="AUDIT" icon={<Wallet size={16} />} />
                        <ClassicNavLink to="/reserves" label="CASH" icon={<Banknote size={16} />} />
                        <ClassicNavLink to="/investments" label="ASSETS" icon={<Gem size={16} />} />
                        <ClassicNavLink to="/fixed-expenses" label="FIXED" icon={<Bookmark size={16} />} />
                        <ClassicNavLink to="/health" label="HEALTH" icon={<Activity size={16} />} />
                        <ClassicNavLink to="/categories" label="CONFIG" icon={<Settings size={16} />} />
                    </div>
                </div>

                <div className="action-cluster-nav">
                    <div className="nav-action-group">
                        <button onClick={onOpenAiModal} className="btn-ai-analyst">
                            <Sparkles size={16} color="#fb923c" /> AI ANALYST
                        </button>
                        {(location.pathname === '/spending' || location.pathname === '/investments' || location.pathname === '/fixed-expenses' || location.pathname === '/health') && (
                            <>
                                {location.pathname !== '/fixed-expenses' && (
                                    <button onClick={onToggleAnalytics} className={`btn-toggle-analytics ${showAnalytics ? 'active' : 'inactive'}`}><BarChart2 size={18} /></button>
                                )}
                                <button onClick={onAdd} className="btn-sync-global"><Plus size={16} /> SYNC</button>
                            </>
                        )}
                    </div>

                    <div className="nav-profile-group">

                        <div className="pos-rel">
                            <div onClick={() => setProfileOpen(!profileOpen)} className="profile-trigger-avatar">S</div>
                            {profileOpen && (
                                <div className="dropdown-menu-glass">
                                    <MenuOption icon={<User size={16} />} label="Profile" onClick={() => { setProfileOpen(false); navigate('/profile'); }} />
                                    <MenuOption icon={<Settings size={16} />} label="Settings" onClick={() => { setProfileOpen(false); navigate('/settings'); }} />
                                    <MenuOption icon={<Banknote size={16} />} label="S Calculation" onClick={() => { setProfileOpen(false); navigate('/salary-calculation'); }} />
                                    <MenuOption icon={<Settings size={16} />} label="Config" onClick={() => { setProfileOpen(false); navigate('/categories'); }} />
                                    <MenuOption icon={<Globe size={16} />} label="Site Settings" onClick={() => { setProfileOpen(false); navigate('/site-settings'); }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* MOBILE PRO NAVIGATION (Strictly for mobile) */}
            <div className="mobile-pro-container">
                {/* PRO SLIDE DRAWER (MODERN NATIVE STYLE) */}
                <div className={`pro-slide-drawer ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)}>
                    <div className="drawer-panel-pro" onClick={e => e.stopPropagation()}>
                        <div className="drawer-profile-box">
                            <div className="profile-avatar-pro">S</div>
                            <div className="profile-info-pro">
                                <div className="profile-name-pro">Shajin Va</div>
                                <div className="profile-sub-pro">Friday Financial Intelligence</div>
                            </div>
                        </div>

                        <div className="drawer-scroll-section">
                            <div className="drawer-section-label">MAIN SERVICES</div>
                            <div className="drawer-links-pro">
                                <DrawerLinkPro to="/" label="Dashboard" icon={<LayoutDashboard size={20} />} onClick={() => setDrawerOpen(false)} />
                                <DrawerLinkPro to="/spending" label="Audit Ledger" icon={<Activity size={20} />} onClick={() => setDrawerOpen(false)} />
                                <DrawerLinkPro to="/reserves" label="Cash Reserves" icon={<Banknote size={20} />} onClick={() => setDrawerOpen(false)} />
                                <DrawerLinkPro to="/investments" label="Asset Portfolio" icon={<Gem size={20} />} onClick={() => setDrawerOpen(false)} />
                            </div>

                            <div className="drawer-section-label">TOOLS & ANALYSIS</div>
                            <div className="drawer-links-pro">
                                <DrawerLinkPro to="/health" label="Health Connect" icon={<Activity size={20} />} onClick={() => setDrawerOpen(false)} />
                                <DrawerLinkPro to="/salary-calculation" label="Salary Calculator" icon={<Banknote size={20} />} onClick={() => setDrawerOpen(false)} />
                                <DrawerLinkPro to="/categories" label="Configuration" icon={<Settings size={20} />} onClick={() => setDrawerOpen(false)} />
                            </div>

                            <div className="drawer-section-label">ACCOUNT</div>
                            <div className="drawer-links-pro">
                                <DrawerLinkPro to="/profile" label="Settings" icon={<User size={20} />} onClick={() => setDrawerOpen(false)} />
                            </div>
                        </div>

                        <div className="drawer-footer-pro">
                            <div className="logout-btn-pro"><X size={18} /> Logout Session</div>
                        </div>
                    </div>
                </div>

                {/* REFINED TOP TAB BAR (CUTE & PRO) */}
                <div className="pro-bottom-nav">
                    <button onClick={() => window.history.back()} className="pro-tab-item">
                        <ChevronLeft size={22} />
                    </button>
                    <ProTab to="/" icon={<Home size={22} />} active={location.pathname === '/'} />

                    <div className="pro-fab-wrap">
                        <button onClick={onAdd} className="pro-fab-btn">
                            <Plus size={24} strokeWidth={3} />
                        </button>
                    </div>

                    <ProTab to="/investments" icon={<BookOpen size={22} />} active={location.pathname === '/investments'} />
                    <button onClick={() => setDrawerOpen(true)} className={`pro-tab-item ${drawerOpen ? 'active' : ''}`}>
                        <Menu size={22} />
                    </button>
                </div>
            </div>
        </>
    );
}

const ProTab = ({ to, icon, active }) => (
    <NavLink to={to} className={`pro-tab-item ${active ? 'active' : ''}`}>
        {active && <span className="pro-active-pill"></span>}
        {icon}
    </NavLink>
);

const DrawerLinkPro = ({ to, label, icon, onClick }) => (
    <NavLink to={to} className="drawer-link-pro-item" onClick={onClick}>
        <span className="drawer-icon-pro">{icon}</span>
        <span className="drawer-label-pro">{label}</span>
    </NavLink>
);

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
