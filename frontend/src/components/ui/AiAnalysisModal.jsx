import React, { useState, useEffect } from 'react';
import { Dialog, Slide, Box, Typography, IconButton, Stack, Grid, Paper, LinearProgress } from '@mui/material';
import {
    X, Activity, Fingerprint, TrendingUp, TrendingDown, ShieldAlert,
    ShieldCheck, Lightbulb, BarChart3, Wallet, Zap, Target,
    AlertTriangle, CheckCircle2, ArrowRight, CreditCard, PiggyBank, Globe, Cpu, ZapOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const LOADING_STEPS = [
    { text: "INJECTING NEURAL BYTES...", icon: <Cpu />, color: "#06b6d4" },
    { text: "MAPPING CAPITAL NETWORKS...", icon: <Globe />, color: "#8b5cf6" },
    { text: "SCANNING FOR LEAKAGE...", icon: <ZapOff />, color: "#ec4899" },
    { text: "COMPUTING RISK VECTORS...", icon: <TrendingUp />, color: "#10b981" },
    { text: "GENERATING ACTION PLAN...", icon: <Target />, color: "#f59e0b" },
];

const SectionCard = ({ icon, title, color, children }) => (
    <Paper sx={{
        p: 3.5, borderRadius: '28px',
        background: 'rgba(255,255,255,0.025)',
        border: `1.5px solid rgba(255,255,255,0.08)`,
        backdropFilter: 'blur(10px)',
        height: '100%',
        transition: '0.3s',
        '&:hover': { border: `1.5px solid ${color}40`, background: `rgba(255,255,255,0.04)` }
    }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
            <Box sx={{ color, display: 'flex' }}>{icon}</Box>
            <Typography sx={{ fontWeight: 900, color: '#fff', letterSpacing: '0.08em', fontSize: '0.78rem' }}>
                {title}
            </Typography>
        </Box>
        {children}
    </Paper>
);

const InfoRow = ({ label, value, valueColor }) => (
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{
        py: 1.2, borderBottom: '1px solid rgba(255,255,255,0.05)',
        '&:last-child': { borderBottom: 'none' }
    }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', flex: 1, pr: 1 }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: valueColor || '#e2e8f0', textAlign: 'right', flex: 2 }}>{value}</Typography>
    </Box>
);

const RISK_COLOR = { Low: '#10b981', Medium: '#f59e0b', High: '#f43f5e' };

const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : 'N/A';

export default function AiAnalysisModal({ open, onClose }) {
    const [loading, setLoading] = useState(true);
    const [loadingStep, setLoadingStep] = useState(0);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            setLoading(true);
            setLoadingStep(0);
            setData(null);
            setError(null);

            const interval = setInterval(() => {
                setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
            }, 700);

            api.get('/ai/analyze')
                .then(res => {
                    clearInterval(interval);
                    setTimeout(() => {
                        setData(res.data);
                        setLoading(false);
                    }, 800);
                })
                .catch(err => {
                    clearInterval(interval);
                    setError('Analysis failed. Please retry.');
                    setLoading(false);
                });

            return () => clearInterval(interval);
        }
    }, [open]);

    const score = data?.score || 0;
    const accentColor = score > 80 ? '#10b981' : score > 55 ? '#6366f1' : '#f43f5e';
    const debtRisk = data?.risk?.debt_risk_level || 'Medium';
    const riskColor = RISK_COLOR[debtRisk] || '#f59e0b';

    return (
        <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}
            PaperProps={{ sx: { background: '#020617', color: '#fff', position: 'relative', overflowX: 'hidden' } }}>

            {/* ANIMATED BACKGROUND */}
            <Box sx={{ position: 'absolute', inset: 0, opacity: 0.45, pointerEvents: 'none' }}>
                <Box sx={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                    backgroundSize: '48px 48px'
                }} />
                <Box component={motion.div} animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ repeat: Infinity, duration: 10 }}
                    sx={{ position: 'absolute', top: '5%', right: '8%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(120px)' }} />
                <Box component={motion.div} animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
                    transition={{ repeat: Infinity, duration: 12, delay: 3 }}
                    sx={{ position: 'absolute', bottom: '10%', left: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', filter: 'blur(100px)' }} />
            </Box>

            {/* HEADER */}
            <Box sx={{
                position: 'relative', zIndex: 10, px: 4, py: 2,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(20px)'
            }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}>
                        <Box sx={{ p: 1.2, borderRadius: '50%', border: '2px solid #6366f1', color: '#6366f1', display: 'flex', boxShadow: '0 0 18px rgba(99,102,241,0.5)' }}>
                            <Activity size={22} />
                        </Box>
                    </motion.div>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff 40%, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            FRIDAY — AI Financial Advisor
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, letterSpacing: '0.12em' }}>
                            PROFESSIONAL RISK &amp; WEALTH ANALYSIS ENGINE
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: '#fff', border: '1px solid rgba(255,255,255,0.15)', '&:hover': { background: '#f43f5e', borderColor: '#f43f5e' } }}>
                    <X size={20} />
                </IconButton>
            </Box>

            {/* BODY */}
            <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 2.5, md: 5 }, overflowY: 'auto', height: 'calc(100vh - 70px)' }}>
                <AnimatePresence mode="wait">
                    {loading ? (
                        <Box key="loader" component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="75vh" textAlign="center">
                            <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                                <Box sx={{ width: 130, height: 130, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'grid', placeItems: 'center', boxShadow: '0 0 60px rgba(99,102,241,0.4)', mb: 4 }}>
                                    <Fingerprint size={64} color="#fff" />
                                </Box>
                            </motion.div>
                            <Typography variant="h3" sx={{ fontWeight: 900, color: LOADING_STEPS[loadingStep].color, mb: 1 }}>
                                {LOADING_STEPS[loadingStep].text}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.5 }}>AI is processing your complete financial profile…</Typography>
                        </Box>
                    ) : error ? (
                        <Box key="error" display="flex" justifyContent="center" alignItems="center" height="60vh" textAlign="center">
                            <Box>
                                <AlertTriangle size={48} color="#f43f5e" />
                                <Typography variant="h5" sx={{ mt: 2, color: '#f43f5e', fontWeight: 900 }}>{error}</Typography>
                            </Box>
                        </Box>
                    ) : data && (
                        <Box key="data" component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

                            {/* ── SCORE BANNER ── */}
                            <Box sx={{ display: 'flex', gap: 3, mb: 4, p: 4, borderRadius: '32px', background: `linear-gradient(135deg, ${accentColor}18, rgba(255,255,255,0.02))`, border: `2px solid ${accentColor}30`, alignItems: 'center', flexWrap: 'wrap' }}>
                                {/* Score Circle */}
                                <Box sx={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
                                    <svg width="130" height="130" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
                                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                                        <motion.circle cx="50" cy="50" r="44" fill="none" stroke={accentColor}
                                            strokeWidth="6" strokeLinecap="round"
                                            strokeDasharray={`${score * 2.76} 276`}
                                            initial={{ strokeDasharray: '0 276' }}
                                            animate={{ strokeDasharray: `${score * 2.76} 276` }}
                                            transition={{ duration: 1.5, ease: 'easeOut' }}
                                            transform="rotate(-90 50 50)"
                                        />
                                    </svg>
                                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography sx={{ fontWeight: 900, fontSize: '2.2rem', color: accentColor, lineHeight: 1 }}>{score}</Typography>
                                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8' }}>/100</Typography>
                                    </Box>
                                </Box>
                                <Box flex={1} minWidth={200}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '0.7rem', color: accentColor, letterSpacing: '0.15em', mb: 0.5 }}>
                                        FINANCIAL HEALTH SCORE — {data.status}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', lineHeight: 1.3, mb: 1.5 }}>
                                        {data.score_explanation || 'Complete financial analysis ready.'}
                                    </Typography>
                                    {/* Key Metrics Row */}
                                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                        {[
                                            { label: 'SAVINGS', value: fmt(data.metrics?.total_savings), color: '#10b981' },
                                            { label: 'INVESTMENTS', value: fmt(data.metrics?.total_investment), color: '#6366f1' },
                                            { label: 'CARD O/S', value: fmt(data.metrics?.credit_outstanding), color: '#f43f5e' },
                                            { label: 'AVG MONTHLY SPEND', value: fmt(data.metrics?.monthly_avg_spend), color: '#f59e0b' },
                                        ].map(m => (
                                            <Box key={m.label}>
                                                <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: '#64748b', letterSpacing: '0.1em' }}>{m.label}</Typography>
                                                <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: m.color }}>{m.value}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>

                            {/* ── ROW 1: Cash Flow + Risk + Debt Strategy ── */}
                            <Grid container spacing={3} mb={3}>
                                <Grid item xs={12} md={4}>
                                    <SectionCard icon={<TrendingUp size={18} />} title="1 — CASH FLOW ANALYSIS" color="#10b981">
                                        <InfoRow label="Monthly Surplus / Deficit" value={data.cash_flow?.monthly_surplus_deficit} valueColor="#10b981" />
                                        <InfoRow label="Expense Ratio" value={data.cash_flow?.expense_ratio} />
                                    </SectionCard>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <SectionCard icon={<ShieldAlert size={18} />} title="2 — RISK ANALYSIS" color={riskColor}>
                                        <InfoRow label="Debt Risk Level"
                                            value={debtRisk}
                                            valueColor={riskColor} />
                                        <Box mt={1.5}>
                                            <Box sx={{ height: 8, borderRadius: 10, bgcolor: 'rgba(255,255,255,0.05)', overflow: 'hidden', mb: 1.5 }}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: debtRisk === 'High' ? '85%' : debtRisk === 'Medium' ? '50%' : '20%' }}
                                                    transition={{ duration: 1 }}
                                                    style={{ height: '100%', background: riskColor, borderRadius: 10 }} />
                                            </Box>
                                        </Box>
                                        <InfoRow label="Emergency Fund Status" value={data.risk?.emergency_fund_status} />
                                    </SectionCard>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <SectionCard icon={<CreditCard size={18} />} title="3 — DEBT STRATEGY" color="#f43f5e">
                                        {(data.debt_strategy?.priority_order || []).length > 0 ? (
                                            <Stack spacing={1} mb={2}>
                                                {data.debt_strategy.priority_order.map((d, i) => (
                                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: '10px', bgcolor: 'rgba(244,63,94,0.08)' }}>
                                                        <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#f43f5e', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#fff' }}>{i + 1}</Typography>
                                                        </Box>
                                                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#fda4af' }}>{d}</Typography>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Typography sx={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 800, mb: 2 }}>✓ No formal debts recorded.</Typography>
                                        )}
                                        <InfoRow label="Repayment Plan" value={data.debt_strategy?.repayment_plan} />
                                    </SectionCard>
                                </Grid>
                            </Grid>

                            {/* ── ROW 2: Investment + Optimization ── */}
                            <Grid container spacing={3} mb={3}>
                                <Grid item xs={12} md={6}>
                                    <SectionCard icon={<BarChart3 size={18} />} title="4 — INVESTMENT ANALYSIS" color="#6366f1">
                                        <InfoRow label="Asset Allocation" value={data.investment_analysis?.asset_allocation} />
                                        <InfoRow label="Concerns / Gaps" value={data.investment_analysis?.concerns} valueColor="#f59e0b" />
                                    </SectionCard>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <SectionCard icon={<PiggyBank size={18} />} title="5 — OPTIMIZATION SUGGESTIONS" color="#f59e0b">
                                        <InfoRow label="Reduce Expenses" value={data.optimization?.reduce_expenses} valueColor="#f43f5e" />
                                        <InfoRow label="Increase Savings" value={data.optimization?.increase_savings} valueColor="#10b981" />
                                    </SectionCard>
                                </Grid>
                            </Grid>

                            {/* ── ROW 3: Category Insights ── */}
                            <Grid container spacing={3} mb={3}>
                                <Grid item xs={12}>
                                    <SectionCard icon={<Lightbulb size={18} />} title="6 — CATEGORY INSIGHTS & SPECIFIC ADVICE" color="#ec4899">
                                        {data.category_advice && data.category_advice.length > 0 ? (
                                            <Grid container spacing={2}>
                                                {data.category_advice.map((item, idx) => (
                                                    <Grid item xs={12} md={4} key={idx}>
                                                        <Box sx={{
                                                            p: 2, borderRadius: '16px', background: 'rgba(255,255,255,0.02)',
                                                            border: '1px solid rgba(236, 72, 153, 0.2)', height: '100%'
                                                        }}>
                                                            <Typography sx={{fontSize: '0.75rem', fontWeight: 900, color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1}}>{item.category}</Typography>
                                                            <Typography sx={{fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5}}>{item.advice}</Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        ) : (
                                            <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>No specific category alerts generated.</Typography>
                                        )}
                                    </SectionCard>
                                </Grid>
                            </Grid>

                            {/* ── ROW 3: Action Plan (full width) ── */}
                            <Paper sx={{
                                p: 4, borderRadius: '28px',
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.05))',
                                border: '1.5px solid rgba(99,102,241,0.25)'
                            }}>
                                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                                    <Zap size={20} color="#f59e0b" />
                                    <Typography sx={{ fontWeight: 900, color: '#fff', letterSpacing: '0.1em', fontSize: '0.85rem' }}>
                                        7 — ACTION PLAN — 5 STEPS TO TAKE RIGHT NOW
                                    </Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    {(data.action_plan || []).map((step, i) => (
                                        <Grid item xs={12} sm={6} lg={4} key={i}>
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                                <Box sx={{
                                                    p: 2.5, borderRadius: '20px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.07)',
                                                    display: 'flex', gap: 2, alignItems: 'flex-start',
                                                    height: '100%',
                                                    transition: '0.2s',
                                                    '&:hover': { background: 'rgba(99,102,241,0.1)', borderColor: '#6366f1' }
                                                }}>
                                                    <Box sx={{ width: 30, height: 30, borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                                        <Typography sx={{ fontWeight: 900, fontSize: '0.78rem', color: '#fff' }}>{i + 1}</Typography>
                                                    </Box>
                                                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', lineHeight: 1.5 }}>{step}</Typography>
                                                </Box>
                                            </motion.div>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>

                        </Box>
                    )}
                </AnimatePresence>
            </Box>
        </Dialog>
    );
}
