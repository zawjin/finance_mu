import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, clearError } from '../store/authSlice';
import { 
    TextField, IconButton, 
    InputAdornment, Alert, CircularProgress 
} from '@mui/material';
import { User, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import './LoginPage.scss';
import Logo from '../components/ui/Logo';

export default function LoginPage() {
    const dispatch = useDispatch();
    const { loading, error } = useSelector(state => state.auth);
    
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(loginUser({ username: credentials.username, password: credentials.password }));
    };

    return (
        <div className="android-login-root">
            {/* Animated Background */}
            <div className="android-bg">
                <motion.div className="orb orb-blue"
                    animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -15, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div className="orb orb-purple"
                    animate={{ scale: [1.1, 1, 1.1], x: [0, -25, 0], y: [0, 20, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
                <motion.div className="orb orb-green"
                    animate={{ scale: [1, 1.3, 1], x: [0, 15, 0], y: [0, -25, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />
                <div className="mesh-overlay" />
            </div>

            {/* Top Hero Section */}
            <div className="android-hero">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
                >
                    <Logo size="large" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="hero-text-block"
                >
                    <p className="hero-title">Financial Command</p>
                    <p className="hero-sub">System Administration & Logistics</p>
                </motion.div>
            </div>

            {/* Bottom Sheet Login Panel */}
            <motion.div
                className="android-bottom-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }}
            >
                <div className="sheet-handle" />
                
                <div className="sheet-header">
                    <div className="sheet-icon-wrap">
                        <Shield size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="sheet-title">Sign In</p>
                        <p className="sheet-sub">Authenticate to access your dashboard</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="android-form">
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Alert severity="error" className="android-alert">{error}</Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="android-field-wrap">
                        <label className="android-label">Username</label>
                        <div className="android-input-box">
                            <User size={18} className="field-icon" />
                            <input
                                type="text"
                                className="android-input"
                                placeholder="Enter your username"
                                value={credentials.username}
                                onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="android-field-wrap">
                        <label className="android-label">Password</label>
                        <div className="android-input-box">
                            <Lock size={18} className="field-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="android-input"
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                autoComplete="current-password"
                            />
                            <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="android-login-btn"
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        {loading ? (
                            <CircularProgress size={22} sx={{ color: '#fff' }} />
                        ) : (
                            <>
                                <span>Sign In</span>
                                <div className="btn-arrow">
                                    <ArrowRight size={18} />
                                </div>
                            </>
                        )}
                    </motion.button>
                </form>

                <p className="android-footer-tag">🔒 End-to-end encrypted · Neural Security Active</p>
            </motion.div>
        </div>
    );
}
