import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
    Search, Tag, Calendar, CalendarDays, Clock, Filter, 
    PieChart, Layers, History, X, Download, Activity,
    Utensils, ShoppingBag, Heart, Zap, Briefcase, Lightbulb, 
    Truck, Globe
} from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/formatters';
import PageHeader from '../components/ui/PageHeader';
import Loader from '../components/ui/Loader';

export default function SpendingPage({ onAdd }) {
    const { spending, categories, loading } = useSelector(state => state.finance);
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('ALL');
    const [selectedSub, setSelectedSub] = useState('ALL');
    const [period, setPeriod] = useState('ALL');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const filteredSpending = useMemo(() => {
        let list = [...spending];
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        const mondayStr = monday.toISOString().split('T')[0];

        const resetNow = new Date();
        const thisMonth = resetNow.getFullYear() + '-' + String(resetNow.getMonth() + 1).padStart(2, '0');
        const dLast = new Date(resetNow.getFullYear(), resetNow.getMonth() - 1, 1);
        const lastMonth = dLast.getFullYear() + '-' + String(dLast.getMonth() + 1).padStart(2, '0');
        const thisYear = resetNow.getFullYear().toString();
        const lastYear = (resetNow.getFullYear() - 1).toString();

        if (period === 'TODAY') list = list.filter(s => s.date === todayStr);
        else if (period === 'YESTERDAY') list = list.filter(s => s.date === yesterdayStr);
        else if (period === 'THIS WEEK') list = list.filter(s => s.date >= mondayStr && s.date <= todayStr);
        else if (period === 'THIS MONTH') list = list.filter(s => s.date.startsWith(thisMonth));
        else if (period === 'PREVIOUS MONTH') list = list.filter(s => s.date.startsWith(lastMonth));
        else if (period === 'THIS YEAR') list = list.filter(s => s.date.startsWith(thisYear));
        else if (period === 'LAST YEAR') list = list.filter(s => s.date.startsWith(lastYear));
        else if (period === 'CUSTOM' && dateRange.start && dateRange.end) {
            list = list.filter(s => s.date >= dateRange.start && s.date <= dateRange.end);
        }

        if (selectedCat !== 'ALL') list = list.filter(s => s.category === selectedCat);
        if (selectedSub !== 'ALL') list = list.filter(s => s.sub_category === selectedSub);
        if (search) {
            list = list.filter(item =>
                item.description.toLowerCase().includes(search.toLowerCase()) ||
                item.category.toLowerCase().includes(search.toLowerCase()) ||
                item.sub_category.toLowerCase().includes(search.toLowerCase())
            );
        }
        return list;
    }, [spending, search, period, selectedCat, selectedSub, dateRange]);

    const categoryTotals = useMemo(() => {
        const totals = {};
        categories.forEach(c => totals[c.name] = 0);
        filteredSpending.forEach(s => {
            if (totals[s.category] !== undefined) totals[s.category] += s.amount;
            else totals[s.category] = s.amount;
        });
        return Object.fromEntries(
            Object.entries(totals).sort((a, b) => b[1] !== a[1] ? b[1] - a[1] : a[0].localeCompare(b[0]))
        );
    }, [filteredSpending, categories]);

    const getIcon = (cat) => {
        const lower = (cat || '').toLowerCase();
        if (lower.includes('food')) return <Utensils size={18} color="#f87171" />;
        if (lower.includes('shop')) return <ShoppingBag size={18} color="#fbbf24" />;
        if (lower.includes('health')) return <Heart size={18} color="#f43f5e" />;
        if (lower.includes('grocer')) return <Zap size={18} color="#4ade80" />;
        if (lower.includes('office')) return <Briefcase size={18} color="#60a5fa" />;
        if (lower.includes('utilit')) return <Lightbulb size={18} color="#a78bfa" />;
        if (lower.includes('transpo')) return <Truck size={18} color="#fb923c" />;
        return <Activity size={18} color="var(--primary)" />;
    };

    const getCatStyle = (cat) => {
        const lower = (cat || '').toLowerCase();
        if (lower.includes('food')) return { color: '#f87171', bg: 'rgba(248,113,113,0.1)' };
        if (lower.includes('shop')) return { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' };
        if (lower.includes('health')) return { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)' };
        if (lower.includes('grocer')) return { color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
        if (lower.includes('office')) return { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' };
        if (lower.includes('utilit')) return { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' };
        if (lower.includes('transpo')) return { color: '#f97316', bg: 'rgba(249,115,22,0.1)' };
        return { color: '#6366f1', bg: 'rgba(99,102,241,0.1)' };
    };

    const handleExportCSV = () => {
        if (filteredSpending.length === 0) return;
        const headers = ["Date", "Description", "Category", "Sub-Category", "Amount"];
        const rows = filteredSpending.map(s => [s.date, s.description, s.category, s.sub_category, s.amount]);
        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.map(h => `"${h}"`).join(",") + "\n"
            + rows.map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `finance_audit_${period.toLowerCase().replace(/ /g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <Loader message="Auditing Financial Records..." />;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container-super">
            {/* CATEGORY SUMMARY PILLS */}
            <div style={{ width: '100%', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', padding: '0.5rem 0', scrollbarWidth: 'none' }}>
                    {Object.entries(categoryTotals).map(([cat, amt]) => (
                        <motion.div key={cat} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="apple-category-pill glass-effect">
                            <div className="pill-icon-box">{getIcon(cat)}</div>
                            <div className="pill-info-box">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span className="pill-cat-label">{cat}</span>
                                    {amt > 0 && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0071e3' }}></div>}
                                </div>
                                <span className="pill-amt-val" style={{ color: amt > 0 ? '#0071e3' : '#1d1d1f' }}>{formatCurrency(amt)}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="spending-split-layout">
                {/* LEFT: FILTERS */}
                <div className="spending-control-panel">
                    <div className="spending-filters-compact glass-effect">

                        {/* SEARCH */}
                        <div className="filter-section-block">
                            <div className="filter-section-label"><Search size={13} /><span>SEARCH DETAIL</span></div>
                            <div style={{ position: 'relative' }}>
                                <Search size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                                <input
                                    className="filter-search-input"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Type description, category..."
                                    style={{ paddingLeft: '2.75rem' }}
                                />
                                {search && (
                                    <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--text-dim)' }}>
                                        <X size={11} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* CATEGORY */}
                        <div className="filter-section-block" style={{ marginTop: '1.75rem' }}>
                            <div className="filter-section-label"><Tag size={13} /><span>CATEGORY</span></div>
                            <div className="category-filter-grid">
                                <div className={`cat-filter-chip ${selectedCat === 'ALL' ? 'active' : ''}`} onClick={() => { setSelectedCat('ALL'); setSelectedSub('ALL'); }}>All</div>
                                {categories.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                                    <div key={c.name} className={`cat-filter-chip ${selectedCat === c.name ? 'active' : ''}`} onClick={() => { setSelectedCat(c.name); setSelectedSub('ALL'); }} title={c.name}>
                                        {getIcon(c.name)}
                                        <span>{c.name.split(' ')[0]}</span>
                                    </div>
                                ))}
                            </div>
                            {selectedCat !== 'ALL' && (
                                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                    <span className={`sub-cat-pill ${selectedSub === 'ALL' ? 'active' : ''}`} onClick={() => setSelectedSub('ALL')}>All</span>
                                    {(categories.find(c => c.name === selectedCat)?.sub_categories || []).slice().sort().map(sub => (
                                        <span key={sub} className={`sub-cat-pill ${selectedSub === sub ? 'active' : ''}`} onClick={() => setSelectedSub(sub)}>{sub}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* TIME HORIZON */}
                        <div className="filter-section-block" style={{ marginTop: '1.75rem' }}>
                            <div className="filter-section-label"><Clock size={13} /><span>TIME HORIZON</span></div>
                            <div className="time-horizon-grid">
                                {[
                                    { id: 'TODAY', label: 'Today', icon: <Zap size={13} /> },
                                    { id: 'YESTERDAY', label: 'Yesterday', icon: <Clock size={13} /> },
                                    { id: 'THIS WEEK', label: 'This Week', icon: <Calendar size={13} /> },
                                    { id: 'THIS MONTH', label: 'This Month', icon: <PieChart size={13} /> },
                                    { id: 'PREVIOUS MONTH', label: 'Prev Month', icon: <CalendarDays size={13} /> },
                                    { id: 'THIS YEAR', label: 'This Year', icon: <Layers size={13} /> },
                                    { id: 'LAST YEAR', label: 'Last Year', icon: <History size={13} /> },
                                    { id: 'ALL', label: 'All Time', icon: <Globe size={13} /> },
                                    { id: 'CUSTOM', label: 'Custom', icon: <Filter size={13} /> },
                                ].map(p => (
                                    <div key={p.id} className={`time-horizon-btn ${period === p.id ? 'active' : ''}`} onClick={() => setPeriod(p.id)}>
                                        <span className="th-icon">{p.icon}</span>
                                        <span className="th-label">{p.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CUSTOM DATE RANGE */}
                        {period === 'CUSTOM' && (
                            <div className="filter-section-block" style={{ marginTop: '1.5rem' }}>
                                <div className="filter-section-label"><CalendarDays size={13} /><span>DATE RANGE</span></div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <DatePicker
                                        label="START DATE"
                                        value={dateRange.start ? dayjs(dateRange.start) : null}
                                        onChange={(val) => setDateRange({ ...dateRange, start: val ? val.format('YYYY-MM-DD') : '' })}
                                        slotProps={{ textField: { size: 'small', fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '12px', background: 'white' }, '& .MuiOutlinedInput-input': { color: 'var(--text-main)', fontWeight: 700 } } } }}
                                    />
                                    <DatePicker
                                        label="END DATE"
                                        value={dateRange.end ? dayjs(dateRange.end) : null}
                                        onChange={(val) => setDateRange({ ...dateRange, end: val ? val.format('YYYY-MM-DD') : '' })}
                                        slotProps={{ textField: { size: 'small', fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '12px', background: 'white' }, '& .MuiOutlinedInput-input': { color: 'var(--text-main)', fontWeight: 700 } } } }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: TRANSACTIONS TABLE */}
                <div className="spending-main-content">
                    <div className="content-meta-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'white', padding: '1rem 1.5rem', borderRadius: '1.25rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div className="badge-status">
                            <div className="dot-pulse"></div>
                            <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{filteredSpending.length}</span> TRANSACTIONS FOUND
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => { setSearch(''); setSelectedCat('ALL'); setSelectedSub('ALL'); setPeriod('THIS MONTH'); setDateRange({ start: '', end: '' }); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(14,165,233,0.08))', color: '#4f46e5', border: '1px solid rgba(79,70,229,0.1)', padding: '0.55rem 1.1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                                <X size={14} /> CLEAR FILTERS
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={handleExportCSV}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,113,227,0.08)', color: '#0071e3', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                                <Download size={14} /> EXPORT CSV
                            </motion.button>
                        </div>
                    </div>

                    <div className="data-table-premium scroll-y-luxury">
                        {(() => {
                            const grouped = filteredSpending.reduce((acc, curr) => {
                                if (!acc[curr.date]) acc[curr.date] = [];
                                acc[curr.date].push(curr);
                                return acc;
                            }, {});
                            const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

                            if (dates.length === 0) return (
                                <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-dim)', fontWeight: 800 }}>
                                    No entries matching your filter criteria.
                                </div>
                            );

                            return dates.map(date => {
                                const dayTotal = grouped[date].reduce((sum, s) => sum + s.amount, 0);
                                return (
                                    <div key={date} className="date-group">
                                        <div className="date-header-luxury">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <Calendar size={14} color="var(--primary)" />
                                                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{date}</span>
                                            </div>
                                            <div style={{ fontWeight: 900, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                                Total: <span style={{ color: 'var(--success)' }}>{formatCurrency(dayTotal)}</span>
                                            </div>
                                        </div>
                                        <div className="date-transactions">
                                            {grouped[date].map((s, idx) => {
                                                const catStyle = getCatStyle(s.category);
                                                return (
                                                    <div key={idx} className="transaction-row-fancy">
                                                        <div style={{ marginRight: '1rem', width: '32px', height: '32px', borderRadius: '8px', background: catStyle.bg, display: 'grid', placeItems: 'center' }}>
                                                            {getIcon(s.category)}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.description}</div>
                                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>{s.sub_category}</div>
                                                        </div>
                                                        <div style={{ width: '130px', textAlign: 'center' }}>
                                                            <span style={{ padding: '0.35rem 0.75rem', background: catStyle.bg, color: catStyle.color, borderRadius: '50px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                                                {s.category}
                                                            </span>
                                                        </div>
                                                        <div style={{ width: '120px', textAlign: 'right', fontWeight: 900, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                                                            {formatCurrency(s.amount)}
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
        </motion.div>
    );
}
