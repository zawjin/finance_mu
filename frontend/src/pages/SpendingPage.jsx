import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, PieChart, Download, Activity,
    TrendingUp, Calendar, Trash2, Edit2, Zap, CalendarDays,
    Globe, Home, Gem, DollarSign, Briefcase, Landmark, CreditCard, Settings, CheckCircle2, Layers,
    Plus, X, PlusCircle, Fingerprint, ChevronLeft, ChevronRight
} from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/formatters';
import PageHeader from '../components/ui/PageHeader';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import BaseDialog from '../components/ui/BaseDialog';
import './SpendingPage.scss';
import { Skeleton, Box, Button, Typography, Grid, IconButton, Divider, Dialog, DialogTitle, DialogContent, Grow, Stack, Select, MenuItem, TextField, CircularProgress } from '@mui/material';
import api from '../utils/api';
import { fetchFinanceData } from '../store/financeSlice';

// Charting
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, BarElement, LineElement, PointElement,
    CategoryScale, LinearScale, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

// Universal Icon Map Projection
import { getIcon } from '../utils/iconMap';

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


const getCatStyle = (catName, categories = []) => {
    const cat = categories.find(c => c.name === catName);
    const color = cat?.color || '#8e8e93';
    return { bg: `${color}12`, color: color };
};

