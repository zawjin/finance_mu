import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SidebarLink({ to, icon, label }) {
    return (
        <NavLink 
            to={to} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
            <div className="sidebar-icon">{icon}</div>
            <span className="sidebar-label">{label}</span>
        </NavLink>
    );
}
