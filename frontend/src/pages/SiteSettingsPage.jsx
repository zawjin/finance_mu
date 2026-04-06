import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings2, RefreshCw, BarChart } from 'lucide-react';
import api from '../utils/api';

export default function SiteSettingsPage() {
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await api.post('/sync-prices');
            alert('Market Data Synchronization Complete!');
        } catch (error) {
            console.error('Sync failed', error);
            alert('Failed to sync market data.');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>Site Settings</h1>
                    <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '1.1rem' }}>Manage high-level operations and background jobs</p>
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '24px', padding: '2.5rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <Settings2 size={24} color="#0f172a" />
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Data Operations</h2>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <BarChart size={24} color="#6366f1" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Manual Market Sync</h3>
                            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.95rem' }}>Sync daily stock and mutual fund prices.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        style={{ background: isSyncing ? '#94a3b8' : '#0f172a', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 800, fontSize: '0.95rem', cursor: isSyncing ? 'not-allowed' : 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }}
                    >
                        <RefreshCw size={18} /> 
                        {isSyncing ? 'SYNCING...' : 'SYNC PRICES NOW'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