export default function SpendingPage({ onEdit, showAnalytics, onToggleAnalytics }) {
    const dispatch = useDispatch();
    const touchStartRef = useRef(0);
    const { spending, categories, loading, reserves } = useSelector(state => state.finance);

    // Filters State
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('ALL');
    const [selectedSub, setSelectedSub] = useState('ALL');
    const [period, setPeriod] = useState('THIS MONTH');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [sortBy, setSortBy] = useState('DATE_DESC');
    const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
    const [selectedSourceId, setSelectedSourceId] = useState('ALL');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showRangeModal, setShowRangeModal] = useState(false);

    const [tempRange, setTempRange] = useState({ start: '', end: '' });
    const [purging, setPurging] = useState(false);
    const [filterPortalTarget, setFilterPortalTarget] = useState(null);

    useEffect(() => {
        setFilterPortalTarget(document.getElementById('mobile-filter-portal-target'));
    }, []);

    const handlePullToRefresh = async () => {
        setRefreshing(true);
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10);
        }
        await dispatch(fetchFinanceData());
        setTimeout(() => setRefreshing(false), 800);
    };

    // Settlement Logic
    const [showSettlement, setShowSettlement] = useState(false);
    const [settling, setSettling] = useState(false);
    const [settleData, setSettleData] = useState({ cardId: '', sourceId: '', amount: '', targetTx: null });

    const handleSettleTx = async () => {
        if (!settleData.sourceId || !settleData.amount) return;
        setSettling(true);
        try {
            const amount = parseFloat(settleData.amount);
            const tx = settleData.targetTx;

            // 1. Deduct from Source Reserve
            if (settleData.sourceId) {
                const target = reserves.find(r => r._id === settleData.sourceId);
                if (target) {
                    await api.put(`/reserves/${target._id}`, {
                        ...target,
                        balance: target.balance - amount
                    });
                }
            }

            // 2. Update the spending record recovery
            const newRecovered = (tx.recovered || 0) + amount;
            await api.put(`/spending/${tx._id}`, {
                ...tx,
                recovered: newRecovered
            });

            dispatch(fetchFinanceData());
            setShowSettlement(false);
            setSettleData({ cardId: '', sourceId: '', amount: '', targetTx: null });
        } catch (err) {
            console.error(err);
            alert("Settlement failed.");
        } finally {
            setSettling(false);
        }
    };

    const handleRemove = async () => {
        if (!deleteConfirmItem) return;
        setPurging(true);
        try {
            await api.delete(`/spending/${deleteConfirmItem._id}`);
            dispatch(fetchFinanceData());
            setDeleteConfirmItem(null);
        } catch (err) {
            console.error(err);
            alert("Purge failed.");
        } finally {
            setPurging(false);
        }
    };

    const baseFilteredSpending = useMemo(() => {
        return spending.filter(item => {
            // EXCLUDE INVESTMENT LOGS FROM SPENDING AUDIT AS REQUESTED
            const investmentCategories = [
                'investment', 'investments', 'investment settlement', 'stocks',
                'mutual funds', 'gold', 'property', 'crypto', 'fixed deposit',
                'chit fund', 'local investment', 'transfer', 'inflow'
            ];
            if (investmentCategories.includes((item.category || '').toLowerCase())) return false;

            const matchesSearch = (item.description || '').toLowerCase().includes(search.toLowerCase()) ||
                (item.category || '').toLowerCase().includes(search.toLowerCase());

            let matchesPeriod = true;
            const itemDate = dayjs(item.date);
            const now = dayjs();

            if (period === 'TODAY') matchesPeriod = itemDate.isSame(now, 'day');
            else if (period === 'YESTERDAY') matchesPeriod = itemDate.isSame(now.subtract(1, 'day'), 'day');
            else if (period === 'THIS WEEK') matchesPeriod = itemDate.isAfter(now.startOf('week').subtract(1, 'ms'));
            else if (period === 'THIS MONTH') matchesPeriod = itemDate.isAfter(now.startOf('month').subtract(1, 'ms'));
            else if (period === 'PREVIOUS MONTH') {
                const prev = now.subtract(1, 'month');
                matchesPeriod = itemDate.isAfter(prev.startOf('month').subtract(1, 'ms')) && itemDate.isBefore(prev.endOf('month').add(1, 'ms'));
            }
            else if (period === 'CUSTOM') {
                if (dateRange.start) matchesPeriod = matchesPeriod && itemDate.isAfter(dayjs(dateRange.start).subtract(1, 'day'));
                if (dateRange.end) matchesPeriod = matchesPeriod && itemDate.isBefore(dayjs(dateRange.end).add(1, 'day'));
            }

            const matchesSource = selectedSourceId === 'ALL' || item.payment_source_id === selectedSourceId;

            return matchesSearch && matchesPeriod && matchesSource;
        });
    }, [spending, search, period, dateRange, selectedSourceId]);

    const filteredSpending = useMemo(() => {
        let result = baseFilteredSpending.filter(item => selectedCat === 'ALL' || item.category === selectedCat);
        if (selectedSub !== 'ALL') {
            result = result.filter(item => (item.sub_category || '').toLowerCase() === selectedSub.toLowerCase());
        }

        // Sort
        result = [...result];
        if (sortBy === 'DATE_DESC') result.sort((a, b) => b.date.localeCompare(a.date));
        else if (sortBy === 'DATE_ASC') result.sort((a, b) => a.date.localeCompare(b.date));
        else if (sortBy === 'AMT_DESC') result.sort((a, b) => (b.amount || 0) - (a.amount || 0));
        else if (sortBy === 'AMT_ASC') result.sort((a, b) => (a.amount || 0) - (b.amount || 0));

        return result;
    }, [baseFilteredSpending, selectedCat, selectedSub, sortBy]);

    // Global Position (Unfiltered Persistent State)
    const globalSummary = useMemo(() => {
        let gross = 0;
        let recovered = 0;
        spending.forEach(item => {
            gross += item.amount || 0;
            recovered += item.recovered || 0;
        });
        return { gross, recovered, net: gross - recovered };
    }, [spending]);

    // Analytics Extraction (Accounting Standard)
    const totals = useMemo(() => {
        let grossSpend = 0;
        let grossRecovered = 0;
        const catStats = {}; // { category: { spend: 0, recovered: 0, net: 0 } }

        baseFilteredSpending.forEach(item => {
            const amt = item.amount || 0;
            const rec = item.recovered || 0;
            const cat = item.category;

            if (!catStats[cat]) catStats[cat] = { spend: 0, recovered: 0, net: 0 };

            grossSpend += amt;
            grossRecovered += rec;
            catStats[cat].spend += amt;
            catStats[cat].recovered += rec;
            catStats[cat].net += (amt - rec);
        });

        return { grossSpend, grossRecovered, net: grossSpend - grossRecovered, catStats };
    }, [baseFilteredSpending]);

    const trendAnalysis = useMemo(() => {
        const dailyNet = {};
        filteredSpending.forEach(s => {
            const amt = (s.amount || 0) - (s.recovered || 0);
            dailyNet[s.date] = (dailyNet[s.date] || 0) + amt;
        });
        const dates = Object.keys(dailyNet).sort();
        let cumulative = 0;
        const cumulativeData = dates.map(d => { cumulative += dailyNet[d]; return cumulative; });

        return {
            labels: dates.map(d => dayjs(d).format('MMM DD')),
            daily: dates.map(d => dailyNet[d]),
            cumulative: cumulativeData
        };
    }, [filteredSpending]);

    const chartConfig = useMemo(() => {
        const catLabels = Object.keys(totals.catStats).filter(l => totals.catStats[l].spend > 0);
        const catColors = catLabels.map(l => getCatStyle(l, categories).color);

        return {
            doughnut: {
                labels: catLabels,
                datasets: [{
                    data: catLabels.map(l => totals.catStats[l].spend),
                    backgroundColor: catColors.map(c => `${c}40`),
                    borderColor: catColors,
                    borderWidth: 2,
                    cutout: '72%'
                }]
            },
            trajectory: {
                labels: trendAnalysis.labels,
                datasets: [{
                    label: 'Cumulative Burn',
                    data: trendAnalysis.cumulative,
                    borderColor: '#34c759',
                    backgroundColor: 'rgba(52, 199, 89, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 2
                }]
            },
            bar: {
                labels: trendAnalysis.labels,
                datasets: [{
                    label: 'Daily Burn',
                    data: trendAnalysis.daily,
                    backgroundColor: 'rgba(0, 113, 227, 0.4)',
                    borderColor: '#0071e3',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            }
        };
    }, [totals, trendAnalysis]);

    const handleExportCSV = () => {
        const headers = ["Date", "Description", "Category", "Sub Category", "Amount"];
        const rows = filteredSpending.map(s => [s.date, s.description, s.category, s.sub_category, s.amount]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `audit_${dayjs().format('YYYY-MM-DD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderFilters = () => (
        <div className="sidebar-sticky-wrap">
            <div className="filter-section-block">
                <div className="search-input-wrapper">
                    <Search size={15} className="search-icon-fixed" />
                    <input className="filter-search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Description, category..." />
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
                        <div
                            key={p.id}
                            className={`unified-filter-btn ${period === p.id ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPeriod(p.id);
                            }}
                        >
                            <span className="th-icon" style={{ color: period === p.id ? 'white' : 'var(--primary)' }}>{p.icon}</span>
                            <span className="th-label">{p.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            {period === 'CUSTOM' && (
                <div className="filter-section-block margin-t-1-5" onClick={(e) => e.stopPropagation()}>
                    <div className="filter-section-label"><CalendarDays size={13} /><span>SELECT AUDIT RANGE</span></div>
                    <div
                        className="mui-range-trigger"
                        onClick={() => {
                            setTempRange(dateRange);
                            setShowRangeModal(true);
                        }}
                    >
                        <div className="trigger-icon"><Calendar size={18} /></div>
                        <div className="trigger-text">
                            {dateRange.start && dateRange.end
                                ? `${dayjs(dateRange.start).format('MMM D')} — ${dayjs(dateRange.end).format('MMM D, YYYY')}`
                                : (dateRange.start ? `From ${dayjs(dateRange.start).format('MMM D')}...` : 'Choose dates')}
                        </div>
                        <Edit2 size={14} className="trigger-edit-icon" />
                    </div>
                </div>
            )}

            <div className="filter-section-block margin-t-1-75">
                <div className="filter-section-label"><span>ACCOUNT SOURCE PORTALS</span></div>
                <div className="unified-filter-grid">
                    <div
                        className={`unified-filter-btn ${selectedSourceId === 'ALL' ? 'active' : ''}`}
                        onClick={() => setSelectedSourceId('ALL')}
                    >
                        <span className="th-icon" style={{ color: selectedSourceId === 'ALL' ? 'white' : '#6366f1' }}><Activity size={20} /></span>
                        <span className="th-label">All Portals</span>
                    </div>
                    {reserves.map(r => (
                        <div
                            key={r._id}
                            className={`unified-filter-btn ${selectedSourceId === r._id ? 'active' : ''}`}
                            onClick={() => setSelectedSourceId(r._id)}
                            style={{
                                '--portal-color': r.account_type === 'BANK' ? '#6366f1' : (r.account_type === 'CREDIT_CARD' ? '#ff3b30' : (r.account_type === 'CASH' ? '#f59e0b' : '#10b981')),
                                '--portal-border': selectedSourceId === r._id ? (r.account_type === 'CREDIT_CARD' ? '#ff3b30' : '#6366f1') : 'transparent'
                            }}
                        >
                            <div className="portal-dot" />
                            <span className="th-label">{r.account_name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderMetaStatusBar = () => (
        <div className="meta-status-bar">
            <div className="badge-status">
                <span className="badge-count-text">{filteredSpending.length}</span> LOGS FOUND
            </div>
            <div className="action-hub-right">
                <div className="sort-group-premium">
                    {[
                        { id: 'DATE_DESC', label: 'Latest' },
                        { id: 'DATE_ASC', label: 'Oldest' },
                        { id: 'AMT_DESC', label: 'High' },
                        { id: 'AMT_ASC', label: 'Low' },
                    ].map(s => (
                        <button
                            key={s.id}
                            onClick={() => setSortBy(s.id)}
                            className={`sort-pill-btn ${sortBy === s.id ? 'active' : ''}`}
                        >{s.label}</button>
                    ))}
                </div>
                <button onClick={() => { setSearch(''); setSelectedCat('ALL'); setPeriod('THIS MONTH'); setSortBy('DATE_DESC'); }} className="btn-clear-minimal">CLEAR ALL</button>
                <button onClick={handleExportCSV} className="btn-export-minimal"><Download size={13} /> </button>
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
                <div className="mobile-only-filter-wrapper">
                    {filterPortalTarget ? createPortal(
                        <button
                            onClick={() => setMobileFiltersOpen(o => !o)}
                            className={`mh-icon-btn ${mobileFiltersOpen ? 'active' : ''}`}
                            aria-label="Toggle filters"
                            style={{ position: 'relative' }}
                        >
                            <Filter size={18} />
                            {(selectedCat !== 'ALL' || selectedSourceId !== 'ALL' || period !== 'THIS MONTH' || search) && (
                                <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#ff3b30', borderRadius: '50%', border: '2px solid var(--app-bg, #f8fafc)' }}></span>
                            )}
                        </button>,
                        filterPortalTarget
                    ) : (
                        <button className="mobile-filter-toggle" onClick={() => setMobileFiltersOpen(o => !o)}>
                            <span className="mft-left">
                                <Filter size={13} />
                                <span>Filters</span>
                                {(selectedCat !== 'ALL' || selectedSourceId !== 'ALL' || period !== 'THIS MONTH' || search) && (
                                    <span className="mft-badge">Active</span>
                                )}
                            </span>
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
            {/* ANALYTICS HUB - TRIPLE BOX CONVERGENCE */}
            {showAnalytics && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="spending-analytics-container"
                >
                    <Box className="glass-effect analytics-card-premium">
                        <div className="analytics-hub">
                            {/* BOX 1: ARCHITECTURE - 20% on Desktop, 100% on Mobile */}
                            <div className="analytic-box-super">
                                <Box className="analytic-inner-card">
                                    <Typography className="analytic-subtitle">
                                        <PieChart size={14} color="var(--primary)" /> ARCHITECTURE
                                    </Typography>
                                    <Box className="doughnut-chart-wrap">
                                        <Doughnut data={chartConfig.doughnut} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} />
                                        <Box className="analytics-chart-overlay">
                                            <Typography className="overlay-label">BURN</Typography>
                                            <Typography className="overlay-value">{formatCurrency(totals.grossSpend)}</Typography>
                                        </Box>
                                    </Box>
                                    <Box className="stats-list-flex">
                                        {Object.entries(totals.catStats).sort((a, b) => b[1].spend - a[1].spend).slice(0, 3).map(([cat, stats]) => {
                                            const catStyle = getCatStyle(cat, categories);
                                            return (
                                                <Box key={cat} className="stat-row-item">
                                                    <Box className="stat-label-flex">
                                                        <div className="portal-dot" style={{ '--dot-color': catStyle.color }}></div>
                                                        <Typography className="stat-cat-text">{cat}</Typography>
                                                    </Box>
                                                    <Typography className="stat-val-text" style={{ '--text-color': catStyle.color }}>{formatCurrency(stats.net)}</Typography>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Box>
                            </div>

                            {/* BOX 2: TRAJECTORY - 40% on Desktop, 100% on Mobile */}
                            <div className="analytic-box-super">
                                <Box className="analytic-inner-card-large">
                                    <div className="purge-row-flex margin-b-2-5">
                                        <Typography className="analytic-subtitle">
                                            <TrendingUp size={14} color="#34c759" /> TRAJECTORY
                                        </Typography>
                                        <Box className="text-right">
                                            <Typography className="analytic-value-success">{formatCurrency(trendAnalysis.cumulative.slice(-1)[0] || 0)}</Typography>
                                            <Typography className="analytic-label-secondary">CUMULATIVE</Typography>
                                        </Box>
                                    </div>
                                    <Box className="chart-container-fluid">
                                        <Line
                                            data={chartConfig.trajectory}
                                            options={{
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    x: { grid: { display: false }, ticks: { font: { family: 'Outfit', size: 9, weight: 800 }, color: '#86868b' } },
                                                    y: { grid: { color: 'rgba(0,0,0,0.03)' }, border: { display: false }, ticks: { font: { family: 'Outfit', size: 10, weight: 800 }, color: '#86868b' } }
                                                },
                                                maintainAspectRatio: false
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </div>

                            {/* BOX 3: VELOCITY - 40% on Desktop, 100% on Mobile */}
                            <div className="analytic-box-super">
                                <Box className="analytic-inner-card-large">
                                    <Typography className="analytic-subtitle">
                                        <Activity size={14} color="#0071e3" /> VELOCITY
                                    </Typography>
                                    <Box className="chart-container-fluid">
                                        <Bar
                                            data={chartConfig.bar}
                                            options={{
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    x: { grid: { display: false }, ticks: { font: { family: 'Outfit', size: 9, weight: 800 }, color: '#86868b' } },
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

            {/* PERMANENT PURGE CONFIRMATION DIALOG - POP UP MODAL */}
            <Dialog
                open={!!deleteConfirmItem}
                onClose={() => setDeleteConfirmItem(null)}
                TransitionComponent={Grow}
                transitionDuration={400}
                className="dialog-purge-backdrop"
            >
                {deleteConfirmItem && (
                    <Box className="dialog-purge-wrap">
                        <div className="dialog-purge-icon-square">
                            <Trash2 size={32} />
                        </div>
                        <Typography className="dialog-title-critical">CRITICAL PURGE</Typography>
                        <Typography className="dialog-desc-audit">
                            Permanently purge <strong className="text-dark">{deleteConfirmItem.description}</strong> from the primary ledger? This action is irreversible.
                        </Typography>

                        <div className="dialog-audit-snippet">
                            <div className="snippet-row">
                                <span className="snippet-label">CATEGORY</span>
                                <span className="snippet-value-upper">{deleteConfirmItem.category}</span>
                            </div>
                            <div className="snippet-row">
                                <span className="snippet-label">AUDIT AMOUNT</span>
                                <span className="snippet-value-danger">{formatCurrency(deleteConfirmItem.amount)}</span>
                            </div>
                        </div>

                        <div className="dialog-action-flex">
                            <Button fullWidth onClick={() => setDeleteConfirmItem(null)} disabled={purging} className="btn-abort-action">ABORT</Button>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleRemove}
                                disabled={purging}
                                className="btn-confirm-purge"
                                startIcon={purging ? <CircularProgress size={16} color="inherit" /> : null}
                            >
                                {purging ? 'PURGING...' : 'PROCEED PURGE'}
                            </Button>
                        </div>
                    </Box>
                )}
            </Dialog>

            {/* FINANCIAL SUMMARY CORE */}
            <div className="summary-grid">
                <div className="summary-card-premium">
                    <div className="summary-icon-wrapper debit"><Download size={20} /></div>
                    <div>
                        <Typography className="summary-label-mini">GROSS DEBIT</Typography>
                        <Typography className="summary-value-main">{formatCurrency(totals.grossSpend)}</Typography>
                    </div>
                </div>
                <div className="summary-card-premium">
                    <div className="summary-icon-wrapper recovery"><Download size={20} style={{ transform: 'none' }} /></div>
                    <div>
                        <Typography className="summary-label-mini">TOTAL RECOVERY</Typography>
                        <Typography className="summary-value-success">{formatCurrency(totals.grossRecovered)}</Typography>
                    </div>
                </div>
                <div className="summary-card-premium outstanding">
                    <div className="summary-icon-wrapper primary"><Activity size={20} /></div>
                    <div>
                        <Typography className="summary-label-primary">OUTSTANDING</Typography>
                        <Typography className="summary-value-main">{formatCurrency(totals.net)}</Typography>
                    </div>
                </div>
            </div>

            {/* CATEGORY SUMMARY PILLS */}
            <div className="category-scroll-container">
                <div className="category-scroll-track">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <Skeleton key={i} variant="rectangular" width={140} height={60} className="skeleton-pill-box" />
                        ))
                    ) : (
                        <>
                            <motion.div
                                key="ALL"
                                className="apple-category-pill glass-effect category-pill-wrapper"
                                onClick={() => { setSelectedCat('ALL'); setSelectedSub('ALL'); }}
                                style={{
                                    cursor: 'pointer',
                                    '--card-border': selectedCat === 'ALL' ? '#6366f140' : 'rgba(0,0,0,0.05)'
                                }}
                            >
                                <div
                                    className={`pill-icon-box ${selectedCat === 'ALL' ? 'active' : 'inactive'}`}
                                    style={{
                                        '--pill-bg': selectedCat === 'ALL' ? '#6366f1' : 'rgba(0,0,0,0.03)',
                                        '--pill-color': selectedCat === 'ALL' ? 'white' : '#6366f1'
                                    }}
                                >
                                    <Layers size={20} color={selectedCat === 'ALL' ? 'white' : '#6366f1'} strokeWidth={2.4} />
                                </div>
                                <div className="pill-info-box">
                                    <div className="tx-sub-flex">
                                        <span className={`pill-cat-label ${selectedCat === 'ALL' ? 'active' : 'inactive'}`}>All Activity</span>
                                    </div>
                                    <div className="content-shell">
                                        <span className={`pill-amt-val ${selectedCat === 'ALL' ? 'active' : 'inactive'}`} style={{ '--text-color': '#6366f1' }}>
                                            {formatCurrency(totals.net)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                            {[...categories]
                                .filter(c => ![
                                    'investment', 'investments', 'investment settlement', 'stocks',
                                    'mutual funds', 'gold', 'property', 'crypto', 'fixed deposit',
                                    'chit fund', 'local investment', 'transfer', 'inflow'
                                ].includes((c.name || '').toLowerCase()))
                                .sort((a, b) => {
                                    const statsA = totals.catStats[a.name] || { net: 0 };
                                    const statsB = totals.catStats[b.name] || { net: 0 };
                                    return Math.abs(statsB.net) - Math.abs(statsA.net);
                                })
                                .map((catObj) => {
                                    const cat = catObj.name;
                                    const stats = totals.catStats[cat] || { spend: 0, recovered: 0, net: 0 };
                                    const style = getCatStyle(cat, categories);
                                    const hasActivity = stats.spend > 0;

                                    return (
                                        <motion.div
                                            key={cat}
                                            className="apple-category-pill glass-effect category-pill-wrapper"
                                            onClick={() => { setSelectedCat(selectedCat === cat ? 'ALL' : cat); setSelectedSub('ALL'); }}
                                            style={{
                                                cursor: 'pointer',
                                                '--card-border': selectedCat === cat ? `${style.color}40` : 'rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <div
                                                className={`pill-icon-box ${selectedCat === cat ? 'active' : 'inactive'}`}
                                                style={{
                                                    '--pill-bg': selectedCat === cat ? '#6366f1' : 'rgba(0,0,0,0.03)',
                                                    '--pill-color': selectedCat === cat ? 'white' : style.color
                                                }}
                                            >
                                                {getIcon(cat, categories, {
                                                    size: 20,
                                                    color: selectedCat === cat ? 'white' : style.color,
                                                    fill: 'none',
                                                    strokeWidth: 2.4
                                                })}
                                            </div>
                                            <div className="pill-info-box">
                                                <div className="tx-sub-flex">
                                                    <span className={`pill-cat-label ${hasActivity ? 'active' : 'inactive'}`}>{cat}</span>
                                                </div>
                                                <div className="content-shell">
                                                    <span className={`pill-amt-val ${hasActivity ? 'active' : 'inactive'}`} style={{ '--text-color': hasActivity ? style.color : '#8e8e93' }}>
                                                        {formatCurrency(stats.net)}
                                                    </span>
                                                    {(stats.recovered > 0) && (
                                                        <div className="tx-recovery-small">
                                                            <span className="recovery-up">↑{formatCurrency(stats.spend)}</span>
                                                            <span className="recovery-down">↓{formatCurrency(stats.recovered)}</span>
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

                {/* Pull to Refresh Indicator */}
                <AnimatePresence>
                    {refreshing && (
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 20, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            className="pull-to-refresh-indicator"
                        >
                            <Activity size={16} className="spin-slow" />
                            <span>Refreshing Ledger...</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="spending-main-content">
                    <div className="desktop-only-meta-wrapper desktop-only">
                        {renderMetaStatusBar()}
                    </div>

                    <div className="data-table-premium scroll-y-luxury scroll-y-luxury_jj">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <Box key={i} sx={{ mb: 4 }}>
                                    <Skeleton variant="text" width="20%" height={30} sx={{ mb: 2, ml: 2 }} />
                                    {[...Array(3)].map((_, j) => (
                                        <Box key={j} sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2, borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                            <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: '8px' }} />
                                            <Box sx={{ flex: 1 }}><Skeleton variant="text" width="40%" height={24} /><Skeleton variant="text" width="20%" height={16} /></Box>
                                            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '50px' }} /><Skeleton variant="text" width={60} height={24} />
                                        </Box>
                                    ))}
                                </Box>
                            ))
                        ) : (() => {
                            const grouped = filteredSpending.reduce((acc, curr) => {
                                if (!acc[curr.date]) acc[curr.date] = [];
                                acc[curr.date].push(curr);
                                return acc;
                            }, {});
                            const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
                            if (dates.length === 0) return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-dim)', fontWeight: 800 }}>No entries matching criteria.</div>;

                            return dates.map(date => {
                                const daySpend = grouped[date].reduce((sum, s) => sum + (s.amount || 0), 0);
                                const dayRecovery = grouped[date].reduce((sum, s) => sum + (s.recovered || 0), 0);
                                const dayNet = daySpend - dayRecovery;

                                return (
                                    <div key={date} className="date-group">
                                        <div className="date-header-luxury">
                                            <div className="table-header-flex">
                                                <Calendar size={14} color="var(--primary)" fill="rgba(0,113,227,0.2)" />
                                                <span className="table-header-title">{date}</span>
                                            </div>
                                            <div className="day-totals-flex">
                                                {(dayRecovery > 0) && (
                                                    <div className="day-stats-small">
                                                        <span className="text-danger">S: {formatCurrency(daySpend)}</span>
                                                        <span className="text-success">R: {formatCurrency(dayRecovery)}</span>
                                                    </div>
                                                )}
                                                <div className="outstanding-label-wrap">
                                                    OUTSTANDING: <span className={dayNet > 0 ? 'text-danger' : (dayNet < 0 ? 'text-success' : 'text-dim')}>{formatCurrency(dayNet)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="date-transactions">
                                            {grouped[date].map((s, idx) => {
                                                const catStyle = getCatStyle(s.category, categories);
                                                const outstanding = (s.amount || 0) - (s.recovered || 0);
                                                const sourceAccount = reserves.find(r => r._id === s.payment_source_id);
                                                const isUnsettled = (sourceAccount?.account_type === 'CREDIT_CARD') && outstanding > 0;

                                                return (
                                                    <div key={idx} className="transaction-row-fancy">
                                                        <div className="tx-icon-box" style={{ background: catStyle.bg }}>
                                                            {getIcon(s.category, categories)}
                                                        </div>
                                                        <div className="tx-main-info">
                                                            <div className="tx-desc-text">{s.description}</div>
                                                            <div className="tx-sub-flex">
                                                                <span className="tx-sub-label">{s.sub_category}</span>
                                                                {sourceAccount && (
                                                                    <span className={`tx-portal-tag ${isUnsettled ? 'unsettled' : 'settled'}`}>
                                                                        via {sourceAccount.account_name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="tx-cat-badge-wrap">
                                                            <span className="tx-cat-badge-pill" style={{ background: catStyle.bg, color: catStyle.color }}>{s.category}</span>
                                                        </div>
                                                        <div className="tx-amount-col">
                                                            <div className="tx-amount-main">{formatCurrency(outstanding)}</div>
                                                            {s.recovered > 0 && (
                                                                <div className="tx-recovery-small">Rec: {formatCurrency(s.recovered)}</div>
                                                            )}
                                                        </div>

                                                        {/* High-Fidelity Action Cluster */}
                                                        <div className="row-action-cluster tx-action-cluster">
                                                            {isUnsettled && (
                                                                <IconButton size="small" onClick={() => {
                                                                    setSettleData({ cardId: s.payment_source_id, sourceId: '', amount: outstanding.toString(), targetTx: s });
                                                                    setShowSettlement(true);
                                                                }} sx={{ color: '#ff3b30', '&:hover': { bgcolor: '#fff1f2' } }}>
                                                                    <Activity size={14} />
                                                                </IconButton>
                                                            )}
                                                            <IconButton size="small" onClick={() => onEdit(s)} sx={{ color: 'var(--primary)', '&:hover': { bgcolor: 'rgba(0,113,227,0.08)' } }}>
                                                                <Edit2 size={13} />
                                                            </IconButton>
                                                            <IconButton size="small" onClick={() => setDeleteConfirmItem(s)} sx={{ color: '#ff3b30', '&:hover': { bgcolor: 'rgba(255,59,48,0.08)' } }}>
                                                                <Trash2 size={13} />
                                                            </IconButton>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            </div>

            {/* PERMANENT PURGE CONFIRMATION DIALOG - POP UP MODAL */}
            <BaseDialog
                open={!!deleteConfirmItem}
                onClose={() => setDeleteConfirmItem(null)}
                title="Critical Purge"
                maxWidth="xs"
            >
                {deleteConfirmItem && (
                    <Box className="purge-dialog-body">
                        <div className="purge-icon-circle">
                            <Trash2 size={32} />
                        </div>
                        <Typography variant="body1" sx={{ color: '#86868b', mb: 3, lineHeight: 1.6, fontSize: '0.95rem' }}>
                            Permanently purge <strong style={{ color: '#1d1d1f' }}>{deleteConfirmItem.description}</strong> from the primary ledger? This action is irreversible.
                        </Typography>

                        <div className="purge-audit-card">
                            <div className="purge-row-flex">
                                <span className="purge-label-micro">CATEGORY</span>
                                <span className="purge-val-micro">{deleteConfirmItem.category}</span>
                            </div>
                            <div className="purge-row-flex last">
                                <span className="purge-label-micro">AUDIT AMOUNT</span>
                                <span className="purge-val-micro" style={{ color: '#ff3b30' }}>{formatCurrency(deleteConfirmItem.amount)}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button fullWidth onClick={() => setDeleteConfirmItem(null)} sx={{ borderRadius: '50px', p: '0.9rem', fontWeight: 800, color: '#1d1d1f', bgcolor: 'rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }, textTransform: 'none' }}>ABORT</Button>
                            <Button fullWidth variant="contained" onClick={handleRemove} sx={{ borderRadius: '50px', p: '0.9rem', fontWeight: 800, bgcolor: '#ff3b30', boxShadow: '0 10px 20px -5px rgba(255,59,48,0.3)', '&:hover': { bgcolor: '#e03228', transform: 'translateY(-2px)' }, textTransform: 'none', transition: '0.2s' }}>PROCEED PURGE</Button>
                        </div>
                    </Box>
                )}
            </BaseDialog>

            {/* SETTLEMENT MODAL */}
            <BaseDialog
                open={showSettlement}
                onClose={() => setShowSettlement(false)}
                title="Settle Transaction"
                maxWidth="xs"
            >
                <Box sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#86868b', mb: 1, textTransform: 'uppercase' }}>SOURCE ACCOUNT (TO DEDUCT FROM)</Typography>
                            <Select
                                fullWidth
                                value={settleData.sourceId}
                                onChange={(e) => setSettleData({ ...settleData, sourceId: e.target.value })}
                                size="small"
                                sx={{ borderRadius: '14px', bgcolor: 'rgba(0,0,0,0.02)', fontWeight: 800 }}
                            >
                                {reserves.map(r => (
                                    <MenuItem key={r._id} value={r._id} sx={{ fontWeight: 800 }}>{r.account_name}</MenuItem>
                                ))}
                            </Select>
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#86868b', mb: 1, textTransform: 'uppercase' }}>SETTLEMENT AMOUNT (₹)</Typography>
                            <TextField
                                fullWidth
                                placeholder="0.00"
                                value={settleData.amount}
                                onChange={(e) => setSettleData({ ...settleData, amount: e.target.value })}
                                size="small"
                                type="number"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'rgba(0,0,0,0.02)', fontWeight: 800 } }}
                            />
                        </Box>
                        <Stack direction="row" spacing={2}>
                            <Button fullWidth onClick={() => setShowSettlement(false)} sx={{ py: 1.5, borderRadius: '50px', fontWeight: 800, bgcolor: 'rgba(0,0,0,0.05)', color: '#1d1d1f' }}>ABORT</Button>
                            <Button fullWidth variant="contained" disabled={settling} onClick={handleSettleTx} sx={{ py: 1.5, borderRadius: '50px', fontWeight: 900, bgcolor: '#ff3b30' }}>
                                {settling ? 'PROCESSING...' : 'COMPLETE SETTLEMENT'}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </BaseDialog>
        </motion.div>
    );
}

const TableWrapper = ({ children }) => (
    <div className="table-wrapper-luxury">
        {children}
    </div>
);
