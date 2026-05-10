import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock, Database, Cloud, Mail, Check, X, Clock,
    RefreshCw, CheckCircle2, ShieldCheck, Cpu,
    HardDrive, Settings2, Fingerprint, ChevronRight,
    Globe, Users, Activity, Moon, Bell, Palette, User, Phone, Sun, Zap
} from 'lucide-react';
import { LinearProgress } from '@mui/material';
import './SettingsPage.scss';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [activeTheme, setActiveTheme] = useState('standard');

    const [userName, setUserName] = useState('Shajin V');
    const [userMobile, setUserMobile] = useState('+91 98765 43210');
    const [backupEmail, setBackupEmail] = useState('shajin.fstpl@gmail.com');
    const [googleClientId, setGoogleClientId] = useState('');

    const [isEditingClientId, setIsEditingClientId] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const [tempEmail, setTempEmail] = useState('');
    const [tempClientId, setTempClientId] = useState('');
    const [tempName, setTempName] = useState('');
    const [tempMobile, setTempMobile] = useState('');

    const [history, setHistory] = useState([]);
    const [backingUp, setBackingUp] = useState(false);
    const [progress, setProgress] = useState(0);
    const [gdriveToken, setGdriveToken] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobile = windowWidth < 768;

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        fetchSettings();
        fetchHistory();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        applyTheme(activeTheme);
    }, [activeTheme]);

    const applyTheme = (theme) => {
        const root = document.documentElement;
        const themes = {
            standard: { bg: '#ffffff', surface: '#f8fafc', accent: '#6366f1', text: '#0f172a' },
            ocean: { bg: '#f0f9ff', surface: '#e0f2fe', accent: '#0ea5e9', text: '#0c4a6e' },
            solar: { bg: '#fffdfa', surface: '#fff8eb', accent: '#f59e0b', text: '#451a03' }
        };
        const t = themes[theme] || themes.standard;
        root.style.setProperty('--bg-primary', t.bg);
        root.style.setProperty('--bg-secondary', t.surface);
        root.style.setProperty('--accent-primary', t.accent);
        root.style.setProperty('--text-main', t.text);
        document.body.style.background = t.bg;
        document.body.style.color = t.text;
    };

    const fetchSettings = async () => {
        try {
            const res = await api.get('/system/settings');
            if (res.data.backup_email) setBackupEmail(res.data.backup_email);
            if (res.data.google_client_id) setGoogleClientId(res.data.google_client_id);
            if (res.data.user_name) setUserName(res.data.user_name);
            if (res.data.user_mobile) setUserMobile(res.data.user_mobile);
            if (res.data.active_theme) setActiveTheme(res.data.active_theme);
        } catch (err) { console.error(err); }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get('/system/backup-history');
            setHistory(res.data);
        } catch (err) { console.error(err); }
    };

    const handleUpdateTheme = async (theme) => {
        try {
            await api.post('/system/settings', { active_theme: theme });
            setActiveTheme(theme);
        } catch (err) { console.error(err); }
    };

    const handleUpdateProfile = async () => {
        try {
            await api.post('/system/settings', {
                user_name: tempName,
                user_mobile: tempMobile,
                backup_email: tempEmail
            });
            setUserName(tempName);
            setUserMobile(tempMobile);
            setBackupEmail(tempEmail);
            setIsEditingProfile(false);
        } catch (err) { console.error(err); }
    };

    const handleUpdateClientId = async () => {
        try {
            await api.post('/system/settings', { google_client_id: tempClientId });
            setGoogleClientId(tempClientId);
            setIsEditingClientId(false);
        } catch (err) { console.error(err); }
    };

    const handleGoogleAuth = () => {
        if (!googleClientId) {
            alert("Please set your Google Client ID first!");
            setActiveTab('backup');
            setIsEditingClientId(true);
            return;
        }
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: (response) => {
                if (response.access_token) {
                    setGdriveToken(response.access_token);
                }
            },
        });
        client.requestAccessToken();
    };

    const handleBackup = async () => {
        if (!gdriveToken) {
            handleGoogleAuth();
            return;
        }
        setBackingUp(true);
        setProgress(10);
        try {
            const timer = setInterval(() => {
                setProgress(p => (p >= 90 ? 90 : p + 5));
            }, 200);
            await api.post('/system/backup/gdrive', { access_token: gdriveToken });
            clearInterval(timer);
            setProgress(100);
            setTimeout(() => {
                setBackingUp(false);
                setProgress(0);
                fetchHistory();
            }, 1000);
        } catch (err) {
            console.error(err);
            setBackingUp(false);
            setProgress(0);
            const msg = err.response?.data?.detail || "Transfer Interrupted. Reconnect & Retry.";
            alert(msg);
            setGdriveToken(null);
        }
    };

    // SUB-COMPONENTS (Defined inside to ensure scope)
    const SectionHeader = ({ icon: Icon, title, subtitle, color }) => (
        <div className="section-header" style={{ display: 'flex', gap: isMobile ? '10px' : '1rem', alignItems: 'center', marginBottom: isMobile ? '1rem' : '1.5rem' }}>
            <div className="icon-box" style={{ width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px', borderRadius: '10px', background: `${color}15`, color: color, display: 'grid', placeItems: 'center' }}>
                <Icon size={isMobile ? 16 : 18} />
            </div>
            <div>
                <h3 style={{ margin: 0, fontSize: isMobile ? '0.85rem' : '1rem', fontWeight: 900, color: 'var(--text-main)' }}>{title}</h3>
                <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 600 }}>{subtitle}</p>
            </div>
        </div>
    );

    const ProfileItem = ({ label, value, editing, tempValue, onChange }) => (
        <div className="profile-item">
            <div className="label">{label}</div>
            {editing ? (
                <input value={tempValue} onChange={e => onChange(e.target.value)} style={{ width: '100%', border: 'none', background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '12px', fontWeight: 800, fontSize: isMobile ? '0.85rem' : '1rem', outline: 'none', color: 'var(--text-main)' }} />
            ) : (
                <div className="value">{value}</div>
            )}
        </div>
    );

    const ThemeCard = ({ id, active, onClick, icon: Icon, title, desc, bg, accent }) => (
        <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`theme-card ${active ? 'active' : ''}`}
            style={{ 
                border: active ? `2px solid ${accent}` : '1px solid var(--border)',
                background: bg 
            }}
        >
            <div className="icon-box" style={{ background: active ? accent : `${accent}15`, color: active ? '#fff' : accent }}>
                <Icon size={isMobile ? 18 : 28} />
            </div>
            <div className="info">
                <h4 style={{ color: active ? accent : 'var(--text-main)' }}>{title}</h4>
                <p>{desc}</p>
            </div>
            {active && <CheckCircle2 size={isMobile ? 16 : 24} color={accent} style={{ marginLeft: 'auto' }} />}
        </motion.div>
    );

    return (
        <div className="settings-container">
            <div className="settings-header">
                <div className="badge">
                    <Settings2 size={16} />
                    <span>System Command Center</span>
                </div>
                <h1>Settings</h1>
            </div>

            <div className="tab-navigation no-scrollbar">
                {[
                    { id: 'profile', icon: User, label: 'Profile', color: 'var(--accent-primary)' },
                    { id: 'backup', icon: Cloud, label: 'Backup', color: 'var(--accent-primary)' },
                    { id: 'appearance', icon: Palette, label: 'Theme', color: 'var(--accent-primary)' },
                    { id: 'notifications', icon: Bell, label: 'Alerts', color: '#ef4444' },
                    { id: 'privacy', icon: Lock, label: 'Privacy', color: '#14b8a6' },
                    { id: 'family', icon: Users, label: 'Family', color: '#ec4899' },
                    { id: 'history', icon: Clock, label: 'History', color: '#64748b' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        <div className="icon-box" style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.1)' : `${tab.color}10` }}>
                            <tab.icon size={isMobile ? 14 : 18} color={activeTab === tab.id ? '#fff' : tab.color} />
                        </div>
                        {tab.label.toUpperCase()}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    {activeTab === 'profile' && (
                        <div className="settings-content-card">
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', marginBottom: isMobile ? '1.2rem' : '3rem', gap: isMobile ? '1rem' : '0' }}>
                                <SectionHeader icon={Fingerprint} title="User Profile" subtitle={isMobile ? "Your ID" : "Personal Identification"} color="#6366f1" />
                                <button onClick={() => isEditingProfile ? handleUpdateProfile() : (setTempName(userName), setTempMobile(userMobile), setTempEmail(backupEmail), setIsEditingProfile(true))} style={{ width: isMobile ? '100%' : 'auto', padding: '10px 24px', borderRadius: '12px', border: '1px solid var(--border)', background: isEditingProfile ? '#6366f1' : 'var(--bg-primary)', color: isEditingProfile ? '#fff' : 'var(--text-main)', fontWeight: 900, fontSize: '0.75rem' }}>
                                    {isEditingProfile ? 'SAVE PROFILE' : 'EDIT PROFILE'}
                                </button>
                            </div>
                            <div className="profile-grid">
                                <ProfileItem label="Display Name" value={userName} editing={isEditingProfile} tempValue={tempName} onChange={setTempName} />
                                <ProfileItem label="Contact Mobile" value={userMobile} editing={isEditingProfile} tempValue={tempMobile} onChange={setTempMobile} />
                                <ProfileItem label="System Email" value={backupEmail} editing={isEditingProfile} tempValue={tempEmail} onChange={setTempEmail} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="settings-content-card">
                            <SectionHeader icon={Palette} title="Visual Theme" subtitle="Switch styles" color="#fb923c" />
                            <div className="theme-grid">
                                <ThemeCard id="standard" active={activeTheme === 'standard'} onClick={() => handleUpdateTheme('standard')} icon={Sun} title="Neural White" desc="Clinical light mode" bg="#f8fafc" accent="#6366f1" />
                                <ThemeCard id="ocean" active={activeTheme === 'ocean'} onClick={() => handleUpdateTheme('ocean')} icon={Globe} title="Ocean Glass" desc="Soft blue glass" bg="#f0f9ff" accent="#0ea5e9" />
                                <ThemeCard id="solar" active={activeTheme === 'solar'} onClick={() => handleUpdateTheme('solar')} icon={Zap} title="Solar Gold" desc="Warm executive" bg="#fffcf0" accent="#f59e0b" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'backup' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0.75rem' : '2rem' }}>
                            <div className="backup-banner">
                                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? '1.25rem' : '3rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div className="icon-box" style={{ width: isMobile ? '40px' : '60px', height: isMobile ? '40px' : '60px', borderRadius: isMobile ? '12px' : '20px', background: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center' }}>
                                            <Database size={isMobile ? 20 : 32} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '2rem', fontWeight: 950 }}>Neural Vault</h3>
                                            <p style={{ margin: 0, opacity: 0.6, fontSize: isMobile ? '0.7rem' : '1rem' }}>Sync for {userName}</p>
                                        </div>
                                    </div>
                                    <button onClick={handleBackup} disabled={backingUp} style={{ padding: isMobile ? '12px' : '18px 45px', borderRadius: isMobile ? '14px' : '22px', border: 'none', background: '#fff', color: '#0f172a', fontWeight: 950, fontSize: isMobile ? '0.8rem' : '1.1rem' }}>
                                        {backingUp ? 'SYNCING' : 'INITIATE SYNC'}
                                    </button>
                                </div>
                                {backingUp && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#fff' } }} />
                                    </div>
                                )}
                            </div>
                            <div className="profile-grid">
                                <div className="profile-item" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                                    <SectionHeader icon={Globe} title="Connectivity" subtitle="API Status" color="#10b981" />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{googleClientId ? 'Active' : 'Missing'}</span>
                                        {!gdriveToken && <button onClick={handleGoogleAuth} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'var(--text-main)', color: 'var(--bg-primary)', fontSize: '0.7rem', fontWeight: 900 }}>LINK DRIVE</button>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="sync-history-grid">
                            {history.map((h, i) => (
                                <div key={i} className="history-item">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#34c75915', color: '#34c759', display: 'grid', placeItems: 'center' }}><Check size={18} /></div>
                                        <div className="info">
                                            <div className="date" style={{ fontSize: '0.85rem', fontWeight: 850 }}>{new Date(h.date).toLocaleDateString()}</div>
                                            <div className="status" style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-dim)' }}>DRIVE SYNC SUCCESS</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} color="#cbd5e1" />
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
