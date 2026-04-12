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
                    style={{ marginBottom: '2.5rem', overflow: 'hidden' }}
                >
                    <Box sx={{ p: 4, borderRadius: '32px', bgcolor: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
                        <div className="analytics-hub">
                            {/* DOUGHNUT - Responsive Flex */}
                            <div className="analytic-box-super">
                                <Box sx={{ p: 4, borderRadius: '24px', bgcolor: 'rgba(99,102,241,0.02)', border: '1px solid rgba(99,102,241,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 4, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PieChart size={14} /> ASSET ALLOCATION
                                    </Typography>
                                    <Box sx={{ height: 210, position: 'relative', display: 'grid', placeItems: 'center', mb: 3 }}>
                                        <Doughnut data={chartConfig.doughnut} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} />
                                        <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', display: 'block', mb: -0.5 }}>AUM</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>{formatCurrency(totals.grossValue)}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                                        {Object.entries(totals.typeStats).sort((a, b) => b[1].current - a[1].current).map(([type, stats]) => (
                                            <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getAssetStyle(type).color }}></div>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.68rem', opacity: 0.8 }}>{type}</Typography>
                                                </Box>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: getAssetStyle(type).color }}>{formatCurrency(stats.current)}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </div>

                            {/* LINE CHART - Responsive Flex */}
                            <div className="analytic-box-super">
                                <Box sx={{ p: 4, borderRadius: '24px', bgcolor: 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TrendingUp size={14} color="#6366f1" /> TRAJECTORY
                                        </Typography>
                                    </div>
                                    <Box sx={{ flex: 1, minHeight: 440 }}>
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
                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'white' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem' }}>
                            <Trash2 size={32} />
                        </div>
                        <Typography variant="body1" sx={{ color: '#86868b', mb: 3 }}>
                            Permanently remove <strong style={{ color: '#1d1d1f' }}>{deleteConfirmItem.name}</strong> from the portfolio?
                        </Typography>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button fullWidth onClick={() => setDeleteConfirmItem(null)} sx={{ borderRadius: '50px', p: '0.9rem', fontWeight: 800, color: '#1d1d1f', bgcolor: 'rgba(0,0,0,0.05)' }}>ABORT</Button>
                            <Button fullWidth variant="contained" onClick={handleRemove} sx={{ borderRadius: '50px', p: '0.9rem', fontWeight: 800, bgcolor: '#ff3b30' }}>PROCEED</Button>
                        </div>
                    </Box>
                )}
            </BaseDialog>

            {/* FINANCIAL SUMMARY CORE - LEGACY DESIGN RESTORED */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="glass-effect" style={{ padding: '1.25rem', borderRadius: '1.5rem', border: '1.5px solid rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(99,102,241,0.03)' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: '#6366f1', color: 'white', display: 'grid', placeItems: 'center' }}><Activity size={20} /></div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: '#6366f1', display: 'block', mb: -0.4, opacity: 0.8 }}>TOTAL ASSETS UNDER MANAGEMENT</Typography>
                            {totals.grossWithdrawn > 0 && (
                                <Typography variant="caption" sx={{ fontWeight: 900, color: '#fb923c', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fb923c' }} />
                                    REALIZED: {formatCurrency(totals.grossWithdrawn)}
                                </Typography>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                            <Typography variant="h5" sx={{ fontWeight: 900 }}>{formatCurrency(totals.grossValue)}</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#86868b', opacity: 0.8 }}>
                                Invested: {formatCurrency(totals.grossInvested)}
                            </Typography>
                            {totals.grossValue > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: totals.grossProfitAmt >= 0 ? '#34c759' : '#ff3b30' }}>
                                        {totals.grossProfitAmt >= 0 ? '+' : ''}{formatCurrency(Math.abs(totals.grossProfitAmt))}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: totals.grossProfitPct >= 0 ? '#34c759' : '#ff3b30', background: totals.grossProfitPct >= 0 ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                                        {totals.grossProfitPct >= 0 ? '▲ +' : '▼ '}{Math.abs(totals.grossProfitPct).toFixed(totals.grossProfitPct < 0.1 ? 4 : 2)}% net profit
                                    </span>
                                </Box>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CATEGORY SUMMARY PILLS - ORIGINAL LARGE DESIGN RESTORED */}
            <div style={{ width: '100%', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', padding: '0.5rem 0', scrollbarWidth: 'none' }}>
                    {loading ? (
                        [...Array(4)].map((_, i) => <Skeleton key={i} variant="rectangular" width={140} height={60} sx={{ borderRadius: '1.1rem', flexShrink: 0 }} />)
                    ) : (
                        Object.keys(totals.typeStats).map((type) => {
                            const style = getAssetStyle(type);
                            return (
                                <motion.div key={type} className="apple-category-pill glass-effect" style={{ minWidth: '160px' }}>
                                    <div className="pill-icon-box" style={{ background: style.bg, color: style.color }}>
                                        {style.icon}
                                    </div>
                                    <div className="pill-info-box">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span className="pill-cat-label" style={{ opacity: 1 }}>{type}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ color: style.color, fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.02em', lineHeight: 1 }}>
                                                {formatCurrency(totals.typeStats[type].current)}
                                            </span>
                                            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#86868b', opacity: 0.7 }}>
                                                Invested: {formatCurrency(totals.typeStats[type].invested)}
                                            </span>
                                            {totals.typeStats[type].invested > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '3px' }}>
                                                    <span style={{ fontSize: '0.58rem', fontWeight: 900, color: totals.typeStats[type].current >= totals.typeStats[type].invested ? '#34c759' : '#ff3b30' }}>
                                                        {totals.typeStats[type].current >= totals.typeStats[type].invested ? '+' : ''}{formatCurrency(Math.abs(totals.typeStats[type].current - totals.typeStats[type].invested))}
                                                    </span>
                                                    <span style={{ fontSize: '0.58rem', fontWeight: 900, color: totals.typeStats[type].current >= totals.typeStats[type].invested ? '#34c759' : '#ff3b30', opacity: 0.8 }}>
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
                <div className="filters-sidebar-card glass-effect" style={{ padding: '1.75rem' }}>
                    <div style={{ position: 'sticky', top: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#6366f1', color: 'white', display: 'grid', placeItems: 'center' }}>
                                <Filter size={15} fill="white" style={{ opacity: 0.8 }} />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>Portfolio Filters</span>
                        </div>

                        <div className="filter-section-block">
                            <div className="filter-section-label"><span>SEARCH ASSETS</span></div>
                            <div style={{ position: 'relative' }}>
                                <Search size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none', zIndex: 1 }} />
                                <input className="filter-search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, class..." style={{ paddingLeft: '2.75rem' }} />
                            </div>
                        </div>

                        <div className="filter-section-block" style={{ marginTop: '1.75rem' }}>
                            <div className="filter-section-label"><span>ASSET CLASS</span></div>
                            <div className="category-filter-grid">
                                {loading ? (
                                    [...Array(4)].map((_, i) => <Skeleton key={i} variant="rectangular" height={36} sx={{ borderRadius: '10px' }} />)
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

                        <div className="filter-section-block" style={{ marginTop: '1.75rem' }}>
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
                                    className="filter-section-block"
                                    style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.04)' }}
                                >
                                    <div className="filter-section-label" style={{ color: '#6366f1' }}><span>SELECT RANGE AUDIT</span></div>
                                    <Stack spacing={1.5}>
                                        <DatePicker
                                            label="START DATE"
                                            value={dateRange.start ? dayjs(dateRange.start) : null}
                                            onChange={(val) => setDateRange(prev => ({ ...prev, start: val ? val.format('YYYY-MM-DD') : '' }))}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    fullWidth: true,
                                                    sx: {
                                                        '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'rgba(0,0,0,0.01)' },
                                                        '& .MuiInputLabel-root': { fontSize: '0.65rem', fontWeight: 900, top: '-2px' }
                                                    }
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
                                                    sx: {
                                                        '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'rgba(0,0,0,0.01)' },
                                                        '& .MuiInputLabel-root': { fontSize: '0.65rem', fontWeight: 900, top: '-2px' }
                                                    }
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
                    <div className="content-meta-bar" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1.5rem',
                        marginBottom: '1.25rem',
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(20px)',
                        padding: '1rem 2rem',
                        borderRadius: '32px',
                        border: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.08)', display: 'grid', placeItems: 'center' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)' }} />
                                </div>
                                <div>
                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 900, color: '#1d1d1f', lineHeight: 1 }}>{filteredInvestments.length}</Typography>
                                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ASSETS FOUND</Typography>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Button
                                onClick={() => setSortBy(prev => prev === 'PNL_DESC' ? 'PNL_ASC' : 'PNL_DESC')}
                                sx={{ borderRadius: '50px', border: '1px solid #e2e8f0', color: '#1d1d1f', px: 2, py: 0.7, fontWeight: 900, fontSize: '0.65rem', textTransform: 'none', '&:hover': { background: '#f8fafc', borderColor: '#cbd5e1' } }}>
                                {sortBy === 'PNL_DESC' ? '▼ P&L DESC' : sortBy === 'PNL_ASC' ? '▲ P&L ASC' : 'SORT BY P&L'}
                            </Button>

                            <Button
                                onClick={() => setSortBy('DATE_DESC')}
                                sx={{ borderRadius: '50px', border: '1px solid #e2e8f0', color: '#1d1d1f', px: 2, py: 0.7, fontWeight: 900, fontSize: '0.65rem', textTransform: 'none', background: sortBy === 'DATE_DESC' ? '#f8fafc' : 'transparent', '&:hover': { background: '#f8fafc' } }}>
                                BY DATE
                            </Button>

                            <Button
                                onClick={handleManualSync}
                                disabled={syncingPrices}
                                startIcon={<Zap size={12} />}
                                sx={{ borderRadius: '50px', bgcolor: '#34c759', color: 'white', px: 2, py: 0.7, fontWeight: 900, fontSize: '0.65rem', textTransform: 'none', '&:hover': { bgcolor: '#28a745' }, '&.Mui-disabled': { bgcolor: 'rgba(52, 199, 89, 0.5)', color: 'white' } }}>
                                {syncingPrices ? '...' : 'SYNC ALL'}
                            </Button>

                            <Button
                                onClick={() => { setSearch(''); setSelectedType('ALL'); setPeriod('ALL'); }}
                                sx={{ borderRadius: '50px', border: '1px solid #e2e8f0', color: '#1d1d1f', px: 2, py: 0.7, fontWeight: 900, fontSize: '0.65rem', textTransform: 'none', '&:hover': { background: '#f8fafc' } }}>
                                CLEAR ALL
                            </Button>

                            <Button
                                onClick={handleExportCSV}
                                startIcon={<Download size={12} />}
                                sx={{ borderRadius: '50px', bgcolor: '#6366f1', color: 'white', px: 2, py: 0.7, fontWeight: 900, fontSize: '0.65rem', textTransform: 'none', '&:hover': { bgcolor: '#4f46e5' } }}>
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
                                    <div key={s._id} className="transaction-row-fancy" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: catStyle.bg, color: catStyle.color, display: 'grid', placeItems: 'center', flexShrink: 0, marginRight: '0.5rem' }}>
                                            {catStyle.icon}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2px' }}>
                                                <span style={{ fontWeight: 800, color: '#1d1d1f', fontSize: '0.9rem' }}>{s.name}</span>
                                                {s.ticker && <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '1px 6px', borderRadius: '4px' }}>{s.ticker}</span>}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.72rem', color: '#86868b', fontWeight: 600 }}>
                                                <span>{dayjs(s.date).format('YYYY-MM-DD')} • {s.sub}</span>
                                                {s.quantity && (
                                                    <span>
                                                        • Qty: {live.netQty < s.quantity ? `${live.netQty} / ${s.quantity}` : s.quantity}
                                                    </span>
                                                )}
                                                {s.buy_price && s.current_price && <span>• Avg: ₹{s.buy_price} → CMP: ₹{s.current_price}</span>}
                                                {live.isFixed && <span style={{ color: '#34c759', fontWeight: 900 }}>(+6.5% Yield)</span>}
                                            </div>
                                        </div>
                                        <div style={{ width: '160px', textAlign: 'center' }}>
                                            <span style={{ padding: '0.4rem 0.8rem', background: catStyle.bg, color: catStyle.color, borderRadius: '50px', fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'inline-block' }}>{normalizedType}</span>
                                        </div>
                                        <div style={{ width: '150px', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
                                            <span style={{ fontWeight: 900, color: '#1d1d1f', fontSize: '0.95rem', lineHeight: 1.1 }}>{formatCurrency(live.current)}</span>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#86868b', opacity: 0.8 }}>Cost: {formatCurrency(live.invested)}</span>
                                            {(live.isMarket || live.isFixed) && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 800, color: live.current + live.withdrawn >= live.invested ? '#34c759' : '#ff3b30', background: live.current + live.withdrawn >= live.invested ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                                                    {live.current + live.withdrawn >= live.invested ? '▲' : '▼'} {Math.abs(((live.current + live.withdrawn - live.invested) / (live.invested || 1)) * 100).toFixed(4)}% P&L
                                                </div>
                                            )}
                                            {live.withdrawn > 0 && (
                                                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ff9500', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff9500' }} />
                                                    Exited: {formatCurrency(live.withdrawn)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="row-action-cluster" style={{ display: 'flex', gap: '0.2rem', marginLeft: '1rem', opacity: 0.6 }}>
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
                                        <div className="date-header-luxury">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <Calendar size={14} color="#6366f1" />
                                                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{month.toUpperCase()}</span>
                                            </div>
                                            <div style={{ fontWeight: 900, fontSize: '0.9rem', color: '#6366f1' }}>
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
                                        <div className="date-header-luxury">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <Activity size={14} color="#34c759" />
                                                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>SORTED BY P&L PERCENTAGE ({sortBy === 'PNL_DESC' ? 'Highest First' : 'Lowest First'})</span>
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
