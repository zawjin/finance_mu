import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, clearError } from '../store/authSlice';
import { 
    Box, TextField, Button, Typography, IconButton, 
    InputAdornment, Alert, CircularProgress 
} from '@mui/material';
import { User, Lock, Phone, ArrowRight, Sparkles } from 'lucide-react';
import './LoginPage.scss';

export default function LoginPage() {
    const dispatch = useDispatch();
    const { loading, error, token } = useSelector(state => state.auth);
    
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        mobile: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(loginUser({ 
            username: credentials.username, 
            password: credentials.password 
        }));
    };

    return (
        <div className="login-page-root">
            <div className="login-mesh-bg"></div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="login-glass-card"
            >
                <div className="login-card-header">
                    <div className="sal-logo-modern">SAL</div>
                    <Typography className="login-welcome">Welcome back</Typography>
                    <Typography className="login-subtitle">System Administration & Logistics</Typography>
                </div>

                <form onSubmit={handleLogin} className="login-form-body">
                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Alert severity="error" className="login-alert-premium">
                                    {error}
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="login-input-group">
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Username"
                            value={credentials.username}
                            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><User size={18} color="#86868b" /></InputAdornment>,
                            }}
                            className="login-field-luxury"
                        />

                        <TextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            placeholder="Password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Lock size={18} color="#86868b" /></InputAdornment>,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                                            <Sparkles size={16} color={showPassword ? '#0071e3' : '#86868b'} />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            className="login-field-luxury"
                        />

                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Mobile (Optional)"
                            value={credentials.mobile}
                            onChange={(e) => setCredentials({...credentials, mobile: e.target.value})}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Phone size={18} color="#86868b" /></InputAdornment>,
                            }}
                            className="login-field-luxury"
                        />
                    </div>

                    <Button
                        type="submit"
                        fullWidth
                        disabled={loading}
                        className="login-btn-premium"
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : (
                            <>
                                AUTHENTICATE <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </>
                        )}
                    </Button>
                </form>

                <div className="login-card-footer">
                    <Typography className="footer-status">FRIDAY NEURAL SECURITY ACTIVE</Typography>
                </div>
            </motion.div>
        </div>
    );
}
