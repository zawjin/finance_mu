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
        p: { xs: 2.5, md: 3.5 }, borderRadius: '28px',
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
                position: 'relative', zIndex: 10, px: { xs: 2, md: 4 }, py: 2,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(20px)'
            }}>
                <Box display="flex" alignItems="center" gap={{ xs: 1.5, md: 2 }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}>
                        <Box sx={{ 
                            p: { xs: 1, md: 1.2 }, 
                            borderRadius: '50%', 
                            border: '2px solid #6366f1', 
                            color: '#6366f1', 
                            display: 'flex', 
                            boxShadow: '0 0 18px rgba(99,102,241,0.5)' 
                        }}>
                            <Activity size={window.innerWidth < 600 ? 18 : 22} />
                        </Box>
                    </motion.div>
                    <Box>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 900, 
                            lineHeight: 1.1,
                            fontSize: { xs: '1rem', md: '1.25rem' },
                            letterSpacing: '-0.02em', 
                            background: 'linear-gradient(90deg, #fff 40%, #6366f1)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent' 
                        }}>
                            FRIDAY AI Analyst
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, fontSize: { xs: '0.6rem', md: '0.75rem' }, letterSpacing: '0.12em', display: 'block' }}>
                            {window.innerWidth < 600 ? 'RISK & WEALTH ENGINE' : 'PROFESSIONAL RISK & WEALTH ANALYSIS ENGINE'}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: '#fff', border: '1px solid rgba(255,255,255,0.15)', '&:hover': { background: '#f43f5e', borderColor: '#f43f5e' } }}>
                    <X size={20} />
                </IconButton>
            </Box>

            {/* BODY */}
            <Box sx={{ 
                position: 'relative', 
                zIndex: 1, 
                p: { xs: 2, md: 5 }, 
                overflowY: 'auto', 
                height: 'calc(100vh - 70px)',
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }
            }}>
                <AnimatePresence mode="wait">
                    {loading ? (
                        <Box key="loader" component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="75vh" textAlign="center" px={3}>
                            <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                                <Box sx={{ width: { xs: 100, md: 130 }, height: { xs: 100, md: 130 }, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'grid', placeItems: 'center', boxShadow: '0 0 60px rgba(99,102,241,0.4)', mb: 4 }}>
                                    <Fingerprint size={window.innerWidth < 600 ? 48 : 64} color="#fff" />
                                </Box>
                            </motion.div>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: LOADING_STEPS[loadingStep].color, mb: 1, fontSize: { xs: '1.25rem', md: '2.125rem' } }}>
                                {LOADING_STEPS[loadingStep].text}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.5 }}>Neural processing in progress…</Typography>
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

                            {/* ── SCORE HERO SECTION ── */}
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: { xs: 'column', md: 'row' },
                                gap: { xs: 3, md: 4 }, 
                                mb: 4, 
                                p: { xs: 3, md: 4 }, 
                                borderRadius: '32px', 
                                background: `linear-gradient(135deg, ${accentColor}12, rgba(255,255,255,0.01))`, 
                                border: `1px solid ${accentColor}25`, 
                                alignItems: { xs: 'center', md: 'center' },
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Glowing backdrop */}
                                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: accentColor, filter: 'blur(100px)', opacity: 0.15, pointerEvents: 'none' }} />

                                {/* Score Circle */}
                                <Box sx={{ position: 'relative', width: { xs: 120, md: 140 }, height: { xs: 120, md: 140 }, flexShrink: 0 }}>
                                    <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
                                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                                        <motion.circle cx="50" cy="50" r="44" fill="none" stroke={accentColor}
                                            strokeWidth="8" strokeLinecap="round"
                                            strokeDasharray={`${score * 2.76} 276`}
                                            initial={{ strokeDasharray: '0 276' }}
                                            animate={{ strokeDasharray: `${score * 2.76} 276` }}
                                            transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
                                            transform="rotate(-90 50 50)"
                                        />
                                    </svg>
                                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography sx={{ fontWeight: 900, fontSize: { xs: '2.2rem', md: '2.5rem' }, color: accentColor, lineHeight: 1 }}>{score}</Typography>
                                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8' }}>SCORE</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                                    <Box sx={{ display: 'inline-flex', px: 1.5, py: 0.5, borderRadius: '100px', background: `${accentColor}25`, mb: 1.5 }}>
                                        <Typography sx={{ fontWeight: 900, fontSize: '0.65rem', color: accentColor, letterSpacing: '0.1em' }}>
                                            STATUS: {data.status}
                                        </Typography>
                                    </Box>
                                    <Typography variant="h4" sx={{ 
                                        fontWeight: 900, 
                                        color: '#fff', 
                                        lineHeight: 1.2, 
                                        mb: 2,
                                        fontSize: { xs: '1.4rem', md: '1.8rem' },
                                        letterSpacing: '-0.02em'
                                    }}>
                                        {data.score_explanation || 'Neural processing complete.'}
                                    </Typography>
                                    
                                    {/* Key Metrics Grid */}
                                    <Grid container spacing={2}>
                                        {[
                                            { label: 'SAVINGS', value: fmt(data.metrics?.total_savings), color: '#10b981' },
                                            { label: 'ASSETS', value: fmt(data.metrics?.total_investment), color: '#6366f1' },
                                            { label: 'LIABILITIES', value: fmt(data.metrics?.credit_outstanding), color: '#f43f5e' },
                                            { label: 'AVG SPEND', value: fmt(data.metrics?.monthly_avg_spend), color: '#f59e0b' },
                                        ].map(m => (
                                            <Grid item xs={6} sm={3} key={m.label}>
                                                <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: '#64748b', letterSpacing: '0.08em', mb: 0.2 }}>{m.label}</Typography>
                                                <Typography sx={{ fontSize: { xs: '0.85rem', md: '1rem' }, fontWeight: 900, color: m.color }}>{m.value}</Typography>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </Box>

                            {/* ── GRID CONTENT ── */}
                            <Grid container spacing={{ xs: 2, md: 3 }} mb={3}>
                                <Grid item xs={12} md={4}>
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                                        <SectionCard icon={<TrendingUp size={18} />} title="1 — CASH FLOW" color="#10b981">
                                            <InfoRow label="Monthly Surplus" value={data.cash_flow?.monthly_surplus_deficit} valueColor="#10b981" />
                                            <InfoRow label="Expense Ratio" value={data.cash_flow?.expense_ratio} />
                                        </SectionCard>
                                    </motion.div>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                        <SectionCard icon={<ShieldAlert size={18} />} title="2 — RISK VECTORS" color={riskColor}>
                                            <InfoRow label="Risk Level" value={debtRisk} valueColor={riskColor} />
                                            <Box mt={1.5}>
                                                <Box sx={{ height: 6, borderRadius: 10, bgcolor: 'rgba(255,255,255,0.05)', overflow: 'hidden', mb: 1.5 }}>
                                                    <motion.div initial={{ width: 0 }} animate={{ width: debtRisk === 'High' ? '85%' : debtRisk === 'Medium' ? '50%' : '20%' }}
                                                        transition={{ duration: 1, delay: 0.6 }}
                                                        style={{ height: '100%', background: riskColor, borderRadius: 10 }} />
                                                </Box>
                                            </Box>
                                            <InfoRow label="Emergency Fund" value={data.risk?.emergency_fund_status} />
                                        </SectionCard>
                                    </motion.div>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                                        <SectionCard icon={<CreditCard size={18} />} title="3 — DEBT PRIORITY" color="#f43f5e">
                                            {(data.debt_strategy?.priority_order || []).length > 0 ? (
                                                <Stack spacing={1} mb={2}>
                                                    {data.debt_strategy.priority_order.map((d, i) => (
                                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.2, borderRadius: '12px', bgcolor: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.1)' }}>
                                                            <Box sx={{ width: 20, height: 20, borderRadius: '6px', bgcolor: '#f43f5e', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: '#fff' }}>{i + 1}</Typography>
                                                            </Box>
                                                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#fda4af' }}>{d}</Typography>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            ) : (
                                                <Typography sx={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 800, mb: 2 }}>✓ No liabilities detected.</Typography>
                                            )}
                                            <InfoRow label="Strategy" value={data.debt_strategy?.repayment_plan} />
                                        </SectionCard>
                                    </motion.div>
                                </Grid>
                            </Grid>

                            {/* ── ROW 2: Investment + Optimization ── */}
                            <Grid container spacing={{ xs: 2, md: 3 }} mb={3}>
                                <Grid item xs={12} md={6}>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                                        <SectionCard icon={<BarChart3 size={18} />} title="4 — ASSET ALLOCATION" color="#6366f1">
                                            <InfoRow label="Distribution" value={data.investment_analysis?.asset_allocation} />
                                            <InfoRow label="Key Gaps" value={data.investment_analysis?.concerns} valueColor="#f59e0b" />
                                        </SectionCard>
                                    </motion.div>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                                        <SectionCard icon={<PiggyBank size={18} />} title="5 — OPTIMIZATION" color="#f59e0b">
                                            <InfoRow label="Burn Rate" value={data.optimization?.reduce_expenses} valueColor="#f43f5e" />
                                            <InfoRow label="Growth Path" value={data.optimization?.increase_savings} valueColor="#10b981" />
                                        </SectionCard>
                                    </motion.div>
                                </Grid>
                            </Grid>

                            {/* ── ROW 3: Category Insights ── */}
                            <Box mb={3}>
                                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}>
                                    <SectionCard icon={<Lightbulb size={18} />} title="6 — NEURAL INSIGHTS" color="#ec4899">
                                        {data.category_advice && data.category_advice.length > 0 ? (
                                            <Grid container spacing={2}>
                                                {data.category_advice.map((item, idx) => (
                                                    <Grid item xs={12} sm={6} md={4} key={idx}>
                                                        <Box sx={{
                                                            p: 2.5, borderRadius: '20px', background: 'rgba(255,255,255,0.02)',
                                                            border: '1px solid rgba(236, 72, 153, 0.15)', height: '100%',
                                                            transition: '0.3s',
                                                            '&:hover': { background: 'rgba(236, 72, 153, 0.05)', borderColor: '#ec4899' }
                                                        }}>
                                                            <Typography sx={{fontSize: '0.65rem', fontWeight: 900, color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1}}>{item.category}</Typography>
                                                            <Typography sx={{fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, fontWeight: 500}}>{item.advice}</Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        ) : (
                                            <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>No localized advice generated.</Typography>
                                        )}
                                    </SectionCard>
                                </motion.div>
                            </Box>

                            {/* ── ROW 4: Action Plan ── */}
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                                <Paper sx={{
                                    p: { xs: 3, md: 4 }, borderRadius: '32px',
                                    background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(16,185,129,0.08))',
                                    border: '1.5px solid rgba(99,102,241,0.2)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, background: '#6366f1', filter: 'blur(150px)', opacity: 0.1 }} />
                                    
                                    <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                                        <Zap size={22} color="#f59e0b" />
                                        <Typography sx={{ fontWeight: 900, color: '#fff', letterSpacing: '0.12em', fontSize: { xs: '0.75rem', md: '0.85rem' } }}>
                                            7 — IMMEDIATE ACTION PROTOCOL
                                        </Typography>
                                    </Box>
                                    <Grid container spacing={2}>
                                        {(data.action_plan || []).map((step, i) => (
                                            <Grid item xs={12} sm={6} lg={4} key={i}>
                                                <Box sx={{
                                                    p: 2.5, borderRadius: '22px',
                                                    background: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.06)',
                                                    display: 'flex', gap: 2, alignItems: 'flex-start',
                                                    height: '100%',
                                                    transition: '0.3s',
                                                    '&:hover': { background: 'rgba(99,102,241,0.12)', borderColor: '#6366f1', transform: 'translateY(-3px)' }
                                                }}>
                                                    <Box sx={{ 
                                                        width: 28, height: 28, borderRadius: '8px', 
                                                        background: 'linear-gradient(135deg, #6366f1, #06b6d4)', 
                                                        display: 'grid', placeItems: 'center', flexShrink: 0,
                                                        boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                                                    }}>
                                                        <Typography sx={{ fontWeight: 900, fontSize: '0.75rem', color: '#fff' }}>{i + 1}</Typography>
                                                    </Box>
                                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.5 }}>{step}</Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>
                            </motion.div>

                        </Box>
                    )}
                </AnimatePresence>
            </Box>
        </Dialog>
    );
}
