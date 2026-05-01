import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Server, HardDrive, RefreshCw, Layers, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './DatabaseHealthPage.scss';

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.4, 0, 0.2, 1] }
});

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function DatabaseHealthPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/db-health');
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch DB health", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const overall = data?.overall || { used_bytes: 0, total_bytes: 500 * 1024 * 1024, collections: 0, objects: 0 };
    const collections = data?.collections || [];

    const usedMB = (overall.used_bytes / (1024 * 1024)).toFixed(2);
    const totalMB = 500;
    const pct = Math.min((overall.used_bytes / overall.total_bytes) * 100, 100).toFixed(1);
    const isWarning = pct > 80;

    return (
        <div className="db-health-root">
            <motion.div {...fadeUp(0)} className="db-header">
                <div>
                    <h1 className="db-title"><Database size={28} /> Database Status</h1>
                    <p className="db-subtitle">MongoDB Atlas Cluster Metrics</p>
                </div>
                <button className="refresh-btn" onClick={fetchData} disabled={loading}>
                    <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                    Refresh
                </button>
            </motion.div>

            {loading && !data ? (
                <div className="db-loading">Loading metrics...</div>
            ) : (
                <>
                    {/* Hero Section */}
                    <motion.div {...fadeUp(0.1)} className="db-hero-card">
                        <div className="hero-top">
                            <div className="hero-left">
                                <div className="hero-icon-wrap" style={{ background: isWarning ? 'rgba(239,68,68,0.1)' : 'rgba(139,92,246,0.1)' }}>
                                    <Server size={24} color={isWarning ? '#ef4444' : '#8b5cf6'} />
                                </div>
                                <div>
                                    <h2 className="hero-card-title">Cloud Storage Capacity</h2>
                                    <p className="hero-card-sub">Shared cluster limit (M0 Free Tier)</p>
                                </div>
                            </div>
                            <div className="hero-right">
                                <span className="hero-pct" style={{ color: isWarning ? '#ef4444' : '#8b5cf6' }}>{pct}%</span>
                            </div>
                        </div>

                        <div className="hero-bar-bg">
                            <motion.div 
                                className="hero-bar-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                style={{ background: isWarning ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #8b5cf6, #c084fc)' }}
                            />
                        </div>

                        <div className="hero-bottom">
                            <div className="stat">
                                <span className="stat-lbl">USED</span>
                                <span className="stat-val">{usedMB} MB</span>
                            </div>
                            <div className="stat">
                                <span className="stat-lbl">AVAILABLE</span>
                                <span className="stat-val">{(totalMB - usedMB).toFixed(2)} MB</span>
                            </div>
                            <div className="stat">
                                <span className="stat-lbl">TOTAL LIMIT</span>
                                <span className="stat-val">{totalMB} MB</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Summary Row */}
                    <div className="db-summary-row">
                        <motion.div {...fadeUp(0.2)} className="summary-box">
                            <Layers size={18} color="#0ea5e9" />
                            <div>
                                <div className="summary-lbl">Total Collections</div>
                                <div className="summary-val">{overall.collections}</div>
                            </div>
                        </motion.div>
                        <motion.div {...fadeUp(0.25)} className="summary-box">
                            <HardDrive size={18} color="#10b981" />
                            <div>
                                <div className="summary-lbl">Total Documents</div>
                                <div className="summary-val">{overall.objects.toLocaleString()}</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Collections Grid */}
                    <motion.div {...fadeUp(0.3)} className="db-section">
                        <h3 className="section-title">Collection Metrics</h3>
                        <div className="collections-grid">
                            {collections.map((col, idx) => (
                                <motion.div 
                                    key={col.name} 
                                    className="collection-card"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + (idx * 0.05) }}
                                >
                                    <div className="col-header">
                                        <div className="col-name">{col.name}</div>
                                        <div className="col-size-badge">{formatBytes(col.storageSize + col.indexSize)}</div>
                                    </div>
                                    <div className="col-stats">
                                        <div className="col-stat">
                                            <span>Documents</span>
                                            <strong>{col.count.toLocaleString()}</strong>
                                        </div>
                                        <div className="col-stat">
                                            <span>Data Size</span>
                                            <strong>{formatBytes(col.size)}</strong>
                                        </div>
                                        <div className="col-stat">
                                            <span>Index Size</span>
                                            <strong>{formatBytes(col.indexSize)}</strong>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}
