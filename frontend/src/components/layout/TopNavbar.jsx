import React, { useState, useEffect, useRef } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    LayoutDashboard, Wallet, Gem, Settings, Plus, BarChart2, Sparkles,
    User, Globe, Banknote, Bookmark, Activity,
    X, ArrowLeft, Zap, ChevronRight, Home, TrendingUp,
    Shield, Calculator, CreditCard
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import './TopNavbar.scss';

const NAV_ITEMS = [
    { to: '/',               label: 'Dashboard',     icon: <LayoutDashboard size={22} />, color: '#6366f1', bg: '#eef2ff' },
    { to: '/spending',       label: 'Audit Ledger',  icon: <Wallet size={22} />,          color: '#0ea5e9', bg: '#e0f2fe' },
    { to: '/reserves',       label: 'Cash Reserves', icon: <Banknote size={22} />,        color: '#10b981', bg: '#d1fae5' },
    { to: '/investments',    label: 'Assets',        icon: <Gem size={22} />,             color: '#f59e0b', bg: '#fef3c7' },
    { to: '/fixed-expenses', label: 'Fixed Costs',   icon: <Bookmark size={22} />,        color: '#8b5cf6', bg: '#ede9fe' },
    { to: '/health',         label: 'Health',        icon: <Activity size={22} />,        color: '#ef4444', bg: '#fee2e2' },
];

const TOOL_ITEMS = [
    { type: 'action', label: 'AI Analyst',    icon: <Sparkles size={18} />,    color: '#f97316', bg: '#fff7ed', action: 'ai' },
    { type: 'link',   to: '/salary-calculation', label: 'Salary Calc',  icon: <Calculator size={18} />, color: '#0ea5e9', bg: '#e0f2fe' },
    { type: 'link',   to: '/categories',         label: 'Config',       icon: <Settings size={18} />,   color: '#8b5cf6', bg: '#ede9fe' },
    { type: 'link',   to: '/profile',            label: 'Profile',      icon: <User size={18} />,       color: '#10b981', bg: '#d1fae5' },
    { type: 'link',   to: '/site-settings',      label: 'Site Config',  icon: <Globe size={18} />,      color: '#64748b', bg: '#f1f5f9' },
];

const PAGE_TITLE_MAP = {
    '/':                    { title: 'Dashboard',       sub: 'Financial Overview' },
    '/spending':            { title: 'Audit Ledger',    sub: 'Transaction History' },
    '/reserves':            { title: 'Cash Reserves',   sub: 'Liquidity Management' },
    '/investments':         { title: 'Asset Portfolio', sub: 'Investment Tracker' },
    '/fixed-expenses':      { title: 'Fixed Costs',     sub: 'Recurring Obligations' },
    '/health':              { title: 'Health Connect',  sub: 'Habit Tracker' },
    '/categories':          { title: 'Configuration',   sub: 'Categories & Settings' },
    '/salary-calculation':  { title: 'Salary Calc',     sub: 'Take-Home Calculator' },
    '/profile':             { title: 'Profile',         sub: 'Account Settings' },
    '/settings':            { title: 'Settings',        sub: 'Preferences' },
    '/site-settings':       { title: 'Site Settings',   sub: 'App Configuration' },
};

