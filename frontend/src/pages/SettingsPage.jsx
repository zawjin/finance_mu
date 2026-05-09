import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Moon, Lock, Globe, Users, Activity, Database, Download, Cloud, Mail, Check, X, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { LinearProgress, Box as MuiBox } from '@mui/material';

export default function SettingsPage() {
    const [backupEmail, setBackupEmail] = useState('vashajin@gmail.com');
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [tempEmail, setTempEmail] = useState('');
    const [history, setHistory] = useState([]);
    const [backingUp, setBackingUp] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        fetchSettings();
        fetchHistory();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/system/settings');
            if (res.data.backup_email) setBackupEmail(res.data.backup_email);
        } catch (err) { console.error(err); }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get('/system/backup-history');
            setHistory(res.data);
        } catch (err) { console.error(err); }
    };

    const handleUpdateEmail = async () => {
        try {
            await api.post('/system/settings', { backup_email: tempEmail });
            setBackupEmail(tempEmail);
            setIsEditingEmail(false);
        } catch (err) { console.error(err); }
    };

    const handleBackup = async () => {
        setBackingUp(true);
        setProgress(10);
        try {
            const timer = setInterval(() => {
                setProgress(oldProgress => {
                    if (oldProgress >= 90) return 90;
                    return oldProgress + 10;
                });
            }, 300);

            await api.get('/system/backup?send_email=true');
            clearInterval(timer);
            setProgress(100);
            
            setTimeout(() => {
                setBackingUp(false);
                setProgress(0);
                fetchHistory();
                alert(`Backup Dispatched! The vault has been sent to ${backupEmail} via Neural Cloud Relay.`);
            }, 1000);
        } catch (err) {
            console.error(err);
            setBackingUp(false);
            setProgress(0);
            alert("Backup failed. Service temporarily unavailable.");
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', padding: '20px 20px 80px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em' }}>App Settings</h1>
                    <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>Global configuration & data integrity</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* DATA BACKUP MODULE */}
                <div style={{ background: '#fff', borderRadius: '32px', border: '1px solid #f1f5f9', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'grid', placeItems: 'center' }}>
                                <Database size={28} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>Neural Cloud Backup</h3>
                                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>One-click secure vault dispatch to your email</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleBackup}
                            disabled={backingUp}
                            style={{ 
                                padding: '12px 24px', 
                                borderRadius: '16px', 
                                border: 'none', 
                                background: backingUp ? '#f1f5f9' : '#0f172a', 
                                color: backingUp ? '#94a3b8' : '#fff', 
                                fontWeight: 800, 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {backingUp ? <RefreshCw size={18} className="spin" /> : <Cloud size={18} />}
                            {backingUp ? 'Dispatching...' : 'RUN BACKUP'}
                        </button>
                    </div>

                    {backingUp && (
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#6366f1' }}>NEURAL CLOUD RELAY IN PROGRESS</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#6366f1' }}>{progress}%</span>
                            </div>
                            <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' } }} />
                        </div>
                    )}

                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Mail size={16} color="#6366f1" />
                                {isEditingEmail ? (
                                    <input 
                                        value={tempEmail}
                                        onChange={e => setTempEmail(e.target.value)}
                                        style={{ border: 'none', background: 'white', padding: '4px 12px', borderRadius: '8px', fontWeight: 800, fontSize: '0.9rem', outline: 'none' }}
                                    />
                                ) : (
                                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{backupEmail}</span>
                                )}
                            </div>
                            {isEditingEmail ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={handleUpdateEmail} style={{ border: 'none', background: '#34c759', color: 'white', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}><Check size={14} /></button>
                                    <button onClick={() => setIsEditingEmail(false)} style={{ border: 'none', background: '#ff3b30', color: 'white', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}><X size={14} /></button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => { setTempEmail(backupEmail); setIsEditingEmail(true); }}
                                    style={{ border: 'none', background: 'none', color: '#6366f1', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer', textTransform: 'uppercase' }}
                                >
                                    Change Target
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={12} /> NEURAL RELAY ACTIVE: NO PASSWORD REQUIRED
                        </div>
                    </div>

                    {history.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                <Clock size={14} color="#64748b" />
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Cloud Sync History</span>
                            </div>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {history.map((h, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>{new Date(h.date).toLocaleString()}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 950, color: '#34c759', background: 'rgba(52, 199, 89, 0.1)', padding: '2px 8px', borderRadius: '50px' }}>VAULT SYNCED</span>
                                            <Cloud size={12} color="#94a3b8" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <SettingCard icon={<Bell size={24} color="#6366f1" />} title="Notifications" description="Manage email alerts and push notifications" />
                <SettingCard icon={<Moon size={24} color="#fb923c" />} title="Appearance" description="Toggle dark mode and theme preferences" />
                <SettingCard icon={<Lock size={24} color="#10b981" />} title="Privacy" description="Control data sharing and security settings" />
                <SettingCard icon={<Globe size={24} color="#8b5cf6" />} title="Regional" description="Set your timezone and preferred currency" />
                <SettingCard icon={<Users size={24} color="#ec4899" />} title="Family Members" description="Invite and manage family access to dashboards" />
                <SettingCard icon={<Activity size={24} color="#ef4444" />} title="Health Integrations" description="Manage external health and fitness trackers" />
            </div>
        </motion.div>
    );
}

const SettingCard = ({ icon, title, description, onClick, extra }) => (
    <div 
        onClick={onClick}
        style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9', cursor: 'pointer', transition: '0.2s transform', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }} 
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'} 
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
        <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#f8fafc', display: 'grid', placeItems: 'center' }}>
            {icon}
        </div>
        <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.95rem' }}>{description}</p>
            {extra}
        </div>
    </div>
);
