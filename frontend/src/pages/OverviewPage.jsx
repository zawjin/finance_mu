import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, CreditCard, PieChart, Activity, Zap, ShieldCheck, History, Tag, Calendar, MoreHorizontal, ArrowRight, Handshake } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend, ArcElement, Filler } from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, ArcElement, Filler);

import { formatCurrency } from '../utils/formatters';
import Loader from '../components/ui/Loader';

// UI STRATEGIC COMPONENTS
const Box = ({ children, sx, ...props }) => <div style={{ ...sx, ...props }}>{children}</div>;
const Typography = ({ children, variant, sx, ...props }) => {
    const Component = variant?.startsWith('h') ? variant : 'div';
    return <Component style={{ ...sx, ...props }}>{children}</Component>;
};
const Container = ({ children, sx, ...props }) => <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto', ...sx, ...props }}>{children}</div>;
const Paper = ({ children, sx, ...props }) => <div style={{ background: '#fff', borderRadius: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.03)', padding: '2rem', border: '1px solid #f1f5f9', ...sx, ...props }}>{children}</div>;
const Grid = ({ children, container, spacing, item, xs, md, lg, sx, ...props }) => {
    if (container) return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: `${spacing * 0.75}rem`, ...sx, ...props }}>{children}</div>;
    const span = lg ? lg : md ? md : xs ? xs : 12;
    return <div style={{ gridColumn: `span ${span}`, ...sx, ...props }}>{children}</div>;
};
const Stack = ({ children, spacing, ...props }) => <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing * 0.5}rem`, ...props }}>{children}</div>;

import api from '../utils/api';

export default function OverviewPage() {
    const { summary, loading, spending } = useSelector(state => state.finance);
    const [viewMode, setViewMode] = useState('MONTHLY'); 
    const [aiInsights, setAiInsights] = useState(null);

    React.useEffect(() => {
        api.get('/ai-insights')
            .then(res => setAiInsights(res.data[0]))
            .catch(err => console.error("Neural intelligence link unstable", err));
    }, []);

    const recentAudit = useMemo(() => {
        return [...(spending || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
    }, [spending]);

    const chartData = useMemo(() => {
        if (!summary) return { labels: [], datasets: [] };
        let rawData = {};
        if (viewMode === 'MONTHLY' && summary?.monthly_spending) rawData = summary.monthly_spending;
        else if (viewMode === 'DAILY' && summary?.daily_spending) {
            const keys = Object.keys(summary.daily_spending).sort().slice(-20);
            keys.forEach(k => rawData[k] = summary.daily_spending[k]);
        }
        const labels = Object.keys(rawData).sort();
        return {
            labels: labels.map(l => l.split('-').slice(1).join('/')),
            datasets: [{
                label: `Capital Flow`,
                data: labels.map(l => rawData[l]),
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                borderColor: '#6366f1',
                borderWidth: 4,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 3,
                pointRadius: 6,
                tension: 0.45,
                fill: true
            }]
        };
    }, [summary, viewMode]);

    if (loading) return <Loader message="Generating Strategic Ledger..." />;

    const totalAssets = summary?.total_investment || 0;
    const totalWithdrawn = summary?.total_withdrawn || 0;
    const profitPct = parseFloat(summary?.overall_profit_pct || 0);

    const netDebt = (summary?.debt_receivables || 0) - (summary?.debt_liabilities || 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: '#f8fafc', minHeight: '100vh', padding: '3rem' }}>
            <Container>
                
                {/* ELITE HEADER BAR */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04rem', fontSize: '3.2rem', lineHeight: 1 }}>SYSTEM OVERVIEW</Typography>
                        <Typography sx={{ color: '#64748b', fontWeight: 800, fontSize: '1.2rem', marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Activity size={20} color="#10b981" /> FRIDAY Neural Engine Active • Precision Audit Stream
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', background: '#fff', padding: '0.5rem', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' }}>
                        {['DAILY', 'MONTHLY'].map(v => (
                            <div key={v} onClick={() => setViewMode(v)} style={{ padding: '0.8rem 2rem', borderRadius: '14px', cursor: 'pointer', fontWeight: 900, fontSize: '1rem', background: viewMode === v ? '#0f172a' : 'transparent', color: viewMode === v ? '#fff' : '#64748b', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>{v}</div>
                        ))}
                    </Box>
                </Box>

                <Grid container spacing={4} sx={{ marginBottom: '2.5rem' }}>
                    {/* TOTAL AUM DYNAMIC MODULE */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ 
                            background: '#fff', 
                            borderRadius: '28px', 
                            padding: '2.5rem', 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: '1.5rem',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                            height: '100%'
                        }}>
                            <Box sx={{ 
                                width: '60px', height: '60px', borderRadius: '18px', 
                                background: 'linear-gradient(135deg, #6366f1, #4f46e5)', 
                                display: 'grid', placeItems: 'center', flexShrink: 0,
                                boxShadow: '0 8px 15px rgba(79, 70, 229, 0.2)'
                            }}>
                                <Activity size={28} color="#fff" strokeWidth={2.5} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontWeight: 900, color: '#5856d6', letterSpacing: '0.05em', fontSize: '0.85rem', mb: 1 }}>
                                    TOTAL ASSETS (AUM)
                                </Typography>
                                <Typography sx={{ fontWeight: 900, color: '#1d1d1f', fontSize: '2.2rem', letterSpacing: '-0.05rem', lineHeight: 1 }}>
                                    {formatCurrency(totalAssets)}
                                </Typography>
                                <Box sx={{ display: 'flex', mt: 1.5, alignItems: 'center', background: profitPct >= 0 ? '#f0fff4' : '#fff5f5', color: profitPct >= 0 ? '#34c759' : '#ff3b30', px: 1.2, py: 0.5, borderRadius: '8px', fontWeight: 900, fontSize: '0.8rem', width: 'fit-content' }}>
                                    {profitPct >= 0 ? '▲' : '▼'} {Math.abs(profitPct).toFixed(2)}% profit
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* TOTAL WITHDRAWAL DYNAMIC MODULE */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ 
                            background: '#fff', 
                            borderRadius: '28px', 
                            padding: '2.5rem', 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: '1.5rem',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                            height: '100%'
                        }}>
                            <Box sx={{ 
                                width: '60px', height: '60px', borderRadius: '18px', 
                                background: 'linear-gradient(135deg, #fb923c, #f97316)', 
                                display: 'grid', placeItems: 'center', flexShrink: 0,
                                boxShadow: '0 8px 15px rgba(249, 115, 22, 0.2)'
                            }}>
                                <CreditCard size={28} color="#fff" strokeWidth={2.5} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontWeight: 900, color: '#fb923c', letterSpacing: '0.05em', fontSize: '0.85rem', mb: 1 }}>
                                    LIQUIDITY (WITHDRAWN)
                                </Typography>
                                <Typography sx={{ fontWeight: 900, color: '#1d1d1f', fontSize: '2.2rem', letterSpacing: '-0.05rem', lineHeight: 1 }}>
                                    {formatCurrency(totalWithdrawn)}
                                </Typography>
                                <Box sx={{ display: 'flex', mt: 1.5, alignItems: 'center', background: 'rgba(251,146,60,0.1)', color: '#fb923c', px: 1.2, py: 0.5, borderRadius: '8px', fontWeight: 900, fontSize: '0.8rem', width: 'fit-content' }}>
                                    Realized Capital
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* KADAN / DEBT EXPOSURE MODULE */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ 
                            background: '#fff', 
                            borderRadius: '28px', 
                            padding: '2.5rem', 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: '1.5rem',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                            height: '100%'
                        }}>
                            <Box sx={{ 
                                width: '60px', height: '60px', borderRadius: '18px', 
                                background: 'linear-gradient(135deg, #0f172a, #334155)', 
                                display: 'grid', placeItems: 'center', flexShrink: 0,
                                boxShadow: '0 8px 15px rgba(15, 23, 42, 0.2)'
                            }}>
                                <Handshake size={28} color="#fff" strokeWidth={2.5} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontWeight: 900, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.85rem', mb: 1 }}>
                                    NET DEBT EXPOSURE (KADAN)
                                </Typography>
                                <Typography sx={{ fontWeight: 900, color: '#1d1d1f', fontSize: '2.2rem', letterSpacing: '-0.05rem', lineHeight: 1 }}>
                                    {formatCurrency(netDebt)}
                                </Typography>
                                <Box sx={{ display: 'flex', mt: 1.5, alignItems: 'center', background: netDebt >= 0 ? '#f0fff4' : '#fff5f5', color: netDebt >= 0 ? '#34c759' : '#ff3b30', px: 1.2, py: 0.5, borderRadius: '8px', fontWeight: 900, fontSize: '0.8rem', width: 'fit-content' }}>
                                    {netDebt >= 0 ? `+${formatCurrency(summary?.debt_receivables || 0)} Receivable` : `${formatCurrency(summary?.debt_liabilities || 0)} Liability`}
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* NEURAL COMMAND MODULE - FULL WIDTH */}
                    <Grid item xs={12}>
                        <Paper sx={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', borderRadius: '28px', overflow: 'hidden', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3.5rem' }}>
                            <Box>
                                <Typography sx={{ fontWeight: 800, opacity: 0.5, letterSpacing: '0.2em', fontSize: '0.85rem' }}>NEURAL VITALITY SCORE</Typography>
                                <Typography variant="h1" sx={{ fontWeight: 900, margin: '1rem 0', fontSize: '5.5rem', lineHeight: 1 }}>{aiInsights?.score || "--"}<span style={{ fontSize: '1.5rem', opacity: 0.4 }}>/100</span></Typography>
                                <Box sx={{ background: 'rgba(255,255,255,0.08)', px: 3, py: 1.2, borderRadius: '24px', display: 'inline-flex', alignItems: 'center', gap: 1.5, border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <ShieldCheck size={20} color="#10b981" />
                                    <Typography sx={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '0.05em' }}>STRATEGY: {aiInsights?.status?.toUpperCase() || "ANALYZING..."}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right', maxWidth: '600px' }}>
                                <Typography sx={{ fontWeight: 900, color: '#fb923c', marginBottom: '1.5rem', letterSpacing: '0.15em', fontSize: '1rem' }}>PRECISION INTELLIGENCE FEED</Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '1.8rem', lineHeight: 1.5, color: '#e2e8f0' }}>"{aiInsights?.current_state || "Deep scanning financial constellations for tactical signals..."}"</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                <Grid container spacing={5}>
                    {/* VELOCITY LEDGER CHARTS */}
                    <Grid item lg={8}>
                        <Paper sx={{ minHeight: '650px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 2 }}><TrendingUp size={32} color="#6366f1" /> Capital Momentum</Typography>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography sx={{ color: '#94a3b8', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.1em' }}>{viewMode} BANDWIDTH ANALYSIS</Typography>
                                    <Typography sx={{ color: '#0f172a', fontWeight: 900, fontSize: '1.2rem' }}>Live Neural Stream</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ height: '480px' }}>
                                <Line data={chartData} options={{ 
                                    responsive: true, 
                                    maintainAspectRatio: false, 
                                    plugins: { legend: { display: false } },
                                    scales: { 
                                        x: { grid: { display: false }, ticks: { font: { weight: 900, size: 13 }, color: '#64748b', padding: 15 } },
                                        y: { grid: { color: '#f1f5f9', drawBorder: false }, ticks: { font: { weight: 900, size: 13 }, color: '#64748b', padding: 15 } }
                                    } 
                                }} />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* ALLOCATION + EFFICIENCY SIDEBAR */}
                    <Grid item lg={4}>
                        <Stack spacing={5}>
                            <Paper sx={{ border: '2px solid #f1f5f9' }}>
                                <Typography sx={{ fontWeight: 900, color: '#0f172a', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: 2, fontSize: '1.4rem' }}><PieChart size={24} color="#10b981" /> Allocation Target</Typography>
                                <Box sx={{ height: '320px' }}>
                                    <Doughnut data={{
                                        labels: summary?.investment_breakdown ? Object.keys(summary.investment_breakdown) : [],
                                        datasets: [{
                                            data: summary?.investment_breakdown ? Object.values(summary.investment_breakdown).map(v => v.current) : [],
                                            backgroundColor: ['#6366f1', '#fb923c', '#10b981', '#ff3b30', '#0f172a'],
                                            borderWidth: 0,
                                            hoverOffset: 20
                                        }]
                                    }} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                                </Box>
                                <Box sx={{ marginTop: '2.5rem' }}>
                                    {summary?.investment_breakdown && Object.entries(summary.investment_breakdown).map(([label, data], idx) => (
                                        <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, padding: '1rem', borderRadius: '16px', bgcolor: 'rgba(0,0,0,0.02)' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: ['#6366f1', '#fb923c', '#10b981', '#ff3b30', '#0f172a'][idx % 5] }}></div>
                                                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{label}</Typography>
                                            </Box>
                                            <Typography sx={{ fontWeight: 900, fontSize: '0.9rem' }}>{formatCurrency(data.current)}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>

                            {/* AUDIT LOG PREVIEW */}
                            <Paper sx={{ border: 'none', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(30px)' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5 }}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}><History size={24} color="#6366f1" /> Neural Logs</Typography>
                                    <MoreHorizontal size={20} color="#94a3b8" />
                                </Box>
                                <Stack spacing={2}>
                                    {recentAudit.map(log => (
                                        <Box key={log._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', borderRadius: '20px', border: '1px solid #f1f5f9', bgcolor: '#fff', transition: '0.2s', '&:hover': { transform: 'translateX(5px)', borderColor: '#6366f1' } }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6366f1' }}></div>
                                                <Box>
                                                    <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1d1d1f' }}>{log.description}</Typography>
                                                    <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#94a3b8' }}>{log.category.toUpperCase()} • {dayjs(log.date).format('MMM DD')}</Typography>
                                                </Box>
                                            </Box>
                                            <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>-{formatCurrency(log.amount)}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                                <Button fullWidth sx={{ mt: 3.5, borderRadius: '20px', py: 2, fontWeight: 900, bgcolor: 'rgba(0,0,0,0.03)', color: '#0f172a', display: 'flex', gap: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' } }} onClick={() => window.location.href = '/spending'}>VIEW AUDIT STREAM <ArrowRight size={18} /></Button>
                            </Paper>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </motion.div>
    );
}

const Button = ({ children, onClick, sx, ...props }) => (
    <button onClick={onClick} style={{ border: 'none', cursor: 'pointer', outline: 'none', ...sx }} {...props}>
        {children}
    </button>
);