export default function TopNavbar({ onAdd, onOpenAiModal, onToggleAnalytics, showAnalytics }) {
    const location = useLocation();
    const [profileOpen, setProfileOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const profileRef = useRef(null);
    const sheetRef = useRef(null);

    // Live financial stats for the bottom sheet header
    const { reserves, summary } = useSelector(state => state.finance);
    const totalLiquidity = (reserves || [])
        .filter(r => r.account_type !== 'CREDIT_CARD')
        .reduce((s, r) => s + parseFloat(r.balance || 0), 0);
    const totalAssets = summary?.total_investment || 0;

    const currentPage = PAGE_TITLE_MAP[location.pathname] || { title: 'Friday', sub: 'Financial Intelligence' };
    const showAddBtn = ['/spending', '/investments', '/fixed-expenses', '/health', '/reserves'].includes(location.pathname);
    const showAnalyticsBtn = ['/spending', '/investments', '/health'].includes(location.pathname);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on route change
    useEffect(() => setDrawerOpen(false), [location.pathname]);

    // Lock body scroll when sheet is open
    useEffect(() => {
        if (drawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    return (
        <>
            {/* ─── DESKTOP NAVBAR ─── */}
            <nav className="top-navbar-root desktop-nav-only">
                <div className="nav-brand-wrap">
                    <div onClick={() => window.location.href = '/'} className="nav-logo-brand">
                        <div className="logo-square-icon"><div className="logo-inner-rect"></div></div>
                        FRIDAY
                    </div>
                    <div className="nav-links-scrollable">
                        <ClassicNavLink to="/"               label="DASHBOARD" icon={<LayoutDashboard size={16} />} />
                        <ClassicNavLink to="/spending"        label="AUDIT"     icon={<Wallet size={16} />} />
                        <ClassicNavLink to="/reserves"        label="CASH"      icon={<Banknote size={16} />} />
                        <ClassicNavLink to="/investments"     label="ASSETS"    icon={<Gem size={16} />} />
                        <ClassicNavLink to="/fixed-expenses"  label="FIXED"     icon={<Bookmark size={16} />} />
                        <ClassicNavLink to="/health"          label="HEALTH"    icon={<Activity size={16} />} />
                        <ClassicNavLink to="/categories"      label="CONFIG"    icon={<Settings size={16} />} />
                    </div>
                </div>

                <div className="action-cluster-nav">
                    <div className="nav-action-group">
                        <button onClick={onOpenAiModal} className="btn-ai-analyst">
                            <Sparkles size={16} color="#fb923c" /> AI ANALYST
                        </button>
                        {showAddBtn && (
                            <>
                                {showAnalyticsBtn && (
                                    <button onClick={onToggleAnalytics} className={`btn-toggle-analytics ${showAnalytics ? 'active' : 'inactive'}`}><BarChart2 size={18} /></button>
                                )}
                                <button onClick={onAdd} className="btn-sync-global"><Plus size={16} /> SYNC</button>
                            </>
                        )}
                    </div>
                    <div className="nav-profile-group">
                        <div className="pos-rel" ref={profileRef}>
                            <div onClick={() => setProfileOpen(!profileOpen)} className="profile-trigger-avatar">S</div>
                            {profileOpen && (
                                <div className="dropdown-menu-glass">
                                    <MenuOption icon={<User size={16} />}     label="Profile"       onClick={() => { setProfileOpen(false); navigate('/profile'); }} />
                                    <MenuOption icon={<Settings size={16} />} label="Settings"      onClick={() => { setProfileOpen(false); navigate('/settings'); }} />
                                    <MenuOption icon={<Banknote size={16} />} label="S Calculation" onClick={() => { setProfileOpen(false); navigate('/salary-calculation'); }} />
                                    <MenuOption icon={<Settings size={16} />} label="Config"        onClick={() => { setProfileOpen(false); navigate('/categories'); }} />
                                    <MenuOption icon={<Globe size={16} />}    label="Site Settings" onClick={() => { setProfileOpen(false); navigate('/site-settings'); }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ─── MOBILE NAVIGATION ─── */}
            <div className="mobile-pro-container">

                {/* ── SMART MOBILE HEADER ── */}
                <header className={`mobile-header ${scrolled ? 'scrolled' : ''}`}>
                    <div className="mh-left">
                        {location.pathname !== '/' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button className="mh-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
                                    <ArrowLeft size={20} />
                                </button>
                                <button className="mh-back-btn" onClick={() => navigate('/')} aria-label="Go home">
                                    <Home size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="mh-logo">
                                <div className="mh-logo-inner"></div>
                            </div>
                        )}
                        <div className="mh-title-group">
                            <span className="mh-title">{currentPage.title}</span>
                            <span className="mh-sub">{currentPage.sub}</span>
                        </div>
                    </div>

                    <div className="mh-right">
                        {showAnalyticsBtn && (
                            <button
                                onClick={onToggleAnalytics}
                                className={`mh-icon-btn ${showAnalytics ? 'active' : ''}`}
                                aria-label="Toggle analytics"
                            >
                                <BarChart2 size={18} />
                            </button>
                        )}
                        {showAddBtn && (
                            <button onClick={onAdd} className="mh-add-btn" aria-label="Add entry">
                                <Plus size={20} strokeWidth={2.5} />
                            </button>
                        )}
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className={`mh-menu-btn ${drawerOpen ? 'open' : ''}`}
                            aria-label="Menu"
                        >
                            <span className="mh-hamburger">
                                <span></span><span></span><span></span>
                            </span>
                        </button>
                    </div>
                </header>

                {/* ── BOTTOM SHEET ── */}
                <div
                    className={`bs-overlay ${drawerOpen ? 'open' : ''}`}
                    onClick={() => setDrawerOpen(false)}
                    aria-hidden="true"
                />
                <div
                    ref={sheetRef}
                    className={`bottom-sheet ${drawerOpen ? 'open' : ''}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Navigation menu"
                >
                    {/* Drag Handle */}
                    <div className="bs-handle-wrap">
                        <div className="bs-handle"></div>
                    </div>

                    {/* Sheet Header — Live Stats */}
                    <div className="bs-stats-header">
                        <div className="bs-stat-card">
                            <span className="bs-stat-label">LIQUIDITY</span>
                            <span className="bs-stat-value">{formatCurrency(totalLiquidity)}</span>
                        </div>
                        <div className="bs-stat-divider"></div>
                        <div className="bs-stat-card">
                            <span className="bs-stat-label">ASSETS</span>
                            <span className="bs-stat-value">{formatCurrency(totalAssets)}</span>
                        </div>
                    </div>

                    {/* Quick Nav Grid */}
                    <div className="bs-section-label">QUICK NAVIGATE</div>
                    <div className="bs-nav-grid">
                        {NAV_ITEMS.map(item => {
                            const isActive = location.pathname === item.to;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.to === '/'}
                                    className={`bs-grid-item ${isActive ? 'active' : ''}`}
                                    onClick={() => setDrawerOpen(false)}
                                    style={{ '--item-color': item.color, '--item-bg': item.bg }}
                                >
                                    <div className="bs-grid-icon" style={{ background: isActive ? item.color : item.bg, color: isActive ? '#fff' : item.color }}>
                                        {item.icon}
                                    </div>
                                    <span className="bs-grid-label">{item.label}</span>
                                    {isActive && <span className="bs-grid-active-dot"></span>}
                                </NavLink>
                            );
                        })}
                    </div>

                    {/* Tools Grid */}
                    <div className="bs-section-label">TOOLS</div>
                    <div className="bs-tool-grid">
                        {TOOL_ITEMS.map((item, idx) => {
                            if (item.type === 'action') {
                                return (
                                    <button
                                        key={idx}
                                        className="bs-grid-item bs-grid-item--sm"
                                        style={{ '--item-color': item.color }}
                                        onClick={() => { setDrawerOpen(false); onOpenAiModal(); }}
                                    >
                                        <div className="bs-grid-icon bs-grid-icon--sm" style={{ background: item.bg, color: item.color }}>
                                            {item.icon}
                                        </div>
                                        <span className="bs-grid-label bs-grid-label--sm">{item.label}</span>
                                    </button>
                                );
                            }
                            const isActive = location.pathname === item.to;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={`bs-grid-item bs-grid-item--sm ${isActive ? 'active' : ''}`}
                                    style={{ '--item-color': item.color }}
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <div className="bs-grid-icon bs-grid-icon--sm" style={{ background: isActive ? item.color : item.bg, color: isActive ? '#fff' : item.color }}>
                                        {item.icon}
                                    </div>
                                    <span className="bs-grid-label bs-grid-label--sm">{item.label}</span>
                                    {isActive && <span className="bs-grid-active-dot"></span>}
                                </NavLink>
                            );
                        })}
                    </div>

                    <div className="bs-footer">
                        <span className="bs-footer-text">FRIDAY · Financial Intelligence</span>
                    </div>
                </div>
            </div>
        </>
    );
}

const ClassicNavLink = ({ to, label, icon }) => (
    <NavLink to={to} className={({ isActive }) => `classic-nav-link ${isActive ? 'active' : 'inactive'}`}>
        <span className="nav-link-icon-wrap">{icon}</span>
        {label}
    </NavLink>
);

const MenuOption = ({ icon, label, onClick }) => (
    <div onClick={onClick} className="menu-option-item">
        <span className="menu-item-icon-wrap">{icon}</span>
        {label}
    </div>
);
