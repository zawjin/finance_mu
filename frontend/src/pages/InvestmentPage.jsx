import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Search, Filter, PieChart, Download, Activity,
    TrendingUp, Calendar, Trash2, Edit2, Zap, CalendarDays,
    Globe, Home, Gem, DollarSign, Briefcase, Landmark, CreditCard, Settings, CheckCircle2, Layers,
    Plus, X, PlusCircle, Fingerprint, Sparkles, ChevronLeft, ChevronRight
} from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/formatters';
import Modal from '../components/ui/Modal';
import BaseDialog from '../components/ui/BaseDialog';
import { Skeleton, Box, Button, Typography, IconButton, Dialog, Grow, Grid, Paper, Stack, CircularProgress } from '@mui/material';
import api from '../utils/api';
import { fetchFinanceData } from '../store/financeSlice';
import { getIcon, IconMap } from '../utils/iconMap';
import './InvestmentPage.scss';

// Charting
import { Doughnut, Bar, Line } from 'react-chartjs-2';

const WebRangeModal = ({ open, onClose, tempRange, setTempRange, onConfirm }) => {
    const [viewDate, setViewDate] = useState(dayjs());
    const [showYearPicker, setShowYearPicker] = useState(false);
    
    const startOfMonth = viewDate.startOf('month');
    const daysInMonth = viewDate.daysInMonth();
    const startDay = startOfMonth.day();

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(startOfMonth.date(i));
    }

    const handleDayClick = (d) => {
        if (!d) return;
        const dateStr = d.format('YYYY-MM-DD');
        if (!tempRange.start || (tempRange.start && tempRange.end)) {
            setTempRange({ start: dateStr, end: '' });
        } else {
            if (dayjs(dateStr).isBefore(dayjs(tempRange.start))) {
                setTempRange({ start: dateStr, end: tempRange.start });
            } else {
                setTempRange({ ...tempRange, end: dateStr });
            }
        }
    };

    const isInRange = (d) => {
        if (!d || !tempRange.start || !tempRange.end) return false;
        return d.isAfter(dayjs(tempRange.start)) && d.isBefore(dayjs(tempRange.end));
    };

    const isStart = (d) => d && d.format('YYYY-MM-DD') === tempRange.start;
    const isEnd = (d) => d && d.format('YYYY-MM-DD') === tempRange.end;

    const years = [];
    const currentYear = dayjs().year();
    for (let y = currentYear - 10; y <= currentYear + 2; y++) years.push(y);

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="xs" 
            PaperProps={{ 
                sx: { 
                    borderRadius: '32px', 
                    p: 0, 
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                } 
            }}
        >
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#1d1d1f' }}>Select Range</Typography>
                    <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.05)' }}><X size={18} /></IconButton>
                </Box>

                <Box sx={{ position: 'relative' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
                        <IconButton onClick={() => setViewDate(viewDate.subtract(1, 'month'))} size="small" sx={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                            <ChevronLeft size={20} />
                        </IconButton>
                        
                        <Button 
                            onClick={() => setShowYearPicker(!showYearPicker)}
                            sx={{ 
                                fontWeight: 900, 
                                fontSize: '1rem', 
                                color: '#6366f1',
                                borderRadius: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                        >
                            {viewDate.format('MMMM YYYY')}
                        </Button>

                        <IconButton onClick={() => setViewDate(viewDate.add(1, 'month'))} size="small" sx={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                            <ChevronRight size={20} />
                        </IconButton>
                    </Box>

                    <AnimatePresence>
                        {showYearPicker && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{
                                    position: 'absolute',
                                    top: '40px',
                                    left: 0,
                                    right: 0,
                                    background: 'white',
                                    zIndex: 10,
                                    padding: '1rem',
                                    borderRadius: '20px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '8px',
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}
                            >
                                {years.map(y => (
                                    <Button 
                                        key={y} 
                                        onClick={() => {
                                            setViewDate(viewDate.year(y));
                                            setShowYearPicker(false);
                                        }}
                                        sx={{ 
                                            borderRadius: '10px',
                                            fontWeight: viewDate.year() === y ? 900 : 500,
                                            bgcolor: viewDate.year() === y ? '#6366f1' : 'transparent',
                                            color: viewDate.year() === y ? 'white' : 'inherit',
                                            '&:hover': { bgcolor: viewDate.year() === y ? '#6366f1' : 'rgba(0,0,0,0.05)' }
                                        }}
                                    >
                                        {y}
                                    </Button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', mb: 3 }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <Typography key={`day-label-${i}`} sx={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 900, color: '#86868b', py: 1 }}>{d}</Typography>
                    ))}
                    {days.map((d, i) => {
                        if (!d) return <Box key={`empty-${i}`} />;
                        const dateStr = d.format('YYYY-MM-DD');
                        const start = isStart(d);
                        const end = isEnd(d);
                        const inRange = isInRange(d);

                        return (
                            <Box
                                key={dateStr}
                                onClick={() => handleDayClick(d)}
                                sx={{
                                    height: '42px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    borderRadius: '14px',
                                    fontSize: '0.9rem',
                                    fontWeight: (start || end) ? 900 : 600,
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    bgcolor: (start || end) ? '#6366f1' : (inRange ? 'rgba(99,102,241,0.08)' : 'transparent'),
                                    color: (start || end) ? 'white' : (inRange ? '#6366f1' : 'inherit'),
                                    '&:hover': { 
                                        bgcolor: (start || end) ? '#6366f1' : 'rgba(0,0,0,0.04)',
                                        transform: 'scale(1.05)'
                                    },
                                    '&:active': { transform: 'scale(0.95)' }
                                }}
                            >
                                {d.date()}
                                {(start || end) && (
                                    <motion.div 
                                        layoutId="active-dot"
                                        style={{ 
                                            position: 'absolute', 
                                            bottom: '6px', 
                                            width: '4px', 
                                            height: '4px', 
                                            background: 'white', 
                                            borderRadius: '50%' 
                                        }} 
                                    />
                                )}
                            </Box>
                        );
                    })}
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button 
                        fullWidth 
                        onClick={onClose} 
                        sx={{ 
                            borderRadius: '16px', 
                            py: 1.5,
                            fontWeight: 900, 
                            color: '#1d1d1f', 
                            bgcolor: 'rgba(0,0,0,0.05)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        fullWidth 
                        variant="contained" 
                        onClick={() => onConfirm(tempRange)} 
                        disabled={!tempRange.start || !tempRange.end}
                        sx={{ 
                            borderRadius: '16px', 
                            py: 1.5,
                            fontWeight: 900, 
                            bgcolor: '#6366f1', 
                            color: 'white',
                            boxShadow: '0 10px 20px -5px rgba(99,102,241,0.3)',
                            '&:hover': { bgcolor: '#4f46e5' }
                        }}
                    >
                        Confirm
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

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
            const iconName = found.icon || 'Activity';
            return {
                bg: `${found.color}15`,
                color: found.color,
                icon: IconMap[iconName] ? React.cloneElement(IconMap[iconName], { size: 16, color: found.color }) : <Activity size={16} color={found.color} />
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
    const [showRangeModal, setShowRangeModal] = useState(false);
    const [syncingPrices, setSyncingPrices] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const [tempRange, setTempRange] = useState({ start: '', end: '' });
    const [purging, setPurging] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [filterPortalTarget, setFilterPortalTarget] = useState(null);

    useEffect(() => {
        setFilterPortalTarget(document.getElementById('mobile-filter-portal-target'));
    }, []);

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

    const handleToggleStatus = async (item) => {
        const newStatus = item.status === 'COLLECTED' ? 'ACTIVE' : 'COLLECTED';
        setUpdatingStatus(true);
        try {
            // We need to send the full item with the updated status
            const updated = { ...item, status: newStatus };
            await api.put(`/investments/${item._id}`, updated);
            dispatch(fetchFinanceData());
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleRemove = async () => {
        if (!deleteConfirmItem) return;
        setPurging(true);
        try {
            await api.delete(`/investments/${deleteConfirmItem._id}`);
            dispatch(fetchFinanceData());
            setDeleteConfirmItem(null);
        } catch (err) {
            console.error(err);
            alert("Purge failed. Cloud link unstable.");
        } finally {
            setPurging(false);
        }
    };

    const baseFilteredInvestments = useMemo(() => {
        return investments.filter(item => {
            const type = item.type === 'Local Investment' ? 'Chit Fund' : item.type;
            const matchesSearch = (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
                type.toLowerCase().includes(search.toLowerCase());

            const itemDate = dayjs(item.date);
            const now = dayjs();
            const withdrawals = item.withdrawals || [];

            const isItemDateMatch = (p) => {
                const updatedDate = item.last_updated ? dayjs(item.last_updated) : null;
                const checkDate = (d, period) => {
                    if (period === 'TODAY') return d.isSame(now, 'day');
                    if (period === 'YESTERDAY') return d.isSame(now.subtract(1, 'day'), 'day');
                    if (period === 'THIS WEEK') return d.isAfter(now.startOf('week').subtract(1, 'ms'));
                    if (period === 'THIS MONTH') return d.isSame(now, 'month');
                    if (period === 'LAST MONTH') return d.isSame(now.subtract(1, 'month'), 'month');
                    if (period === 'THIS YEAR') return d.isSame(now, 'year');
                    if (period === 'CUSTOM') {
                        let matches = true;
                        if (dateRange.start) matches = matches && d.isAfter(dayjs(dateRange.start).subtract(1, 'day'));
                        if (dateRange.end) matches = matches && d.isBefore(dayjs(dateRange.end).add(1, 'day'));
                        return matches;
                    }
                    return false;
                };

                const originalMatches = checkDate(itemDate, p);
                const updateMatches = updatedDate ? checkDate(updatedDate, p) : false;

                return originalMatches || updateMatches;
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
                    return false;
                });
            };

            const matchesPeriod = period === 'ALL' || isItemDateMatch(period) || isWithdrawalDateMatch(period);

            return matchesSearch && matchesPeriod;
        });
    }, [investments, search, period, dateRange]);

    const filteredInvestments = useMemo(() => {
        return baseFilteredInvestments.filter(item => {
            const type = item.type === 'Local Investment' ? 'Chit Fund' : item.type;
            return selectedType === 'ALL' || type === selectedType;
        });
    }, [baseFilteredInvestments, selectedType]);

    // Helper to check if a specific date matches the current UI period filter
    const isMatch = (dateStr) => {
        if (period === 'ALL') return true;
        const d = dayjs(dateStr).startOf('day');
        const now = dayjs().startOf('day');
        if (period === 'TODAY') return d.isSame(now, 'day');
        if (period === 'YESTERDAY') return d.isSame(now.subtract(1, 'day'), 'day');
        if (period === 'THIS WEEK') return d.isAfter(now.startOf('week').subtract(1, 'ms'));
        if (period === 'THIS MONTH') return d.isSame(now, 'month');
        if (period === 'LAST MONTH') return d.isSame(now.subtract(1, 'month'), 'month');
        if (period === 'THIS YEAR') return d.isSame(now, 'year');
        if (period === 'CUSTOM') {
            let m = true;
            if (dateRange.start) m = m && d.isAfter(dayjs(dateRange.start).subtract(1, 'day'));
            if (dateRange.end) m = m && d.isBefore(dayjs(dateRange.end).add(1, 'day'));
            return m;
        }
        return true;
    };

    // Analytics
    const totals = useMemo(() => {
        let grossValue = 0;
        let grossInvested = 0;
        let grossWithdrawn = 0;
        const typeStats = {};

        baseFilteredInvestments.forEach(item => {
            const type = item.type === 'Local Investment' ? 'Chit Fund' : item.type;
            if (!typeStats[type]) typeStats[type] = { current: 0, invested: 0 };

            const isCollected = item.status === 'COLLECTED';

            if (period === 'ALL') {
                // ALL TIME: show full live portfolio value
                const { current, invested, withdrawn } = getLiveVal(item);

                if (!isCollected) {
                    grossValue += current;
                    typeStats[type].current += current;
                }
                grossInvested += invested;
                grossWithdrawn += withdrawn;
                typeStats[type].invested += invested;
            } else {
                // PERIOD SPECIFIC
                let periodSpent = 0;
                (item.purchases || []).forEach(p => {
                    if (isMatch(p.date)) periodSpent += (parseFloat(p.amount) || 0);
                });

                if (periodSpent === 0 && (!item.purchases || item.purchases.length === 0) && isMatch(item.date)) {
                    periodSpent = parseFloat(item.value) || 0;
                }

                let periodWithdrawn = 0;
                (item.withdrawals || []).forEach(w => {
                    if (isMatch(w.date)) periodWithdrawn += (parseFloat(w.amount) || 0);
                });

                const netInflow = periodSpent - periodWithdrawn;
                if (!isCollected) {
                    grossValue += netInflow;
                    typeStats[type].current += netInflow;
                }
                grossInvested += periodSpent;
                grossWithdrawn += periodWithdrawn;
                typeStats[type].invested += periodSpent;
            }
        });

        const grossProfitAmt = (grossValue + grossWithdrawn) - grossInvested;
        const grossProfitPct = grossInvested > 0 ? (grossProfitAmt / grossInvested) * 100 : 0;

        return { grossValue, grossInvested, grossWithdrawn, grossProfitAmt, grossProfitPct, typeStats };
    }, [baseFilteredInvestments, period, dateRange]);

    const trendAnalysis = useMemo(() => {
        const dailyNet = {};

        baseFilteredInvestments.forEach(s => {
            // 1. Process all historical purchases (ADDITIONS)
            const purchases = s.purchases || [];
            let hasInitial = false;

            if (purchases.length > 0) {
                purchases.forEach(p => {
                    if (isMatch(p.date)) {
                        dailyNet[p.date] = (dailyNet[p.date] || 0) + (parseFloat(p.amount) || 0);
                    }
                    if (p.description === 'Initial Acquisition') hasInitial = true;
                });
            }

            // Fallback for missing initial (Legacy items OR items where purchases didn't track the start)
            if (!hasInitial && isMatch(s.date)) {
                // If we have top-ups in 'purchases', the 'initial' value was (Total - Top-ups)
                const topUpsSum = purchases.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
                const initialVal = (parseFloat(s.value) || 0) - topUpsSum;
                if (initialVal >= 0) {
                    dailyNet[s.date] = (dailyNet[s.date] || 0) + initialVal;
                }
            }

            // 2. Process all historical withdrawals (EXITS)
            (s.withdrawals || []).forEach(w => {
                if (isMatch(w.date)) {
                    dailyNet[w.date] = (dailyNet[w.date] || 0) - (parseFloat(w.amount) || 0);
                }
            });
        });

        const dates = Object.keys(dailyNet).sort();
        let cumulative = 0;
        const cumulativeData = dates.map(d => {
            cumulative += dailyNet[d];
            return cumulative;
        });

        return {
            labels: dates.map(d => dayjs(d).format('MMM DD, YYYY')),
            daily: dates.map(d => dailyNet[d]),
            cumulative: cumulativeData
        };
    }, [baseFilteredInvestments, period, dateRange]);

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
    const hasActiveFilters = search !== '' || selectedType !== 'ALL' || period !== 'ALL';

    const renderFilters = () => (
        <div className="sidebar-sticky-wrap">
            <div className="filter-section-block">
                <div className="search-input-wrapper">
                    <Search size={15} className="search-icon-fixed" />
                    <input className="filter-search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, class, category..." />
                </div>
            </div>

            <div className="filter-section-block margin-t-1-75">
                <div className="filter-section-label"><span>TIME HORIZON</span></div>
                <div className="unified-filter-grid">
                    {[
                        { id: 'TODAY', label: 'Today', icon: <Zap size={20} /> },
                        { id: 'THIS WEEK', label: 'This Week', icon: <Calendar size={20} /> },
                        { id: 'THIS MONTH', label: 'This Month', icon: <PieChart size={20} /> },
                        { id: 'PREVIOUS MONTH', label: 'Last Month', icon: <CalendarDays size={20} /> },
                        { id: 'ALL', label: 'All Time', icon: <Globe size={20} /> },
                        { id: 'CUSTOM', label: 'Custom Range', icon: <Filter size={20} /> },
                    ].map(p => (
                        <div key={p.id} className={`unified-filter-btn ${period === p.id ? 'active' : ''}`} onClick={() => setPeriod(p.id)}>
                            <span className="th-icon" style={{ color: period === p.id ? 'white' : '#6366f1' }}>{p.icon}</span>
                            <span className="th-label">{p.label}</span>
                        </div>
                    ))}
                </div>
                {period === 'CUSTOM' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="filter-section-block custom-range-block"
                        style={{ marginTop: '1.25rem' }}
                    >
                        <div className="filter-section-label color-primary"><span>SELECT PORTFOLIO RANGE</span></div>
                        <div
                            className="mui-range-trigger"
                            onClick={() => {
                                setTempRange(dateRange);
                                setShowRangeModal(true);
                            }}
                        >
                            <CalendarDays size={16} />
                            <span>{dateRange.start ? `${dayjs(dateRange.start).format('MMM D')} - ${dayjs(dateRange.end).format('MMM D')}` : 'Choose dates'}</span>
                        </div>
                    </motion.div>
                )}
            </div>


        </div>
    );

    const renderMetaStatusBar = () => (
        <div className="meta-status-bar">
            <div className="badge-status">
                <span className="badge-count-text">{filteredInvestments.length}</span> ASSETS FOUND
            </div>

            <div className="action-hub-right">
                <button
                    onClick={() => setSortBy(prev => prev === 'PNL_DESC' ? 'PNL_ASC' : 'PNL_DESC')}
                    className={`sort-pill-btn ${sortBy === 'PNL_DESC' || sortBy === 'PNL_ASC' ? 'active' : ''}`}>
                    {sortBy === 'PNL_DESC' ? '▼ P&L' : sortBy === 'PNL_ASC' ? '▲ P&L' : 'P&L'}
                </button>

                <button
                    onClick={() => setSortBy('DATE_DESC')}
                    className={`sort-pill-btn ${sortBy === 'DATE_DESC' ? 'active' : ''}`}>
                    BY DATE
                </button>

                <button
                    onClick={handleManualSync}
                    disabled={syncingPrices}
                    className="btn-pill-sync-minimal">
                    {syncingPrices ? '...' : <><Zap size={11} /> SYNC</>}
                </button>

                <button
                    onClick={() => { setSearch(''); setSelectedType('ALL'); setPeriod('ALL'); }}
                    className="btn-clear-minimal">
                    CLEAR
                </button>

                <button
                    onClick={handleExportCSV}
                    className="btn-export-minimal">
                    <Download size={13} /> EXPORT
                </button>
            </div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container-super">
            <WebRangeModal
                open={showRangeModal}
                onClose={() => setShowRangeModal(false)}
                tempRange={tempRange}
                setTempRange={setTempRange}
                onConfirm={(range) => {
                    setDateRange(range);
                    setShowRangeModal(false);
                }}
            />

            {/* MOBILE-ONLY TOP FILTER & META PANEL */}
            <div className="mobile-only-top-controls">


                {/* FINANCIAL SUMMARY CORE - LEGACY DESIGN RESTORED */}
                <div className="investment-summary-grid">
                    <div className="summary-card-investment">
                        <div className="summary-card-left">
                            <div className="pill-icon-box"><Activity size={20} /></div>
                        </div>
                        <div className="summary-card-right">
                            <div className="summary-main-line">
                                <div className="summary-label-primary">TOTAL ASSETS</div>
                                <div className="summary-value-main">{formatCurrency(totals.grossValue)}</div>
                            </div>

                            <div className="summary-secondary-line">
                                <span className="summary-label-secondary">Invested: {formatCurrency(totals.grossInvested)}</span>
                                {totals.grossValue > 0 && (
                                    <div className="pnl-chips-flex">
                                        <span className={`pnl-chip ${totals.grossProfitAmt >= 0 ? 'positive' : 'negative'}`}>
                                            {totals.grossProfitAmt >= 0 ? '+' : ''}{formatCurrency(Math.abs(totals.grossProfitAmt))}
                                        </span>
                                        <span className={`pnl-chip ${totals.grossProfitPct >= 0 ? 'positive' : 'negative'}`}>
                                            {totals.grossProfitPct >= 0 ? '▲' : '▼'}{Math.abs(totals.grossProfitPct).toFixed(2)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>


                <div className="mobile-only-filter-wrapper">
                    {filterPortalTarget ? createPortal(
                        <button
                            onClick={() => setMobileFiltersOpen(o => !o)}
                            className={`mh-icon-btn ${mobileFiltersOpen ? 'active' : ''}`}
                            aria-label="Toggle filters"
                            style={{ position: 'relative' }}
                        >
                            <Filter size={18} />
                            {hasActiveFilters && (
                                <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#ff3b30', borderRadius: '50%', border: '2px solid var(--app-bg, #f8fafc)' }}></span>
                            )}
                        </button>,
                        filterPortalTarget
                    ) : (
                        <button
                            className="mobile-filter-toggle"
                            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        >
                            <div className="mft-left">
                                <Filter size={15} />
                                <span>Filters</span>
                                {hasActiveFilters && <span className="mft-badge">Active</span>}
                            </div>
                            <span className={`mft-chevron ${mobileFiltersOpen ? 'open' : ''}`}>▾</span>
                        </button>
                    )}

                    <div className={`filters-sidebar-card glass-effect${mobileFiltersOpen ? ' mobile-open' : ''}`}>
                        {renderFilters()}
                    </div>
                </div>

                <div className="mobile-only-meta-wrapper">
                    {renderMetaStatusBar()}
                </div>
            </div>

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

                        {/* ADVANCED INTELLIGENCE: PORTFOLIO REBALANCING & PASSIVE INCOME */}
                        <Grid container spacing={2} sx={{ mt: 1, px: { xs: 0, sm: 0 } }}>
                            <Grid item xs={12} md={6}>
                                <Box className="intelligence-card-sub glass-effect no-glass-mobile">
                                    <Typography className="intelligence-label">
                                        <Activity size={14} color="#6366f1" /> PORTFOLIO REBALANCING (BETA)
                                    </Typography>
                                    <div className="rebalance-grid">
                                        {Object.entries(totals.typeStats).map(([type, stats]) => {
                                            const weight = (stats.current / (totals.grossValue || 1)) * 100;
                                            const typeLower = type.toLowerCase();

                                            // INTELLIGENT TARGET MAPPING
                                            let target = 0;
                                            if (typeLower.includes('stock') || typeLower.includes('equity')) target = 40;
                                            else if (typeLower.includes('cash') || typeLower.includes('bank')) target = 20;
                                            else if (typeLower.includes('gold') || typeLower.includes('metal')) target = 15;
                                            else if (typeLower.includes('fund') || typeLower.includes('mutual')) target = 25;
                                            else if (typeLower.includes('chit') || typeLower.includes('fixed')) target = 10;

                                            const diff = weight - target;
                                            const style = getAssetStyle(type);

                                            return (
                                                <div key={type} className="rebalance-item">
                                                    <div className="rebalance-meta">
                                                        <span className="rebalance-type">{type}</span>
                                                        <span className="rebalance-weight">{weight.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="rebalance-progress-track">
                                                        <div className="rebalance-progress-fill" style={{ width: `${weight}%`, background: style.color }}></div>
                                                        {target > 0 && <div className="rebalance-target-marker" style={{ left: `${target}%` }} title={`Target: ${target}%`}></div>}
                                                    </div>
                                                    {target > 0 && (
                                                        <div className={`rebalance-status ${Math.abs(diff) < 5 ? 'neutral' : diff > 0 ? 'overweight' : 'underweight'}`}>
                                                            {Math.abs(diff) < 5 ? 'Balanced' : diff > 0 ? `Overweight (+${diff.toFixed(0)}%)` : `Underweight (${diff.toFixed(0)}%)`}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box className="intelligence-card-sub glass-effect no-glass-mobile">
                                    <Typography className="intelligence-label">
                                        <Zap size={14} color="#f59e0b" /> PASSIVE INCOME PROJECTIONS
                                    </Typography>
                                    <div className="income-projection-wrap">
                                        <div className="projection-main">
                                            <span className="projection-label">EXPECTED ANNUAL YIELD</span>
                                            <span className="projection-value">
                                                {formatCurrency(
                                                    Object.entries(totals.typeStats).reduce((sum, [type, stats]) => {
                                                        if (type === 'Chit Fund') return sum + (stats.current * 0.065);
                                                        if (type === 'Mutual Funds') return sum + (stats.current * 0.12);
                                                        if (type === 'Stocks') return sum + (stats.current * 0.02);
                                                        return sum;
                                                    }, 0)
                                                )}
                                            </span>
                                        </div>
                                        <div className="projection-breakdown">
                                            <div className="pb-item">
                                                <span className="pb-label">Monthly Passive</span>
                                                <span className="pb-val">~ {formatCurrency(Object.entries(totals.typeStats).reduce((sum, [type, stats]) => {
                                                    if (type === 'Chit Fund') return sum + (stats.current * 0.065 / 12);
                                                    if (type === 'Mutual Funds') return sum + (stats.current * 0.12 / 12);
                                                    return sum;
                                                }, 0))}</span>
                                            </div>
                                            <div className="pb-item">
                                                <span className="pb-label">Daily Accrual</span>
                                                <span className="pb-val">~ {formatCurrency(Object.entries(totals.typeStats).reduce((sum, [type, stats]) => {
                                                    if (type === 'Chit Fund') return sum + (stats.current * 0.065 / 365);
                                                    return sum;
                                                }, 0))}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Box>
                            </Grid>
                        </Grid>
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
                        <div className="day-totals-flex">
                            <Button fullWidth onClick={() => setDeleteConfirmItem(null)} disabled={purging} className="btn-purge-abort">ABORT</Button>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleRemove}
                                disabled={purging}
                                className="btn-purge-confirm"
                                startIcon={purging ? <CircularProgress size={16} color="inherit" /> : null}
                            >
                                {purging ? 'PURGING...' : 'PROCEED'}
                            </Button>
                        </div>
                    </Box>
                )}
            </BaseDialog>


            {/* CATEGORY SUMMARY PILLS - ORIGINAL LARGE DESIGN RESTORED */}
            <div className="category-pills-row">
                <div className="scroll-container">
                    {loading ? (
                        [...Array(4)].map((_, i) => <Skeleton key={i} variant="rectangular" width={140} height={60} className="skeleton-pill-box" />)
                    ) : (
                        <>
                            <motion.div
                                key="ALL"
                                className="investment-category-pill glass-effect"
                                onClick={() => setSelectedType('ALL')}
                                style={{
                                    cursor: 'pointer',
                                    '--card-border': selectedType === 'ALL' ? '#6366f140' : 'rgba(0,0,0,0.05)'
                                }}
                            >
                                <div
                                    className={`pill-icon-box ${selectedType === 'ALL' ? 'active' : 'inactive'}`}
                                    style={{
                                        '--pill-bg': selectedType === 'ALL' ? '#6366f1' : 'rgba(0,0,0,0.03)',
                                        '--pill-color': selectedType === 'ALL' ? 'white' : '#6366f1'
                                    }}
                                >
                                    <Layers size={20} color={selectedType === 'ALL' ? 'white' : '#6366f1'} strokeWidth={2.4} />
                                </div>
                                <div className="pill-info-box">
                                    <Typography className="pill-type-label" style={{ opacity: selectedType === 'ALL' ? 1 : 0.6 }}>All Assets</Typography>
                                    <div className="pill-value-stack">
                                        <span className="pill-amt-val" style={{ '--text-color': '#6366f1', opacity: selectedType === 'ALL' ? 1 : 0.6 }}>
                                            {formatCurrency(totals.grossValue)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {uniqueTypes.map((type) => {
                                const stats = totals.typeStats[type] || { current: 0, invested: 0 };
                                const style = getAssetStyle(type);
                                const isSelected = selectedType === type;

                                return (
                                    <motion.div
                                        key={type}
                                        className="investment-category-pill glass-effect"
                                        onClick={() => setSelectedType(isSelected ? 'ALL' : type)}
                                        style={{
                                            cursor: 'pointer',
                                            '--card-border': isSelected ? `${style.color}40` : 'rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        <div
                                            className="pill-icon-box"
                                            style={{
                                                '--pill-bg': isSelected ? style.color : style.bg,
                                                '--pill-color': isSelected ? 'white' : style.color
                                            }}
                                        >
                                            {React.cloneElement(style.icon, { color: isSelected ? 'white' : style.color })}
                                        </div>
                                        <div className="pill-info-box">
                                            <Typography className="pill-type-label" style={{ opacity: isSelected ? 1 : 0.6 }}>{type}</Typography>
                                            <div className="pill-value-stack">
                                                <span className="pill-amt-val" style={{ '--text-color': style.color, opacity: isSelected ? 1 : 0.6 }}>
                                                    {formatCurrency(stats.current)}
                                                </span>
                                                <span className="pill-cost-label" style={{ opacity: isSelected ? 1 : 0.6 }}>
                                                    Invested: {formatCurrency(stats.invested)}
                                                </span>
                                                {stats.invested > 0 && (
                                                    <div className="pill-yield-meta">
                                                        <span className={stats.current >= stats.invested ? 'yield-up' : 'yield-down'}>
                                                            {stats.current >= stats.invested ? '+' : ''}{formatCurrency(Math.abs(stats.current - stats.invested))}
                                                        </span>
                                                        <span className={`${stats.current >= stats.invested ? 'yield-up' : 'yield-down'} yield-pct`}>
                                                            ({stats.current >= stats.invested ? '▲' : '▼'}{Math.abs(((stats.current - stats.invested) / stats.invested) * 100).toFixed(2)}%)
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>

            <div className="spending-split-layout">
                <div className="desktop-only-filter-wrapper desktop-only">
                    <div className="filters-sidebar-card glass-effect">
                        {renderFilters()}
                    </div>
                </div>

                <div className="spending-main-content">
                    <div className="desktop-only-meta-wrapper desktop-only">
                        {renderMetaStatusBar()}
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
                                        <div
                                            className="pill-icon-box"
                                            style={{ '--pill-bg': catStyle.bg, '--pill-color': catStyle.color }}
                                        >
                                            {catStyle.icon}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="asset-header-flex">
                                                <span className="asset-name-text">{s.name}</span>
                                                {s.ticker && <span className="asset-ticker-tag">{s.ticker}</span>}
                                                {s.status === 'COLLECTED' && <span className="collected-badge">COLLECTED</span>}
                                            </div>
                                            <div className="asset-meta-flex">
                                                <span>{dayjs(s.date).format('YYYY-MM-DD')} • {s.sub}</span>
                                                {s.last_updated && s.last_updated !== s.date && (
                                                    <span className="updated-tag" style={{ color: '#6366f1', fontWeight: 800 }}>
                                                        • Updated: {dayjs(s.last_updated).format('YYYY-MM-DD')}
                                                    </span>
                                                )}
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
                                            {(normalizedType === 'Chit Fund' || normalizedType === 'EPFO' || normalizedType === 'EPF') && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleToggleStatus(s)}
                                                    disabled={updatingStatus}
                                                    className={`btn-action-status ${s.status === 'COLLECTED' ? 'collected' : ''}`}
                                                >
                                                    {updatingStatus ? <CircularProgress size={16} color="inherit" /> : <CheckCircle2 size={16} />}
                                                </IconButton>
                                            )}
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
                                                {(() => {
                                                    const latest = grouped[month].reduce((max, s) => {
                                                        const cur = s.last_updated || s.date;
                                                        return !max || dayjs(cur).isAfter(dayjs(max)) ? cur : max;
                                                    }, null);

                                                    const groupItems = grouped[month];

                                                    const totalAdds = groupItems.reduce((sum, s) => {
                                                        const periodPurchases = (s.purchases || []).filter(p => isMatch(p.date));
                                                        let count = periodPurchases.length;
                                                        // Fallback: If no purchase entries, but the item itself was updated in this period
                                                        if (count === 0 && (isMatch(s.date) || isMatch(s.last_updated))) count = 1;
                                                        return sum + count;
                                                    }, 0);

                                                    const totalWithdraws = groupItems.reduce((sum, s) => {
                                                        return sum + (s.withdrawals || []).filter(w => isMatch(w.date)).length;
                                                    }, 0);

                                                    const totalAddUnits = groupItems.reduce((sum, s) => {
                                                        const periodPurchases = (s.purchases || []).filter(p => isMatch(p.date));
                                                        const pQty = periodPurchases.reduce((sq, p) => sq + (parseFloat(p.quantity) || 0), 0);

                                                        // Fallback: If no purchase entries but item was updated/added in this period
                                                        if (pQty === 0 && (isMatch(s.date) || isMatch(s.last_updated))) {
                                                            // For legacy/simple updates, we assume the current 'recent' qty or total qty
                                                            return sum + (parseFloat(s.recentPurchaseQty) || parseFloat(s.quantity) || 0);
                                                        }
                                                        return sum + pQty;
                                                    }, 0);

                                                    const totalWithdrawUnits = groupItems.reduce((sum, s) => {
                                                        return sum + (s.withdrawals || []).filter(w => isMatch(w.date)).reduce((sq, w) => sq + (parseFloat(w.quantity) || 0), 0);
                                                    }, 0);

                                                    return (
                                                        <div className="group-meta-info-cluster">
                                                            {latest && (
                                                                <span className="group-activity-tag">
                                                                    • LAST ACTY: {dayjs(latest).format('MMM DD')}
                                                                </span>
                                                            )}
                                                            <span className="group-tx-stats-tag">
                                                                • {totalAdds} ADDS ({totalAddUnits.toFixed(2)} Units) | {totalWithdraws} WITHDRAWS ({totalWithdrawUnits.toFixed(2)} Units)
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
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
