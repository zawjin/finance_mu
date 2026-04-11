import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    Box,
    Typography,
    Paper,
    Stack,
    Avatar,
    useTheme,
    LinearProgress,
    Grid
} from '@mui/material';
import {
    ActivitySquare,
    Zap,
    Flame,
    TrendingUp,
    TrendingDown,
    Briefcase,
    Landmark as BankIcon
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// --- Styled Components Engine ---
const MaterialGlassCard = ({ children, dark = false, sx = {} }) => (
    <Paper
        elevation={0}
        className={dark ? 'dark-glass-elite' : 'elevated-glass'}
        sx={{
            p: 0,
            transition: 'all 0.3s ease',
            ...sx
        }}
    >
        {children}
    </Paper>
);

export default function OverviewPage() {
    const { summary, loading, spending, reserves, investments, debt, yearlyExpenses } = useSelector(state => state.finance);
    const [viewMode, setViewMode] = React.useState('monthly');

    // --- MATH ENGINE ---
    const financialPulse = useMemo(() => {
        let grossLiquidity = 0;
        let creditUtilization = 0;
        reserves?.forEach(r => {
            const bal = parseFloat(r.balance || 0);
            if (r.account_type === 'CREDIT_CARD') creditUtilization += bal;
            else grossLiquidity += bal;
        });

        let owedToMe = 0;
        let IOwe = 0;
        debt?.forEach(d => {
            if (d.status !== 'SETTLED') {
                if (d.direction === 'OWED_TO_ME') owedToMe += parseFloat(d.amount);
                else IOwe += parseFloat(d.amount);
            }
        });

        let totalValuation = 0;
        let totalCost = 0;
        investments?.forEach(i => {
            totalValuation += parseFloat(i.value || 0);
            const qty = parseFloat(i.quantity || 0);
            const price = parseFloat(i.buy_price || 0);
            if (qty && price) totalCost += (qty * price);
            else totalCost += parseFloat(i.value || 0);
        });

        // Yearly Obligations Engine
        const totalYearly = (yearlyExpenses || []).reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
        const monthlyObligation = totalYearly / 12;

        const grossAssets = grossLiquidity + owedToMe + totalValuation;
        const grossLiabilities = creditUtilization + IOwe;
        const netWorth = grossAssets - grossLiabilities;
        const profitMargin = totalCost > 0 ? ((totalValuation - totalCost) / totalCost) * 100 : 0;

        return {
            grossLiquidity, creditUtilization, owedToMe, IOwe, totalValuation, totalCost,
            grossAssets, grossLiabilities, netWorth, profitMargin,
            totalYearly, monthlyObligation
        };
    }, [reserves, debt, investments, yearlyExpenses]);

    const spendingData = useMemo(() => {
        const mix = {};
        spending?.forEach(s => {
            if (!s.metadata?.is_investment) {
                mix[s.category || 'Other'] = (mix[s.category || 'Other'] || 0) + parseFloat(s.amount || 0);
            }
        });
        const labels = Object.keys(mix).sort((a, b) => mix[b] - mix[a]).slice(0, 5);
        const data = labels.map(l => mix[l]);
        return {
            config: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: ['#663399', '#bedbfd', '#4caf50', '#ffc107', '#f44336'],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            total: data.reduce((a, b) => a + b, 0)
        };
    }, [spending]);

    const allocationData = useMemo(() => {
        const mix = {};
        investments?.forEach(i => {
            const val = parseFloat(i.value || 0);
            if (val > 0) mix[i.type || 'Other'] = (mix[i.type || 'Other'] || 0) + val;
        });
        const labels = Object.keys(mix).sort((a, b) => mix[b] - mix[a]).slice(0, 5);
        const data = labels.map(l => mix[l]);
        return {
            config: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: ['#663399', '#bedbfd', '#4caf50', '#ffc107', '#f44336'],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            total: data.reduce((a, b) => a + b, 0),
            topPct: data.length > 0 ? Math.round((data[0] / data.reduce((a, b) => a + b, 0)) * 100) : 0
        };
    }, [investments]);

    const trendAnalysis = useMemo(() => {
        const dailyNet = {};
        spending?.forEach(s => {
            if (!s.metadata?.is_investment) {
                const amt = (parseFloat(s.amount || 0)) - (parseFloat(s.recovered || 0));
                dailyNet[s.date] = (dailyNet[s.date] || 0) + amt;
            }
        });
        const dates = Object.keys(dailyNet).sort();
        let cumulative = 0;
        const cumulativeData = dates.map(d => { cumulative += dailyNet[d]; return cumulative; });

        return {
            labels: dates.map(d => dayjs(d).format('MMM DD')),
            daily: dates.map(d => dailyNet[d]),
            cumulative: cumulativeData
        };
    }, [spending]);

    const chartConfig = useMemo(() => {
        return {
            doughnut: {
                labels: spendingData.config.labels,
                datasets: [{
                    data: spendingData.config.datasets[0].data,
                    backgroundColor: spendingData.config.datasets[0].backgroundColor.map(c => `${c}40`),
                    borderColor: spendingData.config.datasets[0].backgroundColor,
                    borderWidth: 2,
                    cutout: '72%'
                }]
            },
            trajectory: {
                labels: trendAnalysis.labels,
                datasets: [{
                    label: 'Cumulative Burn',
                    data: trendAnalysis.cumulative,
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 2
                }]
            },
            velocity: {
                labels: trendAnalysis.labels,
                datasets: [{
                    label: 'Daily Burn',
                    data: trendAnalysis.daily,
                    backgroundColor: 'rgba(102, 51, 153, 0.4)',
                    borderColor: '#663399',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            }
        };
    }, [spendingData, trendAnalysis]);

    if (loading && !summary) return (
        <Box sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <ActivitySquare size={48} color="#663399" />
            </motion.div>
        </Box>
    );

    return (
        <Box component="main" sx={{
            width: '100%',
            minHeight: '100vh',
            bgcolor: '#f1f3f4',
            py: 4,
            px: { xs: 2, md: 4 },
            overflowX: 'hidden',
            boxSizing: 'border-box'
        }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>

                {/* Header */}
                <Box mb={4}>
                    <Typography variant="h4" sx={{ color: '#444', fontWeight: 600, mb: 0.5 }}>Financial Console</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>Central Intelligence Pipeline</Typography>
                </Box>

                {/* Stats Grid */}
                <Grid container spacing={3} mb={5}>
                    {[
                        { label: 'NET WORTH', val: financialPulse.netWorth, icon: <ActivitySquare />, bg: 'rgba(102, 51, 153, 0.1)', color: '#663399' },
                        { label: 'LIQUIDITY', val: financialPulse.grossLiquidity, icon: <BankIcon />, bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' },
                        { label: 'LIABILITY', val: financialPulse.grossLiabilities, icon: <Flame />, bg: 'rgba(244, 67, 54, 0.1)', color: '#f44336' },
                        { label: 'YIELD', val: `${financialPulse.profitMargin.toFixed(2)}%`, icon: <Zap />, bg: 'rgba(255, 193, 7, 0.1)', color: '#ffc107' }
                    ].map((card, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <MaterialGlassCard>
                                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                    <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 56, height: 56 }}>{card.icon}</Avatar>
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#aaa', letterSpacing: '0.05em' }}>{card.label}</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111' }}>{typeof card.val === 'number' ? formatCurrency(card.val) : card.val}</Typography>
                                    </Box>
                                </Box>
                            </MaterialGlassCard>
                        </Grid>
                    ))}
                </Grid>

                {/* Triple Analytics Hub (Ported from SpendingPage) */}
                <Box mb={5}>
                    <Grid container spacing={2.5}>
                        {/* 1. Architecture */}
                        <Grid item xs={12} md={2.5}>
                            <MaterialGlassCard sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="overline" sx={{ fontWeight: 900, color: '#663399', mb: 3, display: 'block' }}>Architecture</Typography>
                                <Box sx={{ flex: 1, position: 'relative', display: 'grid', placeItems: 'center', mb: 3 }}>
                                    <Doughnut data={chartConfig.doughnut} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false, cutout: '72%' }} />
                                    <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                                        <Typography sx={{ fontWeight: 800, color: '#aaa', fontSize: '0.45rem' }}>BURN</Typography>
                                        <Typography sx={{ fontWeight: 900, fontSize: '0.75rem' }}>₹{(spendingData.total / 1000).toFixed(1)}k</Typography>
                                    </Box>
                                </Box>
                                <Stack spacing={1}>
                                    {spendingData.config.labels.slice(0, 2).map((lbl, idx) => (
                                        <Box key={lbl} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#888' }}>{lbl}</Typography>
                                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 900 }}>{formatCurrency(spendingData.config.datasets[0].data[idx])}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </MaterialGlassCard>
                        </Grid>

                        {/* 2. Trajectory */}
                        <Grid item xs={12} md={3.5}>
                            <MaterialGlassCard sx={{ p: 3, height: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="overline" sx={{ fontWeight: 900, color: '#4caf50' }}>Trajectory</Typography>
                                    <Typography sx={{ fontWeight: 900, color: '#4caf50', fontSize: '0.9rem' }}>{formatCurrency(trendAnalysis.cumulative.slice(-1)[0] || 0)}</Typography>
                                </Box>
                                <Box sx={{ height: 200 }}>
                                    <Line data={chartConfig.trajectory} options={{ plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { weight: '800', size: 10 }, color: '#aaa' } } }, maintainAspectRatio: false }} />
                                </Box>
                            </MaterialGlassCard>
                        </Grid>

                        {/* 3. Velocity */}
                        <Grid item xs={12} md={3.5}>
                            <MaterialGlassCard sx={{ p: 3, height: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="overline" sx={{ fontWeight: 900, color: '#663399' }}>Velocity</Typography>
                                    <Typography sx={{ fontWeight: 900, color: '#663399', fontSize: '0.9rem' }}>{formatCurrency(trendAnalysis.daily.reduce((a, b) => a + b, 0) / (trendAnalysis.daily.length || 1))}/day</Typography>
                                </Box>
                                <Box sx={{ height: 200 }}>
                                    <Bar data={chartConfig.velocity} options={{ plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { weight: '800', size: 10 }, color: '#aaa' } } }, maintainAspectRatio: false }} />
                                </Box>
                            </MaterialGlassCard>
                        </Grid>

                        {/* 4. Yearly Obligations */}
                        <Grid item xs={12} md={2.5}>
                            <MaterialGlassCard sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'rgba(0,0,0,0.02)' }}>
                                <Typography variant="overline" sx={{ fontWeight: 900, color: '#1d1d1f', mb: 1, display: 'block' }}>Yearly Obligations</Typography>
                                <Typography variant="caption" sx={{ color: '#86868b', fontWeight: 800, mb: 3, display: 'block' }}>Fixed overhead accrual</Typography>
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Box mb={4}>
                                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#1d1d1f' }}>{formatCurrency(financialPulse.totalYearly)}</Typography>
                                        <Typography sx={{ fontWeight: 800, color: '#aaa', fontSize: '0.6rem' }}>ANNUAL TOTAL</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(102, 51, 153, 0.05)', border: '1px solid rgba(102, 51, 153, 0.1)', mb: 2 }}>
                                        <Typography sx={{ fontWeight: 900, color: '#663399', fontSize: '0.9rem' }}>{formatCurrency(financialPulse.monthlyObligation)}</Typography>
                                        <Typography sx={{ fontWeight: 800, color: '#aaa', fontSize: '0.45rem', textTransform: 'uppercase' }}>MONTHLY SIP</Typography>
                                    </Box>
                                </Box>
                            </MaterialGlassCard>
                        </Grid>
                    </Grid>
                </Box>

                {/* Quadrant Console (STABLE 4-4-4 Split) */}
                <Grid container spacing={3} mb={5}>
                    {/* 1. Asset Distribution (4/12 = 33%) */}
                    <Grid item xs={12} md={4} xl={4}>
                        <MaterialGlassCard sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontSize: '0.9rem' }}>Asset Distribution</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>Portfolio weight</Typography>
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Box sx={{ position: 'relative', width: '100%', maxWidth: 160, mx: 'auto', mb: 4 }}>
                                    <Doughnut data={allocationData.config} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>{allocationData.topPct}%</Typography>
                                        <Typography sx={{ fontWeight: 800, opacity: 0.5, fontSize: '0.55rem' }}>ACTIVE</Typography>
                                    </Box>
                                </Box>
                                <Stack spacing={1.5}>
                                    {allocationData.config.labels.slice(0, 3).map((lbl, idx) => (
                                        <Box key={lbl}>
                                            <Stack direction="row" justifyContent="space-between" mb={0.4}>
                                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#666' }}>{lbl}</Typography>
                                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800 }}>{formatCurrency(allocationData.config.datasets[0].data[idx])}</Typography>
                                            </Stack>
                                            <LinearProgress variant="determinate" value={(allocationData.config.datasets[0].data[idx] / allocationData.total) * 100} sx={{ height: 4, borderRadius: 2, bgcolor: '#f1f1f1', '& .MuiLinearProgress-bar': { bgcolor: allocationData.config.datasets[0].backgroundColor[idx] } }} />
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        </MaterialGlassCard>
                    </Grid>

                    {/* 2. Audit Distribution (4/12 = 33%) */}
                    <Grid item xs={12} md={4} xl={4}>
                        <MaterialGlassCard sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontSize: '0.9rem' }}>Audit Distribution</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>Spending density</Typography>
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Box sx={{ position: 'relative', width: '100%', maxWidth: 160, mx: 'auto', mb: 4 }}>
                                    <Doughnut data={spendingData.config} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>₹{(spendingData.total / 1000).toFixed(1)}k</Typography>
                                        <Typography sx={{ fontWeight: 800, opacity: 0.5, fontSize: '0.55rem' }}>BURN</Typography>
                                    </Box>
                                </Box>
                                <Stack spacing={1.5}>
                                    {spendingData.config.labels.slice(0, 3).map((lbl, idx) => (
                                        <Box key={lbl}>
                                            <Stack direction="row" justifyContent="space-between" mb={0.4}>
                                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#666' }}>{lbl}</Typography>
                                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800 }}>{formatCurrency(spendingData.config.datasets[0].data[idx])}</Typography>
                                            </Stack>
                                            <LinearProgress variant="determinate" value={(spendingData.config.datasets[0].data[idx] / spendingData.total) * 100} sx={{ height: 4, borderRadius: 2, bgcolor: '#f1f1f1', '& .MuiLinearProgress-bar': { bgcolor: spendingData.config.datasets[0].backgroundColor[idx] } }} />
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        </MaterialGlassCard>
                    </Grid>

                    {/* 3. Integrated Liquidity Edge (4/12 = 33.3%) */}
                    <Grid item xs={12} md={4} xl={4}>
                        <MaterialGlassCard sx={{ height: '100%' }}>
                            <Box p={3} sx={{ borderBottom: '1px solid #f1f1f1' }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Unified Ledger</Typography>
                                <Typography variant="caption" color="text.secondary">Real-time balances & debt exposure</Typography>
                            </Box>
                            <Box p={2}>
                                <Grid container spacing={2}>
                                    {/* Accounts Column */}
                                    <Grid item xs={6} sx={{ borderRight: '1.5px dashed #f1f1f1' }}>
                                        <Typography variant="overline" sx={{ fontWeight: 900, mb: 2, display: 'block', color: '#663399', px: 1 }}>Accounts</Typography>
                                        {reserves?.filter(r => r.account_type !== 'CREDIT_CARD').slice(0, 5).map((r) => (
                                            <Box key={r._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, px: 2, borderRadius: '12px', mb: 0.5, '&:hover': { bgcolor: '#f8f9fa' } }}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar sx={{ bgcolor: 'rgba(102, 51, 153, 0.1)', color: '#663399', width: 32, height: 32, borderRadius: '8px' }}><BankIcon size={16} /></Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 800, fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60px' }}>{r.account_name}</Typography>
                                                        <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#aaa' }}>{r.account_type.split('_')[0]}</Typography>
                                                    </Box>
                                                </Stack>
                                                <Typography sx={{ fontWeight: 900, fontSize: '0.75rem' }}>{formatCurrency(r.balance)}</Typography>
                                            </Box>
                                        ))}
                                    </Grid>
                                    {/* Debt Column */}
                                    <Grid item xs={6}>
                                        <Typography variant="overline" sx={{ fontWeight: 900, mb: 2, display: 'block', color: '#f44336', px: 1 }}>Exposure</Typography>
                                        {debt?.filter(d => d.status !== 'SETTLED').slice(0, 5).map((d) => (
                                            <Box key={d._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, px: 2, borderRadius: '12px', mb: 0.5, '&:hover': { bgcolor: '#f8f9fa' } }}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar sx={{ bgcolor: d.direction === 'OWED_TO_ME' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', color: d.direction === 'OWED_TO_ME' ? '#4caf50' : '#f44336', width: 32, height: 32, borderRadius: '8px' }}>{d.direction === 'OWED_TO_ME' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}</Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 800, fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60px' }}>{d.person}</Typography>
                                                        <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#aaa' }}>{d.direction === 'OWED_TO_ME' ? 'Rec' : 'Liab'}</Typography>
                                                    </Box>
                                                </Stack>
                                                <Typography sx={{ fontWeight: 900, fontSize: '0.75rem' }}>{formatCurrency(d.amount)}</Typography>
                                            </Box>
                                        ))}
                                    </Grid>
                                </Grid>
                            </Box>
                        </MaterialGlassCard>
                    </Grid>
                </Grid>

                {/* Audit Logs */}
                <MaterialGlassCard>
                    <Box p={4} sx={{ borderBottom: '1px solid #f1f1f1' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Neural Audit Logs</Typography>
                        <Typography variant="caption" color="text.secondary">Synchronized History</Typography>
                    </Box>
                    <Box p={2}>
                        {spending?.slice(0, 8).map((tx) => (
                            <Box key={tx._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, px: 3, borderRadius: '15px', mb: 0.5, '&:hover': { bgcolor: '#f8f9fa' } }}>
                                <Stack direction="row" spacing={2.5} alignItems="center">
                                    <Avatar sx={{ bgcolor: '#fff', border: '1.5px solid #eee', borderRadius: '12px', color: '#663399', width: 46, height: 46 }}><Briefcase size={22} /></Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{tx.description}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#aaa' }}>{tx.category} • {tx.sub_category}</Typography>
                                    </Box>
                                </Stack>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>{formatCurrency(tx.amount)}</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#ccc' }}>{dayjs(tx.date).format('DD MMM, YYYY')}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </MaterialGlassCard>

            </motion.div>
        </Box>
    );
}
