import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Typography } from '@mui/material';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ children, module, action = 'view' }) => {
    const { user, token, initialized } = useSelector(state => state.auth);
    const location = useLocation();

    if (!initialized) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', gap: '20px' }}>
                <div className="dot-pulse"></div>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Verifying Identity</Typography>
            </div>
        );
    }

    if (!token || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (module) {
        if (user.role?.role_name === 'Super Admin') return children;
        
        const permission = user.role?.permissions?.find(p => p.module_name === module);
        if (!permission || !permission[`can_${action}`]) {
            return <Navigate to="/" replace />; // Or an Access Denied page
        }
    }

    return children;
};

export default ProtectedRoute;
