import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
    Search, Filter, PieChart, Download, Activity,
    TrendingUp, Calendar, Trash2, Edit2, Zap, CalendarDays,
    Globe, Home, Gem, DollarSign, Briefcase, Landmark, CreditCard, Settings
} from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/formatters';
import Modal from '../components/ui/Modal';
import BaseDialog from '../components/ui/BaseDialog';
import { Skeleton, Box, Button, Typography, IconButton, Dialog, Grow, Grid, Paper } from '@mui/material';
import api from '../utils/api';
import { fetchFinanceData } from '../store/financeSlice';
import './InvestmentPage.scss';

// Charting
import { Doughnut, Bar, Line } from 'react-chartjs-2';

export default function InvestmentPage({ onEdit, showAnalytics, onToggleAnalytics }) {
    const dispatch = useDispatch();
    const { investments, assetClasses, loading } = useSelector(state => state.finance);

    const getLiveVal = (item) => {
        const qty = parseFloat(item.quantity) || 0;
        const buy = parseFloat(item.buy_price) || 0;
        const cur = parseFloat(item.current_price) || 0;
        const amt = parseFloat(item.value) || 0;

        const withdrawals = item.withdrawals || [];
        const totalWithdrawnAmt = withdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
        const totalWithdrawnQty = withdrawals.reduce((sum, w) => sum + (parseFloat(w.quantity) || 0), 0);

        const isMarket = !isNaN(qty) && qty > 0 && !isNaN(cur) && cur > 0;

        if (isMarket) {
            const netQty = Math.max(0, qty - totalWithdrawnQty);
            const netValue = netQty * cur;
            return {
                current: netValue,
                invested: qty * buy,
                withdrawn: totalWithdrawnAmt,
                withdrawnQty: totalWithdrawnQty,
                netQty: netQty,
                isMarket: true
            };
        }

        if (item.type === 'Chit Fund' && amt > 0 && item.date) {
            const acqDate = dayjs(item.date);
            const today = dayjs();
            const diffYears = (today.valueOf() - acqDate.valueOf()) / (1000 * 60 * 60 * 24 * 365.25);
            const interest = amt * 0.065 * Math.max(0, diffYears);
            return {
                current: (amt + interest) - totalWithdrawnAmt,
                invested: amt,
                withdrawn: totalWithdrawnAmt,
                isFixed: true, yield: 6.5, profitPct: diffYears * 6.5
            };
        }

        return { current: amt - totalWithdrawnAmt, invested: amt, withdrawn: totalWithdrawnAmt, isStatic: true };
    };
    const getAssetStyle = (type) => {
        const found = assetClasses?.find(c => c.name === type);
        if (found) {
            return {
                bg: `${found.color}15`,
                color: found.color,
                // fallback to a generic icon for now
                icon: <Activity size={16} color={found.color} />
            };
        }
        switch (type) {
            case 'Gold': return { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', icon: <Gem size={16} color="#f59e0b" /> };
            case 'Property': return { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', icon: <Home size={16} color="#6366f1" /> };
            case 'Cash': return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', icon: <DollarSign size={16} color="#10b981" /> };
            case 'Stocks': return { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', icon: <TrendingUp size={16} color="#ef4444" /> };
            case 'Mutual Funds': return { bg: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', icon: <Activity size={16} color="#8b5cf6" /> };
            case 'Chit Fund': return { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', icon: <Landmark size={16} color="#f59e0b" /> };
            default: return { bg: 'rgba(107, 114, 128, 0.12)', color: '#6b7280', icon: <Landmark size={16} color="#6b7280" /> };
        }
    };

    // Filters State
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');
    const [period, setPeriod] = useState('ALL');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
    const [sortBy, setSortBy] = useState('DATE_DESC');
    const [syncingPrices, setSyncingPrices] = useState(false);

    const handleManualSync = async () => {
        setSyncingPrices(true);
        try {
            await api.post('/sync-prices');
            dispatch(fetchFinanceData());
        } catch (error) {
            console.error(error);
        } finally {
            setSyncingPrices(false);
        }
    };

    const handleRemove = async () => {
        if (!deleteConfirmItem) return;
        try {
            await api.delete(`/investments/${deleteConfirmItem._id}`);
            dispatch(fetchFinanceData());
            setDeleteConfirmItem(null);
        } catch (err) {
            console.error(err);
            alert("Purge failed. Cloud link unstable.");
        }
    };

    const filteredInvestments = useMemo(() => {
        return investments.filter(item => {
            const type = item.type === 'Local Investment' ? 'Chit Fund' : item.type;
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                type.toLowerCase().includes(search.toLowerCase());
            const matchesType = selectedType === 'ALL' || type === selectedType;

            const itemDate = dayjs(item.date);
            const now = dayjs();
            const withdrawals = item.withdrawals || [];

            const isItemDateMatch = (p) => {
                if (p === 'TODAY') return itemDate.isSame(now, 'day');
                if (p === 'YESTERDAY') return itemDate.isSame(now.subtract(1, 'day'), 'day');
                if (p === 'THIS WEEK') return itemDate.isAfter(now.startOf('week').subtract(1, 'ms'));
                if (p === 'THIS MONTH') return itemDate.isSame(now, 'month');
                if (p === 'LAST MONTH') return itemDate.isSame(now.subtract(1, 'month'), 'month');
                if (p === 'THIS YEAR') return itemDate.isSame(now, 'year');
                if (p === 'CUSTOM') {
                    let matches = true;
                    if (dateRange.start) matches = matches && itemDate.isAfter(dayjs(dateRange.start).subtract(1, 'day'));
                    if (dateRange.end) matches = matches && itemDate.isBefore(dayjs(dateRange.end).add(1, 'day'));
                    return matches;
                }
                return true; // ALL case
            };

            const isWithdrawalDateMatch = (p) => {
                return withdrawals.some(w => {
                    const wDate = dayjs(w.date);
                    if (p === 'TODAY') return wDate.isSame(now, 'day');
                    if (p === 'YESTERDAY') return wDate.isSame(now.subtract(1, 'day'), 'day');
                    if (p === 'THIS WEEK') return wDate.isAfter(now.startOf('week').subtract(1, 'ms'));
                    if (p === 'THIS MONTH') return wDate.isSame(now, 'month');
                    if (p === 'LAST MONTH') return wDate.isSame(now.subtract(1, 'month'), 'month');
                    if (p === 'THIS YEAR') return wDate.isSame(now, 'year');
                    if (p === 'CUSTOM') {
                        let matches = true;
                        if (dateRange.start) matches = matches && wDate.isAfter(dayjs(dateRange.start).subtract(1, 'day'));
                        if (dateRange.end) matches = matches && wDate.isBefore(dayjs(dateRange.end).add(1, 'day'));
                        return matches;
                    }
                    return false; // ALL case (ignore withdrawals for pure listing)
                });
            };

            const matchesPeriod = period === 'ALL' || isItemDateMatch(period) || isWithdrawalDateMatch(period);

            return matchesSearch && matchesType && matchesPeriod;
        });
    }, [investments, search, selectedType, period, dateRange]);

    // Analytics
    const totals = useMemo(() => {
        let grossValue = 0;
        let grossInvested = 0;
        let grossWithdrawn = 0;
        const typeStats = {};

        filteredInvestments.forEach(item => {
            const { current, invested, withdrawn } = getLiveVal(item);
            const type = item.type === 'Local Investment' ? 'Chit Fund' : item.type;

            if (!typeStats[type]) typeStats[type] = { current: 0, invested: 0 };

            grossValue += current;
            grossInvested += invested;
            grossWithdrawn += withdrawn;

            typeStats[type].current += current;
            typeStats[type].invested += invested;
        });

        const grossProfitAmt = (grossValue + grossWithdrawn) - grossInvested;
        const grossProfitPct = grossInvested > 0 ? (grossProfitAmt / grossInvested) * 100 : 0;

        return { grossValue, grossInvested, grossWithdrawn, grossProfitAmt, grossProfitPct, typeStats };
    }, [filteredInvestments]);

    const trendAnalysis = useMemo(() => {
        const dailyNet = {};
        filteredInvestments.forEach(s => {
            dailyNet[s.date] = (dailyNet[s.date] || 0) + s.value;
        });
        const dates = Object.keys(dailyNet).sort();
        let cumulative = 0;
        const cumulativeData = dates.map(d => { cumulative += dailyNet[d]; return cumulative; });

        return {
            labels: dates.map(d => dayjs(d).format('MMM DD, YYYY')),
            daily: dates.map(d => dailyNet[d]),
            cumulative: cumulativeData
        };
    }, [filteredInvestments]);

    const chartConfig = useMemo(() => {
        const typeLabels = Object.keys(totals.typeStats);
        const typeColors = typeLabels.map(l => getAssetStyle(l).color);

        return {
            doughnut: {
                labels: typeLabels,
                datasets: [{
                    data: typeLabels.map(l => totals.typeStats[l].current),
                    backgroundColor: typeColors.map(c => `${c}40`),
                    borderColor: typeColors,
                    borderWidth: 2,
                    cutout: '72%'
                }]
            },
            trajectory: {
                labels: trendAnalysis.labels,
                datasets: [{
                    label: 'Portfolio Growth',
                    data: trendAnalysis.cumulative,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 2
                }]
            }
        };
    }, [totals, trendAnalysis]);

    const handleExportCSV = () => {
        const headers = ["Date", "Asset Name", "Class", "Value", "Details"];
        const rows = filteredInvestments.map(s => [s.date, s.name, s.type, s.value, s.details]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `portfolio_${dayjs().format('YYYY-MM-DD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const uniqueTypes = useMemo(() => {
        const usageTypes = investments.map(i => i.type === 'Local Investment' ? 'Chit Fund' : i.type);
        const configuredTypes = (assetClasses || []).map(c => c.name === 'Local Investment' ? 'Chit Fund' : c.name);
        const types = new Set([...usageTypes, ...configuredTypes]);
        return Array.from(types).sort();
    }, [investments, assetClasses]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container-super">

            {showAnalytics && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="investment-analytics-container"
                >
                    <Box className="analytics-card-premium">
                        <div className="analytics-hub">
                            {/* DOUGHNUT - Responsive Flex */}
                            <div className="analytic-box-super">
                                <Box className="analytic-box-allocation">
                                    <Typography className="analytic-subtitle-primary">
                                        <PieChart size={14} /> ASSET ALLOCATION
                                    </Typography>
                                    <Box className="donut-chart-box">
                                        <Doughnut data={chartConfig.doughnut} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} />
                                        <Box className="chart-center-label">
                                            <Typography className="aum-label">AUM</Typography>
                                            <Typography className="aum-value">{formatCurrency(totals.grossValue)}</Typography>
                                        </Box>
                                    </Box>
                                    <Box className="architecture-list-flex">
                                        {Object.entries(totals.typeStats).sort((a, b) => b[1].current - a[1].current).map(([type, stats]) => (
                                            <Box key={type} className="architecture-meta-row">
                                                <Box className="architecture-label-flex">
                                                    <div className="dot-indicator" style={{ background: getAssetStyle(type).color }}></div>
                                                    <Typography className="architecture-type-text">{type}</Typography>
                                                </Box>
                                                <Typography className="architecture-val-text" style={{ color: getAssetStyle(type).color }}>{formatCurrency(stats.current)}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </div>

                            {/* LINE CHART - Responsive Flex */}
                            <div className="analytic-box-super">
                                <Box className="analytic-box-trajectory">
                                    <div className="trajectory-header">
                                        <Typography className="analytic-subtitle-secondary">
                                            <TrendingUp size={14} color="#6366f1" /> TRAJECTORY
                                        </Typography>
                                    </div>
                                    <Box className="chart-container-fluid">
                                        <Line
                                            data={chartConfig.trajectory}
                                            options={{
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    x: { grid: { display: false }, ticks: { font: { family: 'Outfit', size: 10, weight: 800 }, color: '#86868b' } },
                                                    y: { grid: { color: 'rgba(0,0,0,0.03)' }, border: { display: false }, ticks: { font: { family: 'Outfit', size: 10, weight: 800 }, color: '#86868b' } }
                                                },
                                                maintainAspectRatio: false
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </div>
                        </div>
                    </Box>
                </motion.div>
            )}

            <BaseDialog
                open={!!deleteConfirmItem}
                onClose={() => setDeleteConfirmItem(null)}
                title="Liquidate Asset"
                maxWidth="xs"
            >
                {deleteConfirmItem && (
                    <Box className="dialog-purge-wrap">
                        <div className="dialog-purge-icon-square">
                            <Trash2 size={32} />
                        </div>
                        <Typography className="dialog-desc-audit">
                            Permanently remove <strong className="text-dark">{deleteConfirmItem.name}</strong> from the portfolio?
                        </Typography>
                        <div className="dialog-action-flex">
                            <Button fullWidth onClick={() => setDeleteConfirmItem(null)} className="btn-abort-action">ABORT</Button>
                            <Button fullWidth variant="contained" onClick={handleRemove} className="btn-confirm-purge">PROCEED</Button>
                        </div>
                    </Box>
                )}
            </BaseDialog>

            {/* FINANCIAL SUMMARY CORE - LEGACY DESIGN RESTORED */}
            <div className="investment-summary-grid">
                <div className="summary-card-investment">
                    <div className="pill-icon-box bg-primary color-white"><Activity size={20} /></div>
                    <div className="flex-1">
                        <div className="summary-header-flex">
                            <Typography className="summary-label-primary">TOTAL ASSETS UNDER MANAGEMENT</Typography>
                            {totals.grossWithdrawn > 0 && (
                                <Box className="realized-badge">
                                    <div className="realized-dot" />
                                    REALIZED: {formatCurrency(totals.grossWithdrawn)}
                                </Box>
                            )}
                        </div>
                        <div className="summary-value-flex">
                            <Typography className="summary-value-main">{formatCurrency(totals.grossValue)}</Typography>
                            <Typography className="summary-label-secondary">
                                Invested: {formatCurrency(totals.grossInvested)}
                            </Typography>
                            {totals.grossValue > 0 && (
                                <Box className="pnl-chips-flex">
                                    <span className={`pnl-chip ${totals.grossProfitAmt >= 0 ? 'positive' : 'negative'}`}>
                                        {totals.grossProfitAmt >= 0 ? '+' : ''}{formatCurrency(Math.abs(totals.grossProfitAmt))}
                                    </span>
                                    <span className={`pnl-chip ${totals.grossProfitPct >= 0 ? 'positive' : 'negative'}`}>
                                        {totals.grossProfitPct >= 0 ? '▲ +' : '▼ '}{Math.abs(totals.grossProfitPct).toFixed(totals.grossProfitPct < 0.1 ? 4 : 2)}% net profit
                                    </span>
                                </Box>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CATEGORY SUMMARY PILLS - ORIGINAL LARGE DESIGN RESTORED */}
            <div className="category-pills-row">
                <div className="scroll-container">
                    {loading ? (
                        [...Array(4)].map((_, i) => <Skeleton key={i} variant="rectangular" width={140} height={60} className="skeleton-pill-box" />)
                    ) : (
                        Object.keys(totals.typeStats).map((type) => {
                            const style = getAssetStyle(type);
                            return (
                                <motion.div key={type} className="investment-category-pill">
                                    <div className="pill-icon-box" style={{ background: style.bg, color: style.color }}>
                                        {style.icon}
                                    </div>
                                    <div className="pill-info-box">
                                        <Typography className="pill-type-label">{type}</Typography>
                                        <div className="pill-value-stack">
                                            <span className="pill-amt-val" style={{ color: style.color }}>
                                                {formatCurrency(totals.typeStats[type].current)}
                                            </span>
                                            <span className="pill-cost-label">
                                                Invested: {formatCurrency(totals.typeStats[type].invested)}
                                            </span>
                                            {totals.typeStats[type].invested > 0 && (
                                                <div className="pill-yield-meta">
                                                    <span style={{ color: totals.typeStats[type].current >= totals.typeStats[type].invested ? '#34c759' : '#ff3b30' }}>
                                                        {totals.typeStats[type].current >= totals.typeStats[type].invested ? '+' : ''}{formatCurrency(Math.abs(totals.typeStats[type].current - totals.typeStats[type].invested))}
                                                    </span>
                                                    <span style={{ color: totals.typeStats[type].current >= totals.typeStats[type].invested ? '#34c759' : '#ff3b30', opacity: 0.8 }}>
                                                        ({totals.typeStats[type].current >= totals.typeStats[type].invested ? '▲' : '▼'}{Math.abs(((totals.typeStats[type].current - totals.typeStats[type].invested) / totals.typeStats[type].invested) * 100).toFixed(4)}%)
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="spending-split-layout">
                <div className="filters-sidebar-card glass-effect">
                    <div className="sidebar-sticky-wrap">
                        <div className="filter-header-flex">
                            <div className="filter-icon-box bg-primary">
                                <Filter size={15} fill="white" className="icon-opacity" />
                            </div>
                            <span className="filter-header-title">Portfolio Filters</span>
                        </div>

                        <div className="filter-section-block">
                            <div className="filter-section-label"><span>SEARCH ASSETS</span></div>
                            <div className="search-input-wrapper">
                                <Search size={15} className="search-icon-fixed" />
                                <input className="filter-search-input padding-l-2-75" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, class..." />
                            </div>
                        </div>

                        <div className="filter-section-block margin-t-1-75">
                            <div className="filter-section-label"><span>ASSET CLASS</span></div>
                            <div className="category-filter-grid">
                                {loading ? (
                                    [...Array(4)].map((_, i) => <Skeleton key={i} variant="rectangular" height={36} className="skeleton-cat-filter" />)
                                ) : (
                                    <>
                                        <div className={`cat-filter-chip ${selectedType === 'ALL' ? 'active' : ''}`} onClick={() => setSelectedType('ALL')}>All</div>
                                        {uniqueTypes.map(c => {
                                            const style = getAssetStyle(c);
                                            return (
                                                <div key={c} className={`cat-filter-chip ${selectedType === c ? 'active' : ''}`} onClick={() => setSelectedType(c)}>
                                                    <span style={{ color: selectedType === c ? 'white' : style.color }}>{style.icon}</span>
                                                    <span>{c}</span>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="filter-section-block margin-t-1-75">
                            <div className="filter-section-label"><span>TIME HORIZON</span></div>
                            <div className="time-horizon-grid">
                                {[
                                    { id: 'TODAY', label: 'Today', icon: <Zap size={13} fill="currentColor" /> },
                                    { id: 'YESTERDAY', label: 'Yesterday', icon: <CalendarDays size={13} fill="currentColor" /> },
                                    { id: 'THIS WEEK', label: 'This Week', icon: <TrendingUp size={13} fill="currentColor" /> },
                                    { id: 'THIS MONTH', label: 'This Month', icon: <PieChart size={13} fill="currentColor" /> },
                                    { id: 'LAST MONTH', label: 'Last Month', icon: <Calendar size={13} fill="currentColor" /> },
                                    { id: 'THIS YEAR', label: 'This Year', icon: <Globe size={13} fill="currentColor" /> },
                                    { id: 'ALL', label: 'All Time', icon: <Filter size={13} fill="currentColor" /> },
                                    { id: 'CUSTOM', label: 'Custom', icon: <Settings size={13} fill="currentColor" /> },
                                ].map(p => (
                                    <div key={p.id} className={`time-horizon-btn ${period === p.id ? 'active' : ''}`} onClick={() => setPeriod(p.id)}>
                                        <span className="th-icon">{p.icon}</span>
                                        <span className="th-label">{p.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CUSTOM RANGE PICKERS - DELUXE UI */}
                            {period === 'CUSTOM' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="filter-section-block custom-range-block"
                                >
                                    <div className="filter-section-label color-primary"><span>SELECT RANGE AUDIT</span></div>
                                    <Stack spacing={1.5}>
                                        <DatePicker
                                            label="START DATE"
                                            value={dateRange.start ? dayjs(dateRange.start) : null}
                                            onChange={(val) => setDateRange(prev => ({ ...prev, start: val ? val.format('YYYY-MM-DD') : '' }))}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    fullWidth: true,
                                                    className: "datepicker-premium"
                                                }
                                            }}
                                        />
                                        <DatePicker
                                            label="END DATE"
                                            value={dateRange.end ? dayjs(dateRange.end) : null}
                                            onChange={(val) => setDateRange(prev => ({ ...prev, end: val ? val.format('YYYY-MM-DD') : '' }))}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    fullWidth: true,
                                                    className: "datepicker-premium"
                                                }
                                            }}
                                        />
                                    </Stack>
                                </motion.div>
                            )}
                        </div>

                    </div>
                </div>

                <div className="spending-main-content">
                    <div className="content-meta-bar glass-effect">
                        <div className="meta-left-flex">
                            <div className="badge-pulse-flex">
                                <div className="dot-pulse-wrapper">
                                    <div className="dot-pulse-inner" />
                                </div>
                                <div>
                                    <Typography className="badge-count-text">{filteredInvestments.length}</Typography>
                                    <Typography className="badge-label-micro">ASSETS FOUND</Typography>
                                </div>
                            </div>
                        </div>

                        <div className="action-hub-center">
                            <Button
                                onClick={() => setSortBy(prev => prev === 'PNL_DESC' ? 'PNL_ASC' : 'PNL_DESC')}
                                className="btn-pill-sort">
                                {sortBy === 'PNL_DESC' ? '▼ P&L DESC' : sortBy === 'PNL_ASC' ? '▲ P&L ASC' : 'SORT BY P&L'}
                            </Button>

                            <Button
                                onClick={() => setSortBy('DATE_DESC')}
                                className={`btn-pill-sort ${sortBy === 'DATE_DESC' ? 'active' : ''}`}>
                                BY DATE
                            </Button>

                            <Button
                                onClick={handleManualSync}
                                disabled={syncingPrices}
                                startIcon={<Zap size={12} />}
                                className="btn-pill-sync">
                                {syncingPrices ? '...' : 'SYNC ALL'}
                            </Button>

                            <Button
                                onClick={() => { setSearch(''); setSelectedType('ALL'); setPeriod('ALL'); }}
                                className="btn-pill-sort">
                                CLEAR ALL
                            </Button>

                            <Button
                                onClick={handleExportCSV}
                                startIcon={<Download size={12} />}
                                className="btn-pill-export">
                                EXPORT CSV
                            </Button>
                        </div>
                    </div>

                    <div className="data-table-premium scroll-y-luxury">
                        {loading ? (
                            <Box sx={{ mb: 4 }}>
                                {[...Array(5)].map((_, j) => (
                                    <Box key={j} sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2 }}>
                                        <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: '8px' }} />
                                        <Box sx={{ flex: 1 }}><Skeleton variant="text" width="40%" height={24} /></Box>
                                        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '50px' }} />
                                    </Box>
                                ))}
                            </Box>
                        ) : (() => {
                            const renderItem = (s, livePre = null) => {
                                const normalizedType = s.type === 'Local Investment' ? 'Chit Fund' : s.type;
                                const catStyle = getAssetStyle(normalizedType);
                                const live = livePre || getLiveVal(s);
                                return (
                                    <div key={s._id} className="transaction-row-fancy">
                                        <div className="pill-icon-box" style={{ background: catStyle.bg, color: catStyle.color }}>
                                            {catStyle.icon}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="asset-header-flex">
                                                <span className="asset-name-text">{s.name}</span>
                                                {s.ticker && <span className="asset-ticker-tag">{s.ticker}</span>}
                                            </div>
                                            <div className="asset-meta-flex">
                                                <span>{dayjs(s.date).format('YYYY-MM-DD')} • {s.sub}</span>
                                                {s.quantity && (
                                                    <span>
                                                        • Qty: {live.netQty < s.quantity ? `${live.netQty} / ${s.quantity}` : s.quantity}
                                                    </span>
                                                )}
                                                {s.buy_price && s.current_price && <span>• Avg: ₹{s.buy_price} → CMP: ₹{s.current_price}</span>}
                                                {live.isFixed && <span className="yield-profit-label">(+6.5% Yield)</span>}
                                            </div>
                                        </div>
                                        <div className="tx-category-col">
                                            <span className="type-badge-pill" style={{ background: catStyle.bg, color: catStyle.color }}>{normalizedType}</span>
                                        </div>
                                        <div className="tx-amount-col">
                                            <span className="tx-val-main">{formatCurrency(live.current)}</span>
                                            <span className="tx-cost-label">Cost: {formatCurrency(live.invested)}</span>
                                            {(live.isMarket || live.isFixed) && (
                                                <div className={`asset-pnl-indicator ${live.current + live.withdrawn >= live.invested ? 'positive' : 'negative'}`}>
                                                    {live.current + live.withdrawn >= live.invested ? '▲' : '▼'} {Math.abs(((live.current + live.withdrawn - live.invested) / (live.invested || 1)) * 100).toFixed(4)}% P&L
                                                </div>
                                            )}
                                            {live.withdrawn > 0 && (
                                                <div className="exited-indicator">
                                                    <div className="dot" />
                                                    Exited: {formatCurrency(live.withdrawn)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="row-action-cluster">
                                            <IconButton size="small" onClick={() => onEdit(s)} sx={{ color: '#6366f1' }}><Edit2 size={12} /></IconButton>
                                            <IconButton size="small" onClick={() => setDeleteConfirmItem(s)} sx={{ color: '#ff3b30' }}><Trash2 size={12} /></IconButton>
                                        </div>
                                    </div>
                                );
                            };

                            if (sortBy === 'DATE_DESC') {
                                const grouped = filteredInvestments.reduce((acc, curr) => {
                                    const yearMonth = dayjs(curr.date).format('MMMM YYYY');
                                    if (!acc[yearMonth]) acc[yearMonth] = [];
                                    acc[yearMonth].push(curr);
                                    return acc;
                                }, {});
                                const months = Object.keys(grouped).sort((a, b) => dayjs(b, 'MMMM YYYY').unix() - dayjs(a, 'MMMM YYYY').unix());
                                if (months.length === 0) return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-dim)', fontWeight: 800 }}>No assets acquired in this period.</div>;

                                return months.map(month => (
                                    <div key={month} className="date-group">
                                        <div className="group-header-luxury">
                                            <div className="group-title-flex">
                                                <Calendar size={14} color="#6366f1" />
                                                <span className="group-date-label">{month.toUpperCase()}</span>
                                            </div>
                                            <div className="group-acquired-label">
                                                ACQUIRED: {formatCurrency(grouped[month].reduce((sum, s) => sum + getLiveVal(s).current, 0))}
                                            </div>
                                        </div>
                                        <div className="investment-items-luxury">
                                            {grouped[month].map((s) => renderItem(s))}
                                        </div>
                                    </div>
                                ));
                            } else {
                                const flatList = filteredInvestments.map(s => {
                                    const live = getLiveVal(s);
                                    let pnl = 0;
                                    if (live.invested > 0) {
                                        pnl = ((live.current + live.withdrawn - live.invested) / live.invested) * 100;
                                    }
                                    return { item: s, live, pnl };
                                });
                                flatList.sort((a, b) => sortBy === 'PNL_DESC' ? b.pnl - a.pnl : a.pnl - b.pnl);
                                if (flatList.length === 0) return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-dim)', fontWeight: 800 }}>No assets found.</div>;

                                return (
                                    <div className="date-group">
                                        <div className="group-header-luxury">
                                            <div className="group-title-flex">
                                                <Activity size={14} color="#34c759" />
                                                <span className="group-date-label">SORTED BY P&L PERCENTAGE ({sortBy === 'PNL_DESC' ? 'Highest First' : 'Lowest First'})</span>
                                            </div>
                                        </div>
                                        <div className="investment-items-luxury">
                                            {flatList.map(obj => renderItem(obj.item, obj.live))}
                                        </div>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
