import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Gem, Settings, Plus, BarChart2, Sparkles, Search, Bell, User, Handshake } from 'lucide-react';

export default function TopNavbar({ onAdd, onOpenAiModal, onToggleAnalytics, showAnalytics }) {
    const location = useLocation();

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

                {/* CLASSIC NAV LINKS */}
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <ClassicNavLink to="/" label="DASHBOARD" icon={<LayoutDashboard size={18} />} />
                    <ClassicNavLink to="/spending" label="AUDIT LOGS" icon={<Wallet size={18} />} />
                    <ClassicNavLink to="/investments" label="ASSET LEDGER" icon={<Gem size={18} />} />
                    <ClassicNavLink to="/debt" label="DEBT LEDGER" icon={<Handshake size={18} />} />
                    <ClassicNavLink to="/categories" label="CONFIG" icon={<Settings size={18} />} />
                </div>
            </div>

            {/* ACTION SECTION */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <input 
                        type="text" 
                        placeholder="Neural search..." 
                        style={{ 
                            background: '#f8fafc', 
                            border: '1px solid #f1f5f9', 
                            padding: '0.6rem 1rem 0.6rem 2.8rem', 
                            borderRadius: '12px', 
                            fontSize: '0.85rem', 
                            fontWeight: 800, 
                            color: '#0f172a',
                            width: '240px'
                        }} 
                    />
                    <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>

                <div style={{ width: '1px', height: '30px', background: '#f1f5f9', margin: '0 0.5rem' }}></div>

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

                    {(location.pathname === '/spending' || location.pathname === '/investments' || location.pathname === '/debt') && (
                        <>
                            {(location.pathname !== '/debt') && (
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
                                    background: location.pathname === '/investments' ? '#6366f1' : (location.pathname === '/debt' ? '#fb923c' : '#0f172a'), 
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
                                <Plus size={16} /> SYNC {location.pathname === '/investments' ? 'ASSET' : (location.pathname === '/debt' ? 'DEBT' : 'LOG')}
                            </button>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f8fafc', display: 'grid', placeItems: 'center', color: '#64748b' }}><Bell size={20} /></div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #0f172a, #334155)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: '0.9rem' }}>VS</div>
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
            letterSpacing: '0.05rem'
        })}
    >
        <span style={{ opacity: 0.8 }}>{icon}</span>
        {label}
    </NavLink>
);
