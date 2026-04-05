import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Gem, Settings, LogOut, Search, Bell, User } from 'lucide-react';

const Sidebar = () => {
    return (
        <div style={{ 
            width: '100px', 
            height: '100vh', 
            background: '#1e1b18', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '2rem 0',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 1000
        }}>
            <div style={{ 
                width: '45px', 
                height: '45px', 
                background: '#fff', 
                borderRadius: '12px', 
                display: 'grid', 
                placeItems: 'center',
                marginBottom: '3rem'
            }}>
                <div style={{ width: '20px', height: '20px', background: '#000', borderRadius: '4px' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flexGrow: 1 }}>
                <NavItem to="/" icon={<LayoutDashboard size={24} />} />
                <NavItem to="/spending" icon={<Wallet size={24} />} />
                <NavItem to="/investments" icon={<Gem size={24} />} />
                <NavItem to="/categories" icon={<Settings size={24} />} />
            </div>

            <div style={{ color: '#64748b', cursor: 'pointer', opacity: 0.5 }}>
                <LogOut size={24} />
            </div>
        </div>
    );
};

const NavItem = ({ to, icon }) => (
    <NavLink 
        to={to} 
        style={({ isActive }) => ({
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            display: 'grid',
            placeItems: 'center',
            background: isActive ? '#fb923c' : 'rgba(255,255,255,0.03)',
            color: isActive ? '#1c1917' : '#64748b',
            transition: '0.2s all'
        })}
    >
        {icon}
    </NavLink>
);

export default Sidebar;
