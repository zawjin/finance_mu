import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Activity, Brain, TrendingDown, TrendingUp, 
    ShieldCheck, AlertCircle, Sparkles, Clock, 
    CheckCircle2, Flame, Calendar, PieChart, BarChart3, ChevronRight 
} from 'lucide-react';
import api from '../../utils/api';
import './NeuralPulse.scss';

const NeuralPulse = () => {
    const [activeTab, setActiveTab] = useState('daily');
    const [aiData, setAiData] = useState(null);
    const [loading, setLoading] = useState(true);

    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        
        const fetchAnalysis = async () => {
            try {
                const res = await api.get('/ai/analyze');
                setAiData(res.data);
                hasFetched.current = true;
            } catch (err) {
                console.error("AI PULSE ERROR:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, []);

    const tabs = [
        { id: 'daily', label: 'DAILY AUDIT', icon: <Clock size={14} /> },
        { id: 'weekly', label: 'WEEKLY PULSE', icon: <Calendar size={14} /> },
        { id: 'monthly', label: 'MONTHLY MATRIX', icon: <BarChart3 size={14} /> },
    ];

    if (loading) return (
        <div className="neural-pulse-super loading">
            <div className="loader-inner">
                <Brain className="pulse-icon-anim" />
                <span>SYNCING NEURAL MATRIX...</span>
            </div>
        </div>
    );

    const status = {
        color: aiData?.daily?.score > 70 ? '#34c759' : aiData?.daily?.score > 40 ? '#ff9500' : '#ff3b30',
        label: aiData?.daily?.status
    };

    return (
        <div className={`neural-pulse-super ${status.label?.toLowerCase()}`}>
            <div className="mesh-gradient"></div>
            
            <div className="pulse-header">
                <div className="tab-switcher-glass">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="pulse-content-area"
                >
                    {activeTab === 'daily' && (
                        <div className="daily-matrix-view">
                            <div className="pulse-main-display">
                                <div className="display-left">
                                    <div className="big-stat">
                                        <div className="s-label">ARCHETYPE</div>
                                        <div className="s-value archetype cute-font">{aiData?.neural_meta?.archetype}</div>
                                    </div>
                                </div>
                                <div className="display-right">
                                    <div className="health-harmony">
                                        <div className="h-circle" style={{ '--progress': `${aiData?.metrics?.health_score}%` }}>
                                            <Activity size={12} />
                                        </div>
                                        <div className="h-label">HEALTH {aiData?.metrics?.health_score}%</div>
                                    </div>
                                    <div className="efficiency-box cute-glow" style={{ background: `${status.color}20`, border: `2px solid ${status.color}40` }}>
                                        <div className="e-val" style={{ color: status.color }}>{aiData?.daily?.score}</div>
                                        <div className="e-lbl">PULSE</div>
                                    </div>
                                </div>
                            </div>

                            <div className="daily-audit-list">
                                <div className="a-label">BEHAVIORAL DIAGNOSTICS (10 POINTS)</div>
                                {aiData?.daily?.points?.map((p, i) => (
                                    <div key={i} className={`audit-item ${p.type}`}>
                                        <div className="item-icon">
                                            {p.type === 'warn' ? <AlertCircle size={10} /> : p.type === 'danger' ? <Flame size={10} /> : <CheckCircle2 size={10} />}
                                        </div>
                                        <div className="item-text">{p.text}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'weekly' && (
                        <div className="weekly-matrix-view">
                            <div className="weekly-hero-stats">
                                <div className="w-stat">
                                    <span className="w-lbl">WEEKLY BURN</span>
                                    <span className="w-val">₹{aiData?.weekly?.total?.toLocaleString()}</span>
                                </div>
                                <div className="w-stat">
                                    <span className="w-lbl">DISCIPLINE</span>
                                    <span className="w-val">{aiData?.weekly?.discipline_score}%</span>
                                </div>
                            </div>
                            <div className="weekly-insights">
                                {aiData?.weekly?.points?.map((p, i) => (
                                    <div key={i} className="weekly-point">
                                        <ChevronRight size={10} color="#00d1ff" />
                                        <span>{p}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'monthly' && (
                        <div className="monthly-matrix-view">
                            <div className="monthly-projection">
                                <div className="p-label">MONTHLY MATRIX STATUS</div>
                                <div className="p-value">₹{aiData?.monthly?.total?.toLocaleString()} / ₹{Math.round(aiData?.monthly?.avg).toLocaleString()}</div>
                                <div className="p-progress">
                                    <div className="p-fill" style={{ width: `${Math.min(100, (aiData?.monthly?.total / aiData?.monthly?.avg) * 100)}%`, background: status.color }}></div>
                                </div>
                            </div>
                            <div className="fixed-expense-audit">
                                <div className="f-label">FIXED COST COVERAGE</div>
                                <div className="f-meter">
                                    <div className="f-val">{aiData?.monthly?.fixed_coverage}%</div>
                                    <div className="f-desc">of fixed costs are currently covered by liquid reserves.</div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="pulse-wealth-projection cute-card">
                <div className="w-label">✨ 10-YEAR WEALTH POTENTIAL</div>
                <div className="w-value">₹{Math.round(aiData?.neural_meta?.wealth_10yr).toLocaleString()}</div>
                <div className="w-roadmap">
                    <div className="roadmap-title">THE PATH TO SUCCESS:</div>
                    <div className="roadmap-step">
                        <CheckCircle2 size={12} color={status.color} />
                        <span>Consistent monthly investment into Index Funds.</span>
                    </div>
                </div>
            </div>

            <div className="pulse-footer-advice">
                <div className="ai-mood-icon" style={{ background: `${status.color}20`, color: status.color }}>
                    <ShieldCheck size={18} />
                </div>
                <div className="advice-content">
                    <div className="advice-title" style={{ color: status.color }}>TAMIL NEURAL SUMMARY</div>
                    <div className="advice-text tamil">{aiData?.neural_meta?.tamil_summary}</div>
                </div>
            </div>
        </div>
    );
};

export default NeuralPulse;
