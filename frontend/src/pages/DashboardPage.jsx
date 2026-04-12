import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    Box, 
    Container, 
    Typography, 
    Grid, 
    Paper, 
    Stack, 
    Chip,
    Avatar,
    IconButton,
    useTheme,
    LinearProgress
} from '@mui/material';
import {
    ActivitySquare,
    Zap,
    Target,
    Wallet,
    CreditCard,
    ArrowUpRight,
    TrendingUp,
    Briefcase,
    ChevronRight,
    Flame,
    Landmark as BankIcon,
    Layers
} from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/formatters';
import './DashboardPage.scss';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// --- Glass Utility Logic ---
const GlassPaper = ({ children, dark = false, className = "", sx = {} }) => (
    <div className={`glass-utility-paper ${dark ? 'dark' : 'light'} ${className}`}>
        {children}
    </div>
);

export default function DashboardPage() {
    const { loading, spending, reserves, investments, debt } = useSelector(state => state.finance);
    const theme = useTheme();

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

        const grossAssets = grossLiquidity + owedToMe + totalValuation;
        const grossLiabilities = creditUtilization + IOwe;
        const netWorth = grossAssets - grossLiabilities;
        const profitMargin = totalCost > 0 ? ((totalValuation - totalCost) / totalCost) * 100 : 0;

        return { grossLiquidity, creditUtilization, owedToMe, IOwe, totalValuation, totalCost, grossAssets, grossLiabilities, netWorth, profitMargin };
    }, [reserves, debt, investments]);

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
                    backgroundColor: ['#000000', '#0071e3', '#30d158', '#ff375f', '#bf5af2', '#ff9f0a'],
                    borderWidth: 0,
                    hoverOffset: 20
                }]
            },
            total: data.reduce((a, b) => a + b, 0),
            topPct: data.length > 0 ? Math.round((data[0] / data.reduce((a, b) => a + b, 0)) * 100) : 0
        };
    }, [investments]);

    const weeklyChart = useMemo(() => {
        const labels = [];
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
            labels.push(dayjs(d).format('ddd'));
            const daySpend = spending?.filter(s => s.date === d && !s.metadata?.is_investment).reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0) || 0;
            data.push(daySpend);
        }
        return {
            config: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: '#1d1d1f',
                    borderRadius: 12,
                    barPercentage: 0.5,
                }]
            }
        };
    }, [spending]);

    return (
        <Container maxWidth="xl" className="dashboard-container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                
                {/* Header */}
                <Box className="dashboard-header-block">
                    <Stack direction="row" className="header-overline-stack">
                        <Box className="header-accent-line" />
                        <Typography variant="overline" className="dashboard-global-label">
                            GLOBAL INTELLIGENCE
                        </Typography>
                    </Stack>
                    <Typography variant="h1" gutterBottom className="wealth-console-title">
                        Wealth Console
                    </Typography>
                    <Typography variant="h6" className="wealth-console-desc">
                        Real-time visualization of your absolute liquidity and global market exposure.
                    </Typography>
                </Box>

                {/* Primary Metrics */}
                <Grid container spacing={4} className="metrics-grid-primary">
                    <Grid item xs={12} md={4}>
                        <GlassPaper dark>
                            <Stack direction="row" justifyContent="space-between" alignItems="start">
                                <Avatar className="avatar-metric-dark">
                                    <ActivitySquare color="#fff" />
                                </Avatar>
                                <Chip label="LIVEDATA" size="small" className="metric-badge-live" />
                            </Stack>
                            <Box>
                                <Typography className="metric-label-micro">Total Net Worth</Typography>
                                <Typography variant="h2" className="metric-value-large">
                                    <Box component="span" className="currency-symbol-faint">₹</Box>
                                    {formatCurrency(financialPulse.netWorth).replace('₹', '')}
                                </Typography>
                            </Box>
                        </GlassPaper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <GlassPaper>
                            <Avatar className="avatar-metric-blue">
                                <BankIcon color="#0071e3" />
                            </Avatar>
                            <Box>
                                <Typography variant="overline" className="metric-label-secondary">Liquid Assets</Typography>
                                <Typography variant="h2" className="metric-value-large">
                                    <Box component="span" className="currency-symbol-faint">₹</Box>
                                    {formatCurrency(financialPulse.grossLiquidity).replace('₹', '')}
                                </Typography>
                            </Box>
                        </GlassPaper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <GlassPaper>
                            <Avatar className="avatar-metric-red">
                                <Flame color="#ff3b30" />
                            </Avatar>
                            <Box>
                                <Typography variant="overline" className="metric-label-secondary">Active Liability</Typography>
                                <Typography variant="h2" className="metric-value-large">
                                    <Box component="span" className="currency-symbol-faint">₹</Box>
                                    {formatCurrency(financialPulse.grossLiabilities).replace('₹', '')}
                                </Typography>
                            </Box>
                        </GlassPaper>
                    </Grid>
                </Grid>

                {/* Secondary Grid */}
                <Grid container spacing={4}>
                    <Grid item xs={12} lg={8}>
                        <GlassPaper className="allocation-card-main">
                            <Stack direction={{ xs: 'column', md: 'row' }} className="allocation-header-stack">
                                <Box>
                                    <Typography variant="h3">Asset Allocation</Typography>
                                    <Typography variant="body2" className="allocation-subtitle">Distribution across main investment channels</Typography>
                                </Box>
                                <Box className="text-right">
                                    <Typography variant="h4" className={financialPulse.profitMargin >= 0 ? 'text-success' : 'text-danger'}>
                                        {financialPulse.profitMargin >= 0 ? '+' : ''}{financialPulse.profitMargin.toFixed(2)}%
                                    </Typography>
                                    <Typography variant="overline" className="metric-label-faint">Market Performance</Typography>
                                </Box>
                            </Stack>

                            <Grid container spacing={8} alignItems="center">
                                <Grid item xs={12} md={5} className="allocation-chart-col">
                                    <Box className="allocation-donut-wrap">
                                        <Doughnut data={allocationData.config} options={{ cutout: '82%', plugins: { legend: { display: false } } }} />
                                        <div className="allocation-chart-center">
                                            <Typography variant="h4" className="allocation-top-pct">{allocationData.topPct}%</Typography>
                                            <Typography variant="caption" className="allocation-weight-label">WEIGHTED</Typography>
                                        </div>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={7}>
                                    <Stack spacing={3}>
                                        {allocationData.config.labels.map((lbl, idx) => (
                                            <Box key={lbl}>
                                                <Stack direction="row" justifyContent="space-between" mb={1}>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Box className={`allocation-legend-dot dot-color-${idx}`} />
                                                        <Typography variant="body2" className="allocation-lbl-text">{lbl}</Typography>
                                                    </Stack>
                                                    <Typography variant="body2" className="allocation-val-text">{formatCurrency(allocationData.config.datasets[0].data[idx])}</Typography>
                                                </Stack>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={(allocationData.config.datasets[0].data[idx] / allocationData.total) * 100} 
                                                    className={`allocation-progress-bar bar-color-${idx}`}
                                                />
                                            </Box>
                                        ))}
                                    </Stack>
                                </Grid>
                            </Grid>
                        </GlassPaper>
                    </Grid>

                    <Grid item xs={12} lg={4}>
                        <Stack spacing={4} className="h-full">
                            <GlassPaper className="spending-pulse-card">
                                <Typography variant="h5" className="margin-b-4">Spending Pulse</Typography>
                                <div className="spending-pulse-box">
                                    <Bar 
                                        data={weeklyChart.config} 
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: 'Outfit', weight: 'bold' } } },
                                                y: { display: false }
                                            }
                                        }} 
                                    />
                                </div>
                            </GlassPaper>

                            <GlassPaper dark className="quick-logic-card">
                                <Box className="z-1-rel">
                                    <Stack direction="row" spacing={2} alignItems="center" className="margin-b-3">
                                        <Avatar className="avatar-logic-dark">
                                            <Zap size={20} color="#fff" />
                                        </Avatar>
                                        <Typography variant="h6">Quick Logic</Typography>
                                    </Stack>
                                    <Typography variant="body1" className="logic-desc-text">
                                        Your capital is currently {financialPulse.profitMargin >= 0 ? 'yielding profit' : 'stabilizing'}. Liquid reserves cover {Math.round((financialPulse.grossLiquidity / (financialPulse.grossLiabilities || 1)) * 100)}% of liabilities.
                                    </Typography>
                                    <div className="logic-progress-track">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} className="logic-progress-bar" />
                                    </div>
                                </Box>
                            </GlassPaper>
                        </Stack>
                    </Grid>
                </Grid>
            </motion.div>
        </Container>
    );
}
