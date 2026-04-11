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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// --- Styled Components Logic ---
const GlassPaper = ({ children, dark = false, sx = {} }) => (
    <Paper
        elevation={0}
        sx={{
            p: 4,
            borderRadius: '32px',
            background: dark 
                ? 'linear-gradient(135deg, #000000 0%, #1d1d1f 100%)' 
                : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: dark ? 'none' : 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: dark ? 'none' : 'blur(20px) saturate(180%)',
            border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
            color: dark ? '#fff' : 'inherit',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
                transform: 'translateY(-5px)',
            },
            ...sx
        }}
    >
        {children}
    </Paper>
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
        <Container maxWidth="xl" sx={{ py: 6 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                
                {/* Header */}
                <Box mb={8}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                        <Box sx={{ width: 40, height: 2, bgcolor: 'primary.main', opacity: 0.2 }} />
                        <Typography variant="overline" sx={{ fontWeight: 900, letterSpacing: '0.2em', color: 'text.secondary' }}>
                            GLOBAL INTELLIGENCE
                        </Typography>
                    </Stack>
                    <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '3rem', md: '4.5rem' } }}>
                        Wealth Console
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, maxWidth: 600 }}>
                        Real-time visualization of your absolute liquidity and global market exposure.
                    </Typography>
                </Box>

                {/* Primary Metrics */}
                <Grid container spacing={4} mb={8}>
                    <Grid item xs={12} md={4}>
                        <GlassPaper dark sx={{ minHeight: 240, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="start">
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 56, height: 56, borderRadius: '16px' }}>
                                    <ActivitySquare color="#fff" />
                                </Avatar>
                                <Chip label="LIVEDATA" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34c759', fontWeight: 900, fontSize: '10px' }} />
                            </Stack>
                            <Box>
                                <Typography variant="overline" sx={{ opacity: 0.5, fontWeight: 900 }}>Total Net Worth</Typography>
                                <Typography variant="h2" sx={{ fontSize: '3.5rem' }}>
                                    <Box component="span" sx={{ fontSize: '1.5rem', opacity: 0.3, mr: 1 }}>₹</Box>
                                    {formatCurrency(financialPulse.netWorth).replace('₹', '')}
                                </Typography>
                            </Box>
                        </GlassPaper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <GlassPaper sx={{ minHeight: 240, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Avatar sx={{ bgcolor: 'rgba(0,113,227,0.1)', width: 56, height: 56, borderRadius: '16px' }}>
                                <BankIcon color="#0071e3" />
                            </Avatar>
                            <Box>
                                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 900 }}>Liquid Assets</Typography>
                                <Typography variant="h2" sx={{ fontSize: '3.5rem' }}>
                                    <Box component="span" sx={{ fontSize: '1.5rem', opacity: 0.2, mr: 1 }}>₹</Box>
                                    {formatCurrency(financialPulse.grossLiquidity).replace('₹', '')}
                                </Typography>
                            </Box>
                        </GlassPaper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <GlassPaper sx={{ minHeight: 240, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Avatar sx={{ bgcolor: 'rgba(255,59,48,0.1)', width: 56, height: 56, borderRadius: '16px' }}>
                                <Flame color="#ff3b30" />
                            </Avatar>
                            <Box>
                                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 900 }}>Active Liability</Typography>
                                <Typography variant="h2" sx={{ fontSize: '3.5rem' }}>
                                    <Box component="span" sx={{ fontSize: '1.5rem', opacity: 0.2, mr: 1 }}>₹</Box>
                                    {formatCurrency(financialPulse.grossLiabilities).replace('₹', '')}
                                </Typography>
                            </Box>
                        </GlassPaper>
                    </Grid>
                </Grid>

                {/* Secondary Grid */}
                <Grid container spacing={4}>
                    <Grid item xs={12} lg={8}>
                        <GlassPaper sx={{ p: 6, height: '100%' }}>
                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={6} spacing={4}>
                                <Box>
                                    <Typography variant="h3">Asset Allocation</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Distribution across main investment channels</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="h4" sx={{ color: financialPulse.profitMargin >= 0 ? '#34c759' : '#ff3b30' }}>
                                        {financialPulse.profitMargin >= 0 ? '+' : ''}{financialPulse.profitMargin.toFixed(2)}%
                                    </Typography>
                                    <Typography variant="overline" sx={{ fontWeight: 900, opacity: 0.5 }}>Market Performance</Typography>
                                </Box>
                            </Stack>

                            <Grid container spacing={8} alignItems="center">
                                <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Box sx={{ width: 220, height: 220, position: 'relative' }}>
                                        <Doughnut data={allocationData.config} options={{ cutout: '82%', plugins: { legend: { display: false } } }} />
                                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography variant="h4" sx={{ mb: -0.5 }}>{allocationData.topPct}%</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 900, opacity: 0.4 }}>WEIGHTED</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={7}>
                                    <Stack spacing={3}>
                                        {allocationData.config.labels.map((lbl, idx) => (
                                            <Box key={lbl}>
                                                <Stack direction="row" justifyContent="space-between" mb={1}>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: allocationData.config.datasets[0].backgroundColor[idx] }} />
                                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{lbl}</Typography>
                                                    </Stack>
                                                    <Typography variant="body2" sx={{ fontWeight: 900 }}>{formatCurrency(allocationData.config.datasets[0].data[idx])}</Typography>
                                                </Stack>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={(allocationData.config.datasets[0].data[idx] / allocationData.total) * 100} 
                                                    sx={{ 
                                                        height: 6, 
                                                        borderRadius: 3, 
                                                        bgcolor: 'rgba(0,0,0,0.04)',
                                                        '& .MuiLinearProgress-bar': { bgcolor: allocationData.config.datasets[0].backgroundColor[idx], borderRadius: 3 }
                                                    }} 
                                                />
                                            </Box>
                                        ))}
                                    </Stack>
                                </Grid>
                            </Grid>
                        </GlassPaper>
                    </Grid>

                    <Grid item xs={12} lg={4}>
                        <Stack spacing={4} sx={{ height: '100%' }}>
                            <GlassPaper sx={{ flex: 1, p: 5 }}>
                                <Typography variant="h5" sx={{ mb: 4 }}>Spending Pulse</Typography>
                                <Box sx={{ height: 200, mt: 2 }}>
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
                                </Box>
                            </GlassPaper>

                            <GlassPaper dark sx={{ flex: 1, p: 5, position: 'relative', overflow: 'hidden' }}>
                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                            <Zap size={20} color="#fff" />
                                        </Avatar>
                                        <Typography variant="h6">Quick Logic</Typography>
                                    </Stack>
                                    <Typography variant="body1" sx={{ opacity: 0.8, mb: 4 }}>
                                        Your capital is currently {financialPulse.profitMargin >= 0 ? 'yielding profit' : 'stabilizing'}. Liquid reserves cover {Math.round((financialPulse.grossLiquidity / (financialPulse.grossLiabilities || 1)) * 100)}% of liabilities.
                                    </Typography>
                                    <Box sx={{ width: '100%', height: 4, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} style={{ height: '100%', backgroundColor: '#fff', borderRadius: 4 }} />
                                    </Box>
                                </Box>
                            </GlassPaper>
                        </Stack>
                    </Grid>
                </Grid>
            </motion.div>
        </Container>
    );
}
