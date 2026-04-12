import React, { useState } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, Gem, Settings, Plus, BarChart2, Sparkles, Search, Bell, User, Handshake, Globe, Banknote, Bookmark, Activity, CreditCard } from 'lucide-react';

export default function TopNavbar({ onAdd, onOpenAiModal, onToggleAnalytics, showAnalytics }) {
    const location = useLocation();
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <nav style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(30px)',
            borderBottom: '1px solid #f1f5f9',
            padding: '0.75rem 2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            height: '75px'
        }}>
            {/* LOGO & BRAND */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                <div onClick={() => window.location.href = '/'} style={{ cursor: 'pointer', fontWeight: 900, fontSize: '1.4rem', color: '#0f172a', letterSpacing: '-0.05em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '30px', height: '30px', background: '#0f172a', borderRadius: '8px', display: 'grid', placeItems: 'center' }}>
                        <div style={{ width: '12px', height: '12px', border: '2px solid #fff', borderRadius: '3px' }}></div>
                    </div>
                    FRIDAY
                </div>

                {/* NAV LINKS - RESPONSIVE SCROLLABLE ON MOBILE */}
                <div style={{ 
                    display: 'flex', 
                    gap: '1.5rem', 
                    alignItems: 'center',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    <ClassicNavLink to="/" label="DASHBOARD" icon={<LayoutDashboard size={16} />} />
                    <ClassicNavLink to="/spending" label="AUDIT" icon={<Wallet size={16} />} />
                    <ClassicNavLink to="/reserves" label="CASH" icon={<Banknote size={16} />} />
                    <ClassicNavLink to="/investments" label="ASSETS" icon={<Gem size={16} />} />
                    <ClassicNavLink to="/fixed-expenses" label="FIXED" icon={<Bookmark size={16} />} />
                    <ClassicNavLink to="/categories" label="CONFIG" icon={<Settings size={16} />} />
                </div>
            </div>

            {/* ACTION SECTION */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>


                <div style={{ display: 'flex', gap: '0.85rem' }}>
                    <button
                        onClick={onOpenAiModal}
                        style={{
                            background: '#1e293b',
                            color: '#fff',
                            border: 'none',
                            padding: '0.65rem 1.2rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            fontWeight: 900,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Sparkles size={16} color="#fb923c" /> AI ANALYST
                    </button>

                    {(location.pathname === '/spending' || location.pathname === '/investments' || location.pathname === '/fixed-expenses') && (
                        <>
                            {(location.pathname !== '/fixed-expenses') && (
                                <button
                                    onClick={onToggleAnalytics}
                                    style={{
                                        background: showAnalytics ? '#6366f1' : 'transparent',
                                        color: showAnalytics ? '#fff' : '#64748b',
                                        border: `1px solid ${showAnalytics ? '#6366f1' : '#e2e8f0'}`,
                                        padding: '0.65rem 1rem',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 900,
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        transition: '0.2s all ease'
                                    }}
                                >
                                    <BarChart2 size={18} />
                                </button>
                            )}
                            <button
                                onClick={onAdd}
                                style={{
                                    background: '#0f172a',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.65rem 1.2rem',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    fontWeight: 900,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <Plus size={16} /> SYNC {location.pathname === '/investments' ? 'ASSET' : (location.pathname === '/fixed-expenses' ? 'EXPENSE' : (location.pathname === '/reserves' ? 'ACCOUNT' : 'LOG'))}
                            </button>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f8fafc', display: 'grid', placeItems: 'center', color: '#64748b' }}><Bell size={20} /></div>
                    <div style={{ position: 'relative' }}>
                        <div
                            onClick={() => setProfileOpen(!profileOpen)}
                            style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #0f172a, #334155)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer' }}
                        >
                            S
                        </div>

                        {profileOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '50px',
                                right: 0,
                                background: '#fff',
                                border: '1px solid #f1f5f9',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                                padding: '0.5rem',
                                width: '180px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.2rem',
                                zIndex: 9999
                            }}>
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
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
            fontSize: '0.8rem',
            fontWeight: 900,
            color: isActive ? '#0f172a' : '#94a3b8',
            padding: '0.5rem 0',
            borderBottom: isActive ? '2px solid #0f172a' : '2px solid transparent',
            transition: '0.2s',
            letterSpacing: '0.05rem',
            whiteSpace: 'nowrap'
        })}
    >
        <span style={{ opacity: 0.8 }}>{icon}</span>
        {label}
    </NavLink>
);

const MenuOption = ({ icon, label, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#334155',
                background: isHovered ? '#f8fafc' : 'transparent',
                transition: 'background 0.2s'
            }}
        >
            <span style={{ color: '#94a3b8', display: 'flex' }}>{icon}</span>
            {label}
        </div>
    );
};
