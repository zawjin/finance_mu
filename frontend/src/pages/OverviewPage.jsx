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
import './OverviewPage.scss';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// --- Styled Components Engine ---
const MaterialGlassCard = ({ children, dark = false, sx = {} }) => (
    <Paper
        elevation={0}
        className={dark ? 'dark-glass-elite' : 'elevated-glass'}
        sx={sx}
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
        <Box className="overview-loading-viewport">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <ActivitySquare size={48} color="#663399" />
            </motion.div>
        </Box>
    );

    return (
        <Box component="main" className="overview-container">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>

                {/* Header */}
                <Box className="console-header">
                    <Typography variant="h4" className="header-title">Financial Console</Typography>
                    <Typography variant="body2" color="text.secondary" className="header-subtitle">Central Intelligence Pipeline</Typography>
                </Box>

                {/* Stats Grid */}
                <Grid container spacing={3} mb={5}>
                    {[
                        {label: 'NET WORTH', val: financialPulse.netWorth, icon: <ActivitySquare />, bg: 'rgba(102, 51, 153, 0.1)', color: '#663399'},
                        {label: 'LIQUIDITY', val: financialPulse.grossLiquidity, icon: <BankIcon />, bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50'},
                        {label: 'LIABILITY', val: financialPulse.grossLiabilities, icon: <Flame />, bg: 'rgba(244, 67, 54, 0.1)', color: '#f44336'},
                        {label: 'YIELD', val: `${financialPulse.profitMargin.toFixed(2)}%`, icon: <Zap />, bg: 'rgba(255, 193, 7, 0.1)', color: '#ffc107'}
                    ].map((card, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <MaterialGlassCard>
                                <Box className="stats-card-inner">
                                    <Avatar className="avatar-stats-card" style={{ backgroundColor: card.bg, color: card.color }}>{card.icon}</Avatar>
                                    <Box>
                                        <Typography variant="caption" className="stats-label">{card.label}</Typography>
                                        <Typography variant="h5" className="stats-value">{typeof card.val === 'number' ? formatCurrency(card.val) : card.val}</Typography>
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
                            <MaterialGlassCard className="h-full flex-col">
                                <Box p={3} className="flex-1 flex-col">
                                    <Typography className="analytic-overline-purple">Architecture</Typography>
                                    <Box className="donut-chart-box">
                                        <Doughnut data={chartConfig.doughnut} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false, cutout: '72%' }} />
                                        <Box className="chart-center-label">
                                            <Typography className="micro-label-grey">BURN</Typography>
                                            <Typography className="micro-val-bold">₹{(spendingData.total / 1000).toFixed(1)}k</Typography>
                                        </Box>
                                    </Box>
                                    <Stack spacing={1}>
                                        {spendingData.config.labels.slice(0, 2).map((lbl, idx) => (
                                            <Box key={lbl} className="architecture-meta-row">
                                                <Typography className="arch-meta-label">{lbl}</Typography>
                                                <Typography className="arch-meta-val">{formatCurrency(spendingData.config.datasets[0].data[idx])}</Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            </MaterialGlassCard>
                        </Grid>

                        {/* 2. Trajectory */}
                        <Grid item xs={12} md={3.5}>
                            <MaterialGlassCard className="p-3 h-full">
                                <Box className="trajectory-header">
                                    <Typography className="analytic-overline-green">Trajectory</Typography>
                                    <Typography className="trajectory-val-primary">{formatCurrency(trendAnalysis.cumulative.slice(-1)[0] || 0)}</Typography>
                                </Box>
                                <Box className="chart-viewport-std">
                                    <Line data={chartConfig.trajectory} options={{ plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { weight: '800', size: 10 }, color: '#aaa' } } }, maintainAspectRatio: false }} />
                                </Box>
                            </MaterialGlassCard>
                        </Grid>

                        {/* 3. Velocity */}
                        <Grid item xs={12} md={3.5}>
                            <MaterialGlassCard className="p-3 h-full">
                                <Box className="trajectory-header">
                                    <Typography className="analytic-overline-purple">Velocity</Typography>
                                    <Typography className="trajectory-val-secondary">{formatCurrency(trendAnalysis.daily.reduce((a, b) => a + b, 0) / (trendAnalysis.daily.length || 1))}/day</Typography>
                                </Box>
                                <Box className="chart-viewport-std">
                                    <Bar data={chartConfig.velocity} options={{ plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { weight: '800', size: 10 }, color: '#aaa' } } }, maintainAspectRatio: false }} />
                                </Box>
                            </MaterialGlassCard>
                        </Grid>

                        {/* 4. Yearly Obligations */}
                        <Grid item xs={12} md={2.5}>
                            <MaterialGlassCard className="h-full flex-col">
                                <Box className="yearly-obligation-inner">
                                    <Typography className="analytic-overline-dark">Yearly Obligations</Typography>
                                    <Typography variant="caption" className="yearly-meta-desc">Fixed overhead accrual</Typography>
                                    <Box className="flex-1-center-col">
                                        <Box className="margin-b-4">
                                            <Typography variant="h5" className="yearly-total-val">{formatCurrency(financialPulse.totalYearly)}</Typography>
                                            <Typography className="yearly-micro-label">ANNUAL TOTAL</Typography>
                                        </Box>
                                        <Box className="sip-highlight-box">
                                            <Typography className="sip-val-primary">{formatCurrency(financialPulse.monthlyObligation)}</Typography>
                                            <Typography className="sip-micro-label">MONTHLY SIP</Typography>
                                        </Box>
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
                        <MaterialGlassCard className="p-3 h-full flex-col">
                            <Typography className="quad-card-title">Asset Distribution</Typography>
                            <Typography variant="caption" color="text.secondary" className="margin-b-3-block text-dim">Portfolio weight</Typography>
                            <Box className="flex-1-center-col">
                                <Box className="donut-viewport-mini">
                                    <Doughnut data={allocationData.config} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                                    <Box className="chart-center-label">
                                        <Typography variant="h6" className="font-bold-800">{allocationData.topPct}%</Typography>
                                        <Typography className="micro-label-faint">ACTIVE</Typography>
                                    </Box>
                                </Box>
                                <Stack spacing={1.5}>
                                    {allocationData.config.labels.slice(0, 3).map((lbl, idx) => (
                                        <Box key={lbl}>
                                            <Stack direction="row" justifyContent="space-between" className="margin-b-0-4">
                                                <Typography className="quad-meta-label">{lbl}</Typography>
                                                <Typography className="quad-meta-val">{formatCurrency(allocationData.config.datasets[0].data[idx])}</Typography>
                                            </Stack>
                                            <LinearProgress variant="determinate" value={(allocationData.config.datasets[0].data[idx] / allocationData.total) * 100} className="quad-progress-bar" style={{ '--bar-color': allocationData.config.datasets[0].backgroundColor[idx] }} />
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        </MaterialGlassCard>
                    </Grid>

                    {/* 2. Audit Distribution (4/12 = 33%) */}
                    <Grid item xs={12} md={4} xl={4}>
                        <MaterialGlassCard className="p-3 h-full flex-col">
                            <Typography className="quad-card-title">Audit Distribution</Typography>
                            <Typography variant="caption" color="text.secondary" className="margin-b-3-block text-dim">Spending density</Typography>
                            <Box className="flex-1-center-col">
                                <Box className="donut-viewport-mini">
                                    <Doughnut data={spendingData.config} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                                    <Box className="chart-center-label">
                                        <Typography variant="h6" className="font-bold-800">₹{(spendingData.total / 1000).toFixed(1)}k</Typography>
                                        <Typography className="micro-label-faint">BURN</Typography>
                                    </Box>
                                </Box>
                                <Stack spacing={1.5}>
                                    {spendingData.config.labels.slice(0, 3).map((lbl, idx) => (
                                        <Box key={lbl}>
                                            <Stack direction="row" justifyContent="space-between" className="margin-b-0-4">
                                                <Typography className="quad-meta-label">{lbl}</Typography>
                                                <Typography className="quad-meta-val">{formatCurrency(spendingData.config.datasets[0].data[idx])}</Typography>
                                            </Stack>
                                            <LinearProgress variant="determinate" value={(spendingData.config.datasets[0].data[idx] / spendingData.total) * 100} className="quad-progress-bar" style={{ '--bar-color': spendingData.config.datasets[0].backgroundColor[idx] }} />
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        </MaterialGlassCard>
                    </Grid>

                    {/* 3. Integrated Liquidity Edge (4/12 = 33.3%) */}
                    <Grid item xs={12} md={4} xl={4}>
                        <MaterialGlassCard className="h-full">
                            <Box className="ledger-header">
                                <Typography className="quad-card-title">Unified Ledger</Typography>
                                <Typography variant="caption" className="text-dim">Real-time balances & debt exposure</Typography>
                            </Box>
                            <Box p={2}>
                                <Grid container spacing={2}>
                                    {/* Accounts Column - 100% on Mobile, 50% on Tablet/Desktop */}
                                    <Grid item xs={6} className="ledger-col-divider">
                                        <Typography variant="overline" className="ledger-section-title color-purple">Accounts</Typography>
                                        {reserves?.filter(r => r.account_type !== 'CREDIT_CARD').slice(0, 5).map((r) => (
                                            <Box key={r._id} className="ledger-row-fancy">
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar className="avatar-ledger-purple"><BankIcon size={16} /></Avatar>
                                                    <Box>
                                                        <Typography className="ledger-entity-name">{r.account_name}</Typography>
                                                        <Typography className="ledger-sub-type">{r.account_type.split('_')[0]}</Typography>
                                                    </Box>
                                                </Stack>
                                                <Typography className="ledger-val-amount">{formatCurrency(r.balance)}</Typography>
                                            </Box>
                                        ))}
                                    </Grid>
                                    {/* Debt Column - 100% on Mobile, 50% on Tablet/Desktop */}
                                    <Grid item xs={6}>
                                        <Typography variant="overline" className="ledger-section-title color-red">Exposure</Typography>
                                        {debt?.filter(d => d.status !== 'SETTLED').slice(0, 5).map((d) => (
                                            <Box key={d._id} className="ledger-row-fancy">
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar className={d.direction === 'OWED_TO_ME' ? 'avatar-ledger-green' : 'avatar-ledger-red'}>
                                                        {d.direction === 'OWED_TO_ME' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography className="ledger-entity-name">{d.person}</Typography>
                                                        <Typography className="ledger-sub-type">{d.direction === 'OWED_TO_ME' ? 'Rec' : 'Liab'}</Typography>
                                                    </Box>
                                                </Stack>
                                                <Typography className="ledger-val-amount">{formatCurrency(d.amount)}</Typography>
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
                    <Box className="ledger-header">
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Neural Audit Logs</Typography>
                        <Typography variant="caption" color="text.secondary">Synchronized History</Typography>
                    </Box>
                    <Box className="audit-logs-viewport">
                        {spending?.slice(0, 8).map((tx) => (
                            <Box key={tx._id} className="audit-row-premium">
                                <Stack direction="row" spacing={2.5} alignItems="center">
                                    <Avatar className="avatar-audit-log"><Briefcase size={22} /></Avatar>
                                    <Box>
                                        <Typography className="audit-desc-text">{tx.description}</Typography>
                                        <Typography variant="caption" className="audit-sub-label">{tx.category} • {tx.sub_category}</Typography>
                                    </Box>
                                </Stack>
                                <Box className="text-right">
                                    <Typography className="audit-val-text">{formatCurrency(tx.amount)}</Typography>
                                    <Typography variant="caption" className="audit-date-label">{dayjs(tx.date).format('DD MMM, YYYY')}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </MaterialGlassCard>

            </motion.div>
        </Box>
    );
}
