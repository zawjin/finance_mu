import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, TextField, InputAdornment, Paper, Stack, Divider, Grid } from '@mui/material';
import { Wallet, Landmark, CreditCard, PlusCircle, Calculator, TrendingUp, TrendingDown, Sigma, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import './BudgetPlannerTab.scss';

export default function BudgetPlannerTab({ yearlySip, monthlyObligations, defaultOtherIncome, defaultCcOutstanding, lastMonthCcOutstanding }) {
    const [ccMode, setCcMode] = useState('current');
    const [ccOutstanding, setCcOutstanding] = useState(defaultCcOutstanding?.toString() || '');
    const [others, setOthers] = useState('');
    const [invest, setInvest] = useState('12500');
    const [income, setIncome] = useState('123000');
    const [otherIncome, setOtherIncome] = useState(defaultOtherIncome?.toString() || '');

    // Update CC value when mode changes
    const handleModeChange = (mode) => {
        setCcMode(mode);
        if (mode === 'current') {
            setCcOutstanding(defaultCcOutstanding.toString());
        } else {
            setCcOutstanding(lastMonthCcOutstanding.toString());
        }
    };


    const ccVal = parseFloat(ccOutstanding) || 0;
    const othersVal = parseFloat(others) || 0;
    const investVal = parseFloat(invest) || 0;
    const netIncomeVal = parseFloat(income) || 0;
    const otherIncomeVal = parseFloat(otherIncome) || 0;

    const totalIncomeVal = netIncomeVal + otherIncomeVal;

    const totalExpenses = yearlySip + monthlyObligations + ccVal + othersVal + investVal;
    const remaining = totalIncomeVal - totalExpenses;

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="budget-planner-viewport"
        >
            {/* TOP SUMMARY CARD */}
            <motion.div variants={itemVariants} className="budget-summary-card">
                <Box className="card-bg-glow" />
                <Box className="summary-content">
                    <Box>
                        <Typography className="summary-label">REMAINING BALANCE</Typography>
                        <Typography className={`summary-value ${remaining >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(remaining)}
                        </Typography>
                    </Box>
                    <Box className="summary-icon-box">
                        {remaining >= 0 ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
                    </Box>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
                <Box className="summary-footer">
                    <Box className="footer-item">
                        <span>TOTAL INCOME</span>
                        <p>{formatCurrency(totalIncomeVal)}</p>
                    </Box>
                    <Box className="footer-item">
                        <span>TOTAL EXPENSES</span>
                        <p>{formatCurrency(totalExpenses)}</p>
                    </Box>
                </Box>
            </motion.div>

            <Box className="budget-flex-container">
                {/* BLOCK 1: 40% WIDTH */}
                <Box className="budget-block-wrap width-40">
                    <Paper className="budget-input-panel">
                        <Box className="panel-header">
                            <Calculator size={20} />
                            <Typography>1. EXPENDITURE BREAKDOWN</Typography>
                        </Box>

                        <Stack spacing={3} sx={{ p: 3 }}>
                            <Box className="input-group system-data">
                                <Typography className="group-label">SYSTEM OBLIGATIONS</Typography>
                                <Box className="data-row">
                                    <Box className="data-info">
                                        <Landmark size={18} />
                                        <Typography className="data-title">Yearly SIP Reserve</Typography>
                                    </Box>
                                    <Typography className="data-value">{formatCurrency(yearlySip)}</Typography>
                                </Box>
                                <Box className="data-row">
                                    <Box className="data-info">
                                        <Wallet size={18} />
                                        <Typography className="data-title">Monthly Bills</Typography>
                                    </Box>
                                    <Typography className="data-value">{formatCurrency(monthlyObligations)}</Typography>
                                </Box>
                                <Box className="data-row">
                                    <Box className="data-info">
                                        <ShieldCheck size={18} color="#10b981" />
                                        <Typography className="data-title">Direct Investment (Planned)</Typography>
                                    </Box>
                                    <TextField
                                        variant="standard"
                                        type="number"
                                        size="small"
                                        value={invest}
                                        onChange={(e) => setInvest(e.target.value)}
                                        sx={{ width: '80px', input: { textAlign: 'right', fontWeight: 800, fontSize: '0.95rem' } }}
                                        InputProps={{ disableUnderline: true }}
                                    />
                                </Box>
                            </Box>

                            <Divider />

                            <Box className="input-group">
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography className="group-label" sx={{ mb: 0 }}>VARIABLE INPUTS</Typography>
                                    <Box className="cycle-toggle">
                                        <button
                                            className={ccMode === 'current' ? 'active' : ''}
                                            onClick={() => handleModeChange('current')}
                                        >Live</button>
                                        <button
                                            className={ccMode === 'previous' ? 'active' : ''}
                                            onClick={() => handleModeChange('previous')}
                                        >Prev</button>
                                    </Box>
                                </Box>
                                <Stack spacing={2}>
                                    <TextField
                                        fullWidth
                                        label={ccMode === 'current' ? 'Live CC Outstanding' : "Last Month's Bill"}
                                        variant="outlined"
                                        type="number"
                                        size="small"
                                        value={ccOutstanding}
                                        onChange={(e) => setCcOutstanding(e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><CreditCard size={18} color="#6366f1" /></InputAdornment>
                                        }}
                                        className="premium-input"
                                        helperText={ccMode === 'previous' ? `Calculated from previous month's bill payments` : 'Sum of all card balances'}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Others"
                                        variant="outlined"
                                        type="number"
                                        size="small"
                                        value={others}
                                        onChange={(e) => setOthers(e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><PlusCircle size={18} color="#8b5cf6" /></InputAdornment>
                                        }}
                                        className="premium-input"
                                    />
                                </Stack>
                            </Box>
                        </Stack>

                        <Box className="panel-footer">
                            <Box className="total-label-box">
                                <Sigma size={18} />
                                <Typography>TOTAL MONTHLY BURN</Typography>
                            </Box>
                            <Typography className="total-burn-value">{formatCurrency(totalExpenses)}</Typography>
                        </Box>
                    </Paper>
                </Box>

                {/* BLOCK 2: 30% WIDTH */}
                <Box className="budget-block-wrap width-30">
                    <Paper className="budget-income-panel">
                        <Box className="panel-header indigo">
                            <TrendingUp size={20} />
                            <Typography>2. REVENUE CONFIG</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                            <Typography className="income-desc">
                                Configure your expected net liquidity for the month.
                            </Typography>
                            <Stack spacing={2} sx={{ mt: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Monthly Net Income"
                                    variant="outlined"
                                    type="number"
                                    size="small"
                                    value={income}
                                    onChange={(e) => setIncome(e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Sigma size={18} color="#10b981" /></InputAdornment>,
                                        endAdornment: <InputAdornment position="end">₹</InputAdornment>
                                    }}
                                    className="premium-input success"
                                />
                                <TextField
                                    fullWidth
                                    label="Other Income"
                                    variant="outlined"
                                    type="number"
                                    size="small"
                                    value={otherIncome}
                                    onChange={(e) => setOtherIncome(e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><PlusCircle size={18} color="#34d399" /></InputAdornment>,
                                        endAdornment: <InputAdornment position="end">₹</InputAdornment>
                                    }}
                                    className="premium-input success"
                                />
                            </Stack>

                            <Box className="surplus-visualizer" sx={{ mt: 5 }}>
                                <Typography className="v-label">SURPLUS UTILIZATION</Typography>
                                <Box className="v-bar-container">
                                    <Box
                                        className={`v-bar-fill ${remaining >= 0 ? 'positive' : 'negative'}`}
                                        style={{ width: `${Math.min(100, Math.max(5, (remaining / (totalIncomeVal || 1)) * 100))}%` }}
                                    />
                                </Box>
                                <Box className="v-meta">
                                    <Typography>{totalIncomeVal > 0 ? Math.round((remaining / totalIncomeVal) * 100) : 0}% Projected Surplus</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Box>

                {/* BLOCK 3: 30% WIDTH */}
                <Box className="budget-block-wrap width-30">
                    <Paper className="budget-allocation-panel">
                        <Box className="panel-header violet">
                            <Sparkles size={20} />
                            <Typography>3. STRATEGIC ALLOCATION</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                            {remaining > 0 ? (
                                <>
                                    <Typography className="allocation-desc">Recommended split for your <strong>{formatCurrency(remaining)}</strong> surplus:</Typography>
                                    <Stack spacing={2} sx={{ mt: 3 }}>
                                        <Box className="allocation-row-mini">
                                            <div className="dot blue" />
                                            <Box flex={1}>
                                                <Typography className="alloc-label">Equity Growth (40%)</Typography>
                                                <Typography className="alloc-val">{formatCurrency(remaining * 0.4)}</Typography>
                                            </Box>
                                        </Box>
                                        <Box className="allocation-row-mini">
                                            <div className="dot emerald" />
                                            <Box flex={1}>
                                                <Typography className="alloc-label">Emergency Buffer (40%)</Typography>
                                                <Typography className="alloc-val">{formatCurrency(remaining * 0.4)}</Typography>
                                            </Box>
                                        </Box>
                                        <Box className="allocation-row-mini">
                                            <div className="dot amber" />
                                            <Box flex={1}>
                                                <Typography className="alloc-label">Flexible Cash (20%)</Typography>
                                                <Typography className="alloc-val">{formatCurrency(remaining * 0.2)}</Typography>
                                            </Box>
                                        </Box>
                                    </Stack>
                                </>
                            ) : (
                                <Box className="deficit-notice-mini">
                                    <AlertCircle size={32} color="#f43f5e" />
                                    <Typography className="notice-title">Deficit Alert</Typography>
                                    <Typography className="notice-desc">Monthly burn exceeds income by {formatCurrency(Math.abs(remaining))}.</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </motion.div>
    );
}
